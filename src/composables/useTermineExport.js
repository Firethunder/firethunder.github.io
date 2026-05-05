import { ref } from "vue";
import { useTermineStore } from "./useTermineStore";
import { formatDate } from "../utils/date";
import { generateIcalBlob } from "../utils/ical";

export function useTermineExport(toast) {
  const { data } = useTermineStore();
  const jsonOutput = ref("");

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

  return {
    jsonOutput,
    showJson,
    downloadJson,
    downloadIcal,
    downloadAllIcal,
  };
}
