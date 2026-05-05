import { computed, ref } from "vue";
import { useStorage } from "@vueuse/core";
import { formatDate, remoteStandString } from "../utils/date";

// Shared state (Singleton pattern)
const data = useStorage("ffwtool-state", {
  termine: [],
  stand: "",
  Gruppen: { A: [], B: [] },
  defaultOrt: "Brittheim",
  defaultDauer: 120,
  lastSync: "",
});

const isLoading = ref(false);
const gruppeOptions = ref(["Alle", "Zug", "Hosi", "Jugend"]);

export function useTermineStore() {
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

  const deleteTermin = (id, confirm, toast) => {
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

  const discardLocalData = async (confirm, toast) => {
    confirm?.require({
      message:
        "Möchten Sie alle lokalen Änderungen verwerfen und die Daten vom Server neu laden?",
      header: "Daten neu laden",
      icon: "pi pi-refresh",
      accept: async () => {
        isLoading.value = true;
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

  const rehydrateDates = () => {
    data.value.termine = data.value.termine.map((t) => ({
      ...t,
      datumDate: t.datum ? new Date(t.datum.replace(/-/g, "/")) : null,
    }));
  };

  return {
    data,
    isLoading,
    gruppeOptions,
    sortedTermine,
    deleteTermin,
    discardLocalData,
    rehydrateDates,
  };
}
