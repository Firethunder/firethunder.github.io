<script setup>
import { ref, onMounted, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const data = ref({
  termine: [],
  stand: '',
  gruppen: { A: [], B: [] }
});

const gruppeOptions = ref(['Alle', 'Zug', 'HoSi']);

const newTermin = ref({
  datum: null,
  name: '',
  veranstalter: '',
  Gruppe: 'Alle'
});

const jsonOutput = ref('');

onMounted(async () => {
  try {
    const response = await fetch('./termine.json');
    const jsonData = await response.json();
    
    // Normalize Gruppe field as per legacy script
    jsonData.termine = jsonData.termine.map(t => ({
      ...t,
      Gruppe: t.Gruppe || t.gruppe || "Alle",
      // Convert string date to Date object for DatePicker
      datumDate: t.datum ? new Date(t.datum.replace(/-/g, '/')) : null
    }));
    
    data.value = jsonData;
  } catch (error) {
    console.error('Error loading data:', error);
    toast.add({ severity: 'error', summary: 'Fehler', detail: 'Daten konnten nicht geladen werden', life: 3000 });
  }
});

const maxId = computed(() => {
  return Math.max(0, ...data.value.termine.map(t => parseInt(t.id) || 0));
});

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => n.toString().padStart(2, '0');
  // Internal/Legacy Format: YYYY-MM-DD HH:mm:ss
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const displayDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => n.toString().padStart(2, '0');
  // German Display Format: DD.MM.YYYY HH:mm
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const addTermin = () => {
  if (!newTermin.value.datum || !newTermin.value.name) {
    toast.add({ severity: 'warn', summary: 'Warnung', detail: 'Datum und Name sind erforderlich', life: 3000 });
    return;
  }

  const termin = {
    id: maxId.value + 1,
    datum: formatDate(newTermin.value.datum),
    datumDate: newTermin.value.datum,
    name: newTermin.value.name,
    veranstalter: newTermin.value.veranstalter,
    Gruppe: newTermin.value.Gruppe,
    send: "0"
  };

  data.value.termine.push(termin);

  // Reset form
  newTermin.value = {
    datum: null,
    name: '',
    veranstalter: '',
    Gruppe: 'Alle'
  };
  
  toast.add({ severity: 'success', summary: 'Erfolg', detail: 'Termin hinzugefügt', life: 3000 });
};

const deleteTermin = (id) => {
  data.value.termine = data.value.termine.filter(t => t.id !== id);
  toast.add({ severity: 'info', summary: 'Info', detail: 'Termin gelöscht', life: 3000 });
};

const showJson = () => {
  jsonOutput.value = JSON.stringify(data.value, null, 2);
};

const downloadJson = () => {
  const outputData = { 
    ...data.value, 
    stand: formatDate(new Date()),
    termine: data.value.termine.map(({ datumDate, ...t }) => t) // Remove datumDate before export
  };
  
  const blob = new Blob([JSON.stringify(outputData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "termine.json";
  a.click();
  URL.revokeObjectURL(url);
  toast.add({ severity: 'success', summary: 'Download', detail: 'JSON wurde heruntergeladen', life: 3000 });
};
</script>

<template>
  <Toast />
  <div class="p-4 max-w-7xl mx-auto min-h-screen bg-gray-50 text-gray-900 font-sans">
    <h1 class="text-3xl font-bold text-red-700 mb-6 flex items-center gap-2 border-b pb-2">
      <i class="fa fa-fire text-red-600"></i> Termin-Erfassungsmaske
    </h1>

    <div class="bg-white shadow-sm border rounded-lg overflow-hidden mb-6">
      <DataTable 
        :value="data.termine" 
        class="p-datatable-sm" 
        scrollable 
        tableStyle="min-width: 60rem"
      >
        <Column field="datum" header="Datum" style="width: 250px">
          <template #body="slotProps">
            <DatePicker v-model="slotProps.data.datumDate" @date-select="slotProps.data.datum = formatDate(slotProps.data.datumDate)" showTime hourFormat="24" fluid />
          </template>
        </Column>
        <Column field="name" header="Name">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.name" fluid />
          </template>
        </Column>
        <Column field="veranstalter" header="Veranstalter">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.veranstalter" fluid />
          </template>
        </Column>
        <Column field="Gruppe" header="Gruppe" style="width: 150px">
          <template #body="slotProps">
            <Select v-model="slotProps.data.Gruppe" :options="gruppeOptions" fluid />
          </template>
        </Column>
        <Column header="Aktion" style="width: 4rem">
          <template #body="slotProps">
            <Button icon="fa fa-trash" severity="danger" text @click="deleteTermin(slotProps.data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <div class="bg-white p-6 shadow-sm border rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-700">Neuen Termin hinzufügen</h2>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-500 ml-1">Datum</label>
          <DatePicker v-model="newTermin.datum" placeholder="Datum auswählen" showTime hourFormat="24" fluid />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-500 ml-1">Name</label>
          <InputText v-model="newTermin.name" placeholder="Einsatzübung..." fluid />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-500 ml-1">Veranstalter</label>
          <InputText v-model="newTermin.veranstalter" placeholder="FFW..." fluid />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-500 ml-1">Gruppe</label>
          <Select v-model="newTermin.Gruppe" :options="gruppeOptions" placeholder="Gruppe" fluid />
        </div>
        <div class="flex items-end">
          <Button label="Hinzufügen" icon="fa fa-plus" @click="addTermin" fluid class="h-10" />
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center mb-12">
      <div class="flex gap-2">
        <Button label="Zeige JSON" severity="secondary" @click="showJson" icon="fa fa-code" />
        <Button label="JSON Download" severity="primary" @click="downloadJson" icon="fa fa-download" />
      </div>
      <div class="text-sm text-gray-500 bg-white px-3 py-1 border rounded-full shadow-sm">
        Letzter Stand: {{ data.stand || 'Unbekannt' }}
      </div>
    </div>

    <div v-if="jsonOutput" class="mt-6">
        <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium text-gray-700 ml-1">JSON Vorschau</h3>
            <Button icon="fa fa-times" text severity="secondary" @click="jsonOutput = ''" />
        </div>
        <pre class="p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto max-h-96 text-xs font-mono shadow-inner border border-gray-700">{{ jsonOutput }}</pre>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles */
:deep(.p-datatable-thead > tr > th) {
    background-color: #fef2f2;
    color: #dc2626;
    font-weight: 600;
}

:deep(.p-datepicker) {
    font-family: 'Inter', sans-serif;
}
</style>
