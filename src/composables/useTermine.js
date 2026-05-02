import { ref, computed, watch, onMounted } from "vue";
import { useStorage } from "@vueuse/core";
import { terminSchema, appDataSchema } from "../utils/validation";
import { formatDate, remoteStandString } from "../utils/date";
import { generateIcalBlob } from "../utils/ical";
import { syncGoogleCalendar, mergeGCalTermine } from "../utils/gcal";

export function useTermine(toast, confirm) {
  const data = useStorage("ffwtool-state", {
    termine: [],
    stand: "",
    Gruppen: { A: [], B: [] },
    defaultOrt: "Brittheim",
    defaultDauer: 120,
    lastSync: "",
  });

  const gruppeOptions = ref(["Alle", "Zug", "Hosi", "Jugend"]);

  const newTermin = ref({
    datum: "",
    datumDate: null,
    name: "",
    veranstalter: "Alle", // Updated default
    Gruppe: "Alle",
    ort: data.value.defaultOrt || "Brittheim",
    dauer: data.value.defaultDauer || 120,
  });

  const jsonOutput = ref("");
  const validationErrors = ref({});
  const isLoading = ref(false);

  // Persistence logic
  onMounted(async () => {
    if (data.value.termine.length === 0) {
      await discardLocalData();
    } else {
      // Re-hydrate dates
      data.value.termine = data.value.termine.map((t) => ({
        ...t,
        datumDate: t.datum ? new Date(t.datum.replace(/-/g, "/")) : null,
      }));
    }
    
    // Auto-sync Google Calendar on load
    await syncFromGCal(true);
  });

  const addTermin = () => {
    try {
      const validated = terminSchema.parse(newTermin.value);
      const maxId = Math.max(0, ...data.value.termine.map((t) => t.id));
      data.value.termine.push({
        ...validated,
        id: maxId + 1,
        datumDate: newTermin.value.datumDate,
      });

      // Reset form
      newTermin.value = {
        datum: "",
        datumDate: null,
        name: "",
        veranstalter: "Alle",
        Gruppe: "Alle",
        ort: data.value.defaultOrt || "Brittheim",
        dauer: data.value.defaultDauer || 120,
      };
      validationErrors.value = {};
      data.value.stand = formatDate(new Date());

      toast?.add({
        severity: "success",
        summary: "Hinzugefügt",
        detail: "Termin wurde gespeichert",
        life: 3000,
      });
    } catch (err) {
      if (err.errors) {
        validationErrors.value = err.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
      }
    }
  };

  const deleteTermin = (id) => {
    confirm?.require({
      message: "Möchten Sie diesen Termin wirklich löschen?",
      header: "Löschen bestätigen",
      icon: "pi pi-exclamation-triangle",
      rejectLabel: "Abbrechen",
      acceptLabel: "Löschen",
      rejectProps: {
        label: "Abbrechen",
        severity: "secondary",
        outlined: true,
      },
      acceptProps: {
        label: "Löschen",
        severity: "danger",
      },
      accept: () => {
        data.value.termine = data.value.termine.filter((t) => t.id !== id);
        data.value.stand = formatDate(new Date());
        toast?.add({
          severity: "info",
          summary: "Gelöscht",
          detail: "Termin wurde entfernt",
          life: 3000,
        });
      },
    });
  };

  const discardLocalData = async () => {
    confirm?.require({
      message:
        "Möchten Sie alle lokalen Änderungen verwerfen und die Daten vom Server neu laden?",
      header: "Daten neu laden",
      icon: "pi pi-refresh",
      accept: async () => {
        isLoading.value = true;
        // Using absolute path to avoid issues with subdirectories like /ffwtool/
        const response = await fetch("/ffwtool/termine.json");
        if (response.ok) {
          try {
            const remoteData = await response.json();
            data.value = {
              ...data.value,
              ...remoteData,
              termine: remoteData.termine.map((t) => ({
                ...t,
                datumDate: t.datum ? new Date(t.datum.replace(/-/g, "/")) : null,
                ort: t.ort || data.value.defaultOrt, 
                dauer: t.dauer || data.value.defaultDauer, 
              })),
            };
            toast?.add({
              severity: "success",
              summary: "Neu geladen",
              detail: "Lokale Daten wurden verworfen.",
              life: 3000,
            });
          } catch (jsonErr) {
            console.error('JSON parsing failed:', jsonErr);
            toast?.add({
              severity: "error",
              summary: "Fehler",
              detail: "Datenformat ist ungültig.",
              life: 3000,
            });
          }
        } else {
          toast?.add({
            severity: "error",
            summary: "Fehler",
            detail: `Daten konnten nicht geladen werden (${response.status}).`,
            life: 3000,
          });
        }
        isLoading.value = false;
      },
    });
  };

  const syncFromGCal = async (silent = false) => {
    if (!silent) isLoading.value = true;
    try {
      const gcalTermine = await syncGoogleCalendar(data.value.defaultOrt, data.value.defaultDauer);
      if (gcalTermine.length === 0) {
        if (!silent) toast?.add({ severity: 'info', summary: 'GCal Sync', detail: 'Keine Termine im Google Kalender gefunden.', life: 3000 });
        return;
      }

      // Track additions and updates
      let addedCount = 0;
      let updatedCount = 0;
      
      const merged = mergeGCalTermine(data.value.termine, gcalTermine);

      // Assign IDs to new entries and count changes
      let currentMaxId = Math.max(0, ...data.value.termine.map((t) => parseInt(t.id) || 0));
      
      const finalizedFinal = merged.map(t => {
         const existingIndex = data.value.termine.findIndex(l => (t.external_id && l.external_id === t.external_id) || (l.datum === t.datum && l.name === t.name));
         
         if (existingIndex === -1) {
            addedCount++;
            currentMaxId++;
            return {
               ...t,
               id: currentMaxId,
               datumDate: t.datum ? new Date(t.datum.replace(/-/g, "/")) : null,
            };
         } else {
            const l = data.value.termine[existingIndex];
            const hasChanged = l.ort !== t.ort || l.dauer !== t.dauer || l.Gruppe !== t.Gruppe || l.veranstalter !== t.veranstalter;
            if (hasChanged) {
               updatedCount++;
            }
            return {
               ...t,
               id: l.id,
               datumDate: t.datum ? new Date(t.datum.replace(/-/g, "/")) : null,
            };
         }
      });

      if (addedCount === 0 && updatedCount === 0) {
         if (!silent) toast?.add({ severity: 'info', summary: 'GCal Sync', detail: 'Alle Termine sind bereits auf dem neuesten Stand.', life: 3000 });
      } else {
         data.value.termine = finalizedFinal;
         data.value.lastSync = new Date().toLocaleString("de-DE");
         data.value.stand = formatDate(new Date());

         if (!silent) {
            let detail = "";
            if (addedCount > 0) detail += `${addedCount} neu hinzugefügt. `;
            if (updatedCount > 0) detail += `${updatedCount} aktualisiert.`;
            toast?.add({ severity: 'success', summary: 'GCal Erfolg', detail: detail.trim(), life: 3000 });
         }
      }
    } catch (error) {
      console.error('GCal Sync failed:', error);
      if (!silent) toast?.add({ severity: 'error', summary: 'GCal Fehler', detail: 'Synchronisierung fehlgeschlagen.', life: 3000 });
    } finally {
      if (!silent) isLoading.value = false;
    }
  };

  const getSanitizedData = () => {
    data.value.stand = formatDate(new Date());
    const sanitizedTermine = data.value.termine.map(
      ({ datumDate, ...t }) => t
    );

    return {
      termine: sanitizedTermine,
      stand: data.value.stand,
      Gruppen: data.value.Gruppen,
    };
  };

  const showJson = () => {
    const outputData = getSanitizedData();
    jsonOutput.value = JSON.stringify(outputData, null, 2);
  };

  const downloadJson = () => {
    const outputData = getSanitizedData();
    const blob = new Blob([JSON.stringify(outputData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "termine.json";
    a.click();
    URL.revokeObjectURL(url);
    toast?.add({
      severity: "success",
      summary: "Download",
      detail: "JSON wurde heruntergeladen",
      life: 3000,
    });
  };

  const downloadIcal = (termin) => {
    try {
      generateIcalBlob(termin, `${termin.name.replace(/\s/g, "_")}.ics`);
      toast?.add({
        severity: "success",
        summary: "iCal Download",
        detail: `Termin "${termin.name}" exportiert`,
        life: 3000,
      });
    } catch (error) {
      toast?.add({
        severity: "error",
        summary: "Export Fehler",
        detail: "Termin konnte nicht exportiert werden.",
        life: 3000,
      });
    }
  };

  const downloadAllIcal = () => {
    try {
      const exportData = data.value.termine.map(({ datumDate, ...t }) => t);
      generateIcalBlob(exportData, "termine.ics");
      toast?.add({
        severity: "success",
        summary: "iCal Download",
        detail: "Alle Termine exportiert",
        life: 3000,
      });
    } catch (error) {
      toast?.add({
        severity: "error",
        summary: "Export Fehler",
        detail: "Termine konnten nicht exportiert werden.",
        life: 3000,
      });
    }
  };

  const sortedTermine = computed(() => {
    return [...data.value.termine].sort((a, b) => {
      const dateA = new Date(remoteStandString(a.datum));
      const dateB = new Date(remoteStandString(b.datum));

      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }

      return (parseInt(b.id) || 0) - (parseInt(a.id) || 0);
    });
  });

  return {
    data,
    sortedTermine,
    gruppeOptions,
    newTermin,
    jsonOutput,
    validationErrors,
    isLoading,
    addTermin,
    deleteTermin,
    discardLocalData,
    syncFromGCal,
    showJson,
    downloadJson,
    downloadIcal,
    downloadAllIcal,
  };
}
