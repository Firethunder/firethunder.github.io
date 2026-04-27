import { ref, computed, watch, onMounted } from 'vue';
import { useStorage } from '@vueuse/core';
import { terminSchema, appDataSchema } from '../utils/validation';
import { formatDate, remoteStandString } from '../utils/date';

export function useTermine(toast, confirm) {
  const data = useStorage('ffwtool-state', {
    termine: [],
    stand: '',
    Gruppen: { A: [], B: [] }
  });

  const gruppeOptions = ref(['Alle', 'Zug', 'Hosi']);

  const newTermin = ref({
    datum: null,
    name: '',
    veranstalter: '',
    Gruppe: 'Alle'
  });

  const jsonOutput = ref('');
  const validationErrors = ref({});

  watch(newTermin, () => {
    if (Object.keys(validationErrors.value).length > 0) {
      validateForm();
    }
  }, { deep: true });

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
    const remoteData = await loadRemoteData();
    
    if (!remoteData) {
      if (!data.value.termine || data.value.termine.length === 0) {
        toast?.add({ severity: 'error', summary: 'Fehler', detail: 'Daten konnten nicht geladen werden', life: 3000 });
      }
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
          datumDate: t.datum ? new Date(t.datum.replace(/-/g, '/')) : null
        })),
        ...localOnlyTermine
      ];

      data.value = {
        ...remoteData,
        termine: mergedTermine
      };
      
      if (data.value.termine.length > 0 && localStand > new Date(0) && remoteStand > localStand) {
          toast?.add({ severity: 'info', summary: 'Aktualisierung', detail: 'Neue Daten vom Server geladen und zusammengeführt.', life: 5000 });
      }
    }
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

    newTermin.value = {
      datum: null,
      name: '',
      veranstalter: '',
      Gruppe: 'Alle'
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
        const remoteData = await loadRemoteData();
        if (remoteData) {
          data.value = {
            ...remoteData,
            termine: remoteData.termine.map(t => ({
              ...t,
              datumDate: t.datum ? new Date(t.datum.replace(/-/g, '/')) : null
            }))
          };
          toast?.add({ severity: 'success', summary: 'Neu geladen', detail: 'Lokale Daten wurden verworfen.', life: 3000 });
        } else {
          toast?.add({ severity: 'error', summary: 'Fehler', detail: 'Daten konnten nicht geladen werden.', life: 3000 });
        }
      }
    });
  };

  const showJson = () => {
    const outputData = { 
      ...data.value, 
      stand: formatDate(new Date()),
      termine: data.value.termine.map(({ datumDate, ...t }) => t)
    };

    const result = appDataSchema.safeParse(outputData);
    if (!result.success) {
      toast?.add({ severity: 'error', summary: 'Validierungsfehler', detail: 'Die Daten enthalten ungültige Felder.', life: 5000 });
    }
    jsonOutput.value = JSON.stringify(outputData, null, 2);
  };

  const downloadJson = () => {
    const outputData = { 
      ...data.value, 
      stand: formatDate(new Date()),
      termine: data.value.termine.map(({ datumDate, ...t }) => t)
    };
    
    const result = appDataSchema.safeParse(outputData);
    if (!result.success) {
      console.error('Export validation failed:', result.error);
      toast?.add({ severity: 'error', summary: 'Export Fehler', detail: 'Die Daten sind ungültig (z.B. leere Felder) und können nicht exportiert werden.', life: 5000 });
      return;
    }

    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "termine.json";
    a.click();
    URL.revokeObjectURL(url);
    toast?.add({ severity: 'success', summary: 'Download', detail: 'JSON wurde heruntergeladen', life: 3000 });
  };

  return {
    data,
    gruppeOptions,
    newTermin,
    jsonOutput,
    validationErrors,
    addTermin,
    deleteTermin,
    discardLocalData,
    showJson,
    downloadJson
  };
}
