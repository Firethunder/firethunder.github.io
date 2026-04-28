import { ref, computed, watch, onMounted } from 'vue';
import { useStorage } from '@vueuse/core';
import { terminSchema, appDataSchema } from '../utils/validation';
import { formatDate, remoteStandString } from '../utils/date';
import { generateIcalBlob } from '../utils/ical';

export function useTermine(toast, confirm) {
  const data = useStorage('ffwtool-state', {
    termine: [],
    stand: '',
    Gruppen: { A: [], B: [] },
    defaultOrt: 'Brittheim',
    defaultDauer: 120
  });

  const gruppeOptions = ref(['Alle', 'Zug', 'Hosi', 'Jugend']);

  const newTermin = ref({
    datum: null,
    name: '',
    veranstalter: '',
    Gruppe: 'Alle',
    ort: data.value.defaultOrt || 'Brittheim',
    dauer: data.value.defaultDauer || 120
  });

  const jsonOutput = ref('');
  const validationErrors = ref({});
  const isLoading = ref(false);

  // Watch for changes in defaults to update newTermin initialization
  watch(() => data.value.defaultOrt, (val) => {
    if (!newTermin.value.ort || newTermin.value.ort === 'Isingen') {
       newTermin.value.ort = val;
    }
  });
  
  watch(() => data.value.defaultDauer, (val) => {
    if (newTermin.value.dauer === 120) {
       newTermin.value.dauer = val;
    }
  });

  const loadRemoteData = async () => {
    try {
      const response = await fetch('termine.json');
      const rawData = await response.json();
      
      if (rawData.termine && Array.isArray(rawData.termine)) {
        rawData.termine = rawData.termine.map(t => ({
          ...t,
          id: t.id ?? 0,
          datum: t.datum ?? "",
          name: t.name ?? "Unbenannt",
          veranstalter: t.veranstalter ?? "Unbekannt",
          Gruppe: t.Gruppe ?? t.gruppe ?? "Alle",
          ort: t.ort ?? data.value.defaultOrt,
          dauer: t.dauer ?? data.value.defaultDauer,
          send: t.send ?? "0"
        }));
      }

      const result = appDataSchema.safeParse(rawData);
      if (!result.success) {
        console.error('Schema validation failed:', result.error);
        return null;
      }
      return result.data;
    } catch (error) {
      console.error('Error fetching remote data:', error);
      return null;
    }
  };

  onMounted(async () => {
    isLoading.value = true;
    // Simulated delay for visual verification of loading state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const remoteData = await loadRemoteData();
    
    if (!remoteData) {
      if (!data.value.termine || data.value.termine.length === 0) {
        toast?.add({ severity: 'error', summary: 'Fehler', detail: 'Daten konnten nicht geladen werden', life: 3000 });
      }
      isLoading.value = false;
      return;
    }

    const remoteStand = remoteData.stand ? new Date(remoteStandString(remoteData.stand)) : new Date(0);
    const localStand = data.value.stand ? new Date(remoteStandString(data.value.stand)) : new Date(0);

    if (!data.value.termine || data.value.termine.length === 0 || remoteStand > localStand) {
      const remoteIds = new Set(remoteData.termine.map(t => parseInt(t.id)));
      const localOnlyTermine = data.value.termine.filter(t => !remoteIds.has(parseInt(t.id)));
      
      const mergedTermine = [
        ...remoteData.termine.map(t => ({
          ...t,
          datumDate: t.datum ? new Date(t.datum.replace(/-/g, '/')) : null,
          ort: t.ort ?? data.value.defaultOrt,
          dauer: t.dauer ?? data.value.defaultDauer
        })),
        ...localOnlyTermine
      ];

      data.value = {
        ...data.value,
        ...remoteData,
        termine: mergedTermine
      };
      
      if (data.value.termine.length > 0 && localStand > new Date(0) && remoteStand > localStand) {
          toast?.add({ severity: 'info', summary: 'Aktualisierung', detail: 'Neue Daten vom Server geladen und zusammengeführt.', life: 5000 });
      }
    }
    isLoading.value = false;
  });

  const maxId = computed(() => {
    return Math.max(0, ...data.value.termine.map(t => parseInt(t.id) || 0));
  });

  const validateForm = () => {
    const payload = {
      id: maxId.value + 1,
      datum: formatDate(newTermin.value.datum),
      name: newTermin.value.name,
      veranstalter: newTermin.value.veranstalter,
      Gruppe: newTermin.value.Gruppe,
      ort: newTermin.value.ort || data.value.defaultOrt,
      dauer: newTermin.value.dauer || data.value.defaultDauer,
      send: "0"
    };

    const result = terminSchema.safeParse(payload);

    if (!result.success) {
      const errors = {};
      result.error.issues.forEach(issue => {
        errors[issue.path[0]] = issue.message;
      });
      validationErrors.value = errors;
      return null;
    }

    validationErrors.value = {};
    return { ...result.data, datumDate: newTermin.value.datum };
  };

  const addTermin = () => {
    const validatedTermin = validateForm();
    
    if (!validatedTermin) {
      toast?.add({ severity: 'warn', summary: 'Validierungsfehler', detail: 'Bitte prüfen Sie Ihre Eingaben', life: 3000 });
      return;
    }

    data.value.termine.push(validatedTermin);
    data.value.stand = formatDate(new Date());

    newTermin.value = {
      datum: null,
      name: '',
      veranstalter: '',
      Gruppe: 'Alle',
      ort: data.value.defaultOrt,
      dauer: data.value.defaultDauer
    };
    validationErrors.value = {};
    
    toast?.add({ severity: 'success', summary: 'Erfolg', detail: 'Termin hinzugefügt', life: 3000 });
  };

  const deleteTermin = (id) => {
    confirm?.require({
      message: 'Möchten Sie diesen Termin wirklich löschen?',
      header: 'Löschen bestätigen',
      icon: 'fa fa-exclamation-triangle',
      rejectLabel: 'Abbrechen',
      acceptLabel: 'Löschen',
      rejectProps: {
          severity: 'secondary',
          outlined: true
      },
      acceptProps: {
          severity: 'danger'
      },
      accept: () => {
        data.value.termine = data.value.termine.filter(t => t.id !== id);
        data.value.stand = formatDate(new Date());
        toast?.add({ severity: 'info', summary: 'Info', detail: 'Termin gelöscht', life: 3000 });
      }
    });
  };

  const discardLocalData = () => {
    confirm?.require({
      message: 'Möchten Sie alle lokalen Änderungen verwerfen und die Daten vom Server neu laden?',
      header: 'Lokale Daten verwerfen',
      icon: 'fa fa-refresh',
      rejectLabel: 'Abbrechen',
      acceptLabel: 'Neu laden',
      rejectProps: {
          severity: 'secondary',
          outlined: true
      },
      acceptProps: {
          severity: 'warn'
      },
      accept: async () => {
        isLoading.value = true;
        const remoteData = await loadRemoteData();
        if (remoteData) {
          data.value = {
            ...data.value,
            ...remoteData,
            termine: remoteData.termine.map(t => ({
              ...t,
              datumDate: t.datum ? new Date(t.datum.replace(/-/g, '/')) : null,
              ort: t.ort ?? data.value.defaultOrt,
              dauer: t.dauer ?? data.value.defaultDauer
            }))
          };
          toast?.add({ severity: 'success', summary: 'Neu geladen', detail: 'Lokale Daten wurden verworfen.', life: 3000 });
        } else {
          toast?.add({ severity: 'error', summary: 'Fehler', detail: 'Daten konnten nicht geladen werden.', life: 3000 });
        }
        isLoading.value = false;
      }
    });
  };

  const getSanitizedData = () => {
    data.value.stand = formatDate(new Date());
    // Strip ort and dauer for backward compatible JSON export
    // We intentionally do NOT use appDataSchema here because it would re-insert defaults
    const sanitizedTermine = data.value.termine.map(({ datumDate, ort, dauer, ...t }) => t);
    
    return { 
      termine: sanitizedTermine,
      stand: data.value.stand,
      Gruppen: data.value.Gruppen
    };
  };

  const showJson = () => {
    const outputData = getSanitizedData();
    jsonOutput.value = JSON.stringify(outputData, null, 2);
  };

  const downloadJson = () => {
    const outputData = getSanitizedData();
    const blob = new Blob([JSON.stringify(outputData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "termine.json";
    a.click();
    URL.revokeObjectURL(url);
    toast?.add({ severity: 'success', summary: 'Download', detail: 'JSON wurde heruntergeladen', life: 3000 });
  };

  const downloadIcal = (termin) => {
    try {
      generateIcalBlob(termin, `${termin.name.replace(/\s/g, '_')}.ics`);
      toast?.add({ severity: 'success', summary: 'iCal Download', detail: `Termin "${termin.name}" exportiert`, life: 3000 });
    } catch (error) {
      toast?.add({ severity: 'error', summary: 'Export Fehler', detail: 'Termin konnte nicht exportiert werden.', life: 3000 });
    }
  };

  const downloadAllIcal = () => {
    try {
      const exportData = data.value.termine.map(({ datumDate, ...t }) => t);
      generateIcalBlob(exportData, 'termine.ics');
      toast?.add({ severity: 'success', summary: 'iCal Download', detail: 'Alle Termine exportiert', life: 3000 });
    } catch (error) {
      toast?.add({ severity: 'error', summary: 'Export Fehler', detail: 'Termine konnten nicht exportiert werden.', life: 3000 });
    }
  };

  const sortedTermine = computed(() => {
    return [...data.value.termine].sort((a, b) => {
      // Sort by datum descending
      const dateA = new Date(remoteStandString(a.datum));
      const dateB = new Date(remoteStandString(b.datum));
      
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
      
      // If dates are equal, sort by id descending
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
    showJson,
    downloadJson,
    downloadIcal,
    downloadAllIcal
  };
}
