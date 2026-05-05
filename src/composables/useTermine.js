import { onMounted } from "vue";
import { useTermineStore } from "./useTermineStore";
import { useGCalSync } from "./useGCalSync";
import { useTermineExport } from "./useTermineExport";
import { useTermineForm } from "./useTermineForm";

export function useTermine(toast, confirm) {
  const store = useTermineStore();
  const gcal = useGCalSync(toast);
  const exporter = useTermineExport(toast);
  const form = useTermineForm(toast);

  // Persistence & Initial Sync logic
  onMounted(async () => {
    if (store.data.value.termine.length === 0) {
      await store.discardLocalData(confirm, toast);
    } else {
      store.rehydrateDates();
    }
    
    // Auto-sync Google Calendar on load
    await gcal.syncFromGCal(true);
  });

  return {
    // From Store
    data: store.data,
    isLoading: store.isLoading,
    gruppeOptions: store.gruppeOptions,
    sortedTermine: store.sortedTermine,
    deleteTermin: (id) => store.deleteTermin(id, confirm, toast),
    discardLocalData: () => store.discardLocalData(confirm, toast),
    
    // From GCal
    syncFromGCal: gcal.syncFromGCal,
    
    // From Export
    jsonOutput: exporter.jsonOutput,
    showJson: exporter.showJson,
    downloadJson: exporter.downloadJson,
    downloadIcal: exporter.downloadIcal,
    downloadAllIcal: exporter.downloadAllIcal,
    
    // From Form
    newTermin: form.newTermin,
    validationErrors: form.validationErrors,
    addTermin: form.addTermin,
  };
}
