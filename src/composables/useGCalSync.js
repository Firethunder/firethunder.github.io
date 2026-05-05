import { useTermineStore } from "./useTermineStore";
import { syncGoogleCalendar, mergeGCalTermine } from "../utils/gcal";
import { formatDate } from "../utils/date";

export function useGCalSync(toast) {
  const { data, isLoading } = useTermineStore();

  const syncFromGCal = async (silent = false) => {
    if (!silent) isLoading.value = true;
    try {
      const gcalTermine = await syncGoogleCalendar(data.value.defaultOrt, data.value.defaultDauer);
      if (gcalTermine.length === 0) {
        if (!silent) toast?.add({ severity: 'info', summary: 'GCal Sync', detail: 'Keine Termine im Google Kalender gefunden.', life: 3000 });
        return;
      }

      let addedCount = 0;
      let updatedCount = 0;
      
      const merged = mergeGCalTermine(data.value.termine, gcalTermine);
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

  return {
    syncFromGCal,
  };
}
