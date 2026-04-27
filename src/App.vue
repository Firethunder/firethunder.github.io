<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { z } from 'zod';

const toast = useToast();
const confirm = useConfirm();

// Validation Schemas
const terminSchema = z.object({
  id: z.union([z.number(), z.string().transform((val) => parseInt(val))]),
  datum: z.string().min(1, "Datum ist erforderlich"),
  name: z.string().min(3, "Name muss mindestens 3 Zeichen lang sein"),
  veranstalter: z.string().min(1, "Veranstalter ist erforderlich"),
  Gruppe: z.enum(['Alle', 'Zug', 'HoSi']).default("Alle"),
  send: z.union([z.string(), z.number().transform(val => val.toString())]).default("0")
});

const appDataSchema = z.object({
  termine: z.array(terminSchema),
  stand: z.string().optional().default(""),
  gruppen: z.record(z.any()).optional().default({ A: [], B: [] })
});

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
const validationErrors = ref({});

watch(newTermin, () => {
  if (Object.keys(validationErrors.value).length > 0) {
    validateForm();
  }
}, { deep: true });

onMounted(async () => {
  try {
    const response = await fetch('./termine.json');
    const rawData = await response.json();
    
    // Validate schema
    const result = appDataSchema.safeParse(rawData);
    
    if (!result.success) {
      console.error('Schema validation failed:', result.error);
      toast.add({ severity: 'error', summary: 'Ungültige Daten', detail: 'Die JSON-Datei entspricht nicht dem erwarteten Format', life: 5000 });
      // Initialize with safe empty structure
      data.value = { termine: [], stand: '', gruppen: { A: [], B: [] } };
      return;
    }

    const jsonData = result.data;
    
    // Normalize and add datumDate for UI
    jsonData.termine = jsonData.termine.map(t => ({
      ...t,
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
    toast.add({ severity: 'warn', summary: 'Validierungsfehler', detail: 'Bitte prüfen Sie Ihre Eingaben', life: 3000 });
    return;
  }

  data.value.termine.push(validatedTermin);

  // Reset form
  newTermin.value = {
    datum: null,
    name: '',
    veranstalter: '',
    Gruppe: 'Alle'
  };
  validationErrors.value = {};
  
  toast.add({ severity: 'success', summary: 'Erfolg', detail: 'Termin hinzugefügt', life: 3000 });
};

const deleteTermin = (id) => {
  confirm.require({
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
      toast.add({ severity: 'info', summary: 'Info', detail: 'Termin gelöscht', life: 3000 });
    }
  });
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
  
  // Validate before export
  const result = appDataSchema.safeParse(outputData);
  if (!result.success) {
    console.error('Export validation failed:', result.error);
    toast.add({ severity: 'error', summary: 'Export Fehler', detail: 'Die Daten sind ungültig und können nicht exportiert werden.', life: 5000 });
    return;
  }

  const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
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
  <ConfirmDialog />
  <div class="p-4 max-w-7xl mx-auto min-h-screen bg-gray-50 text-gray-900 font-sans">
    <h1 class="text-3xl font-bold text-red-700 mb-6 flex items-center gap-2 border-b pb-2">
      <i class="fa fa-fire text-red-600"></i> Termin-Erfassungsmaske
    </h1>

    <div class="hidden md:block bg-white shadow-sm border rounded-lg overflow-hidden mb-6">
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

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-4 mb-6">
      <div v-for="termin in data.termine" :key="termin.id" class="bg-white p-4 shadow-sm border rounded-lg">
          <div class="flex justify-between items-start mb-3 border-b pb-2">
              <div class="flex flex-col gap-1">
                  <span class="text-xs font-bold text-red-600 uppercase tracking-tight">ID: {{ termin.id }}</span>
                  <Select v-model="termin.Gruppe" :options="gruppeOptions" class="p-select-sm !w-32" />
              </div>
              <Button icon="fa fa-trash" severity="danger" text @click="deleteTermin(termin.id)" />
          </div>
          
          <div class="space-y-4">
              <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-gray-500 ml-1">Datum</label>
                  <DatePicker v-model="termin.datumDate" @date-select="termin.datum = formatDate(termin.datumDate)" showTime hourFormat="24" fluid />
              </div>
              <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-gray-500 ml-1">Name</label>
                  <InputText v-model="termin.name" fluid />
              </div>
              <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-gray-500 ml-1">Veranstalter</label>
                  <InputText v-model="termin.veranstalter" fluid />
              </div>
          </div>
      </div>
      <div v-if="data.termine.length === 0" class="text-center py-8 bg-white rounded-lg border border-dashed text-gray-400">
          Keine Termine vorhanden.
      </div>
    </div>

    <div class="bg-white p-6 shadow-sm border rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-700">Neuen Termin hinzufügen</h2>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-500 ml-1">Datum</label>
          <DatePicker v-model="newTermin.datum" placeholder="Datum auswählen" showTime hourFormat="24" fluid :invalid="!!validationErrors.datum" />
          <small v-if="validationErrors.datum" class="text-red-500 ml-1 text-xs">{{ validationErrors.datum }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-500 ml-1">Name</label>
          <InputText v-model="newTermin.name" placeholder="Einsatzübung..." fluid :invalid="!!validationErrors.name" />
          <small v-if="validationErrors.name" class="text-red-500 ml-1 text-xs">{{ validationErrors.name }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-500 ml-1">Veranstalter</label>
          <InputText v-model="newTermin.veranstalter" placeholder="FFW..." fluid :invalid="!!validationErrors.veranstalter" />
          <small v-if="validationErrors.veranstalter" class="text-red-500 ml-1 text-xs">{{ validationErrors.veranstalter }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-500 ml-1">Gruppe</label>
          <Select v-model="newTermin.Gruppe" :options="gruppeOptions" placeholder="Gruppe" fluid :invalid="!!validationErrors.Gruppe" />
          <small v-if="validationErrors.Gruppe" class="text-red-500 ml-1 text-xs">{{ validationErrors.Gruppe }}</small>
        </div>
        <div class="flex items-end">
          <Button label="Hinzufügen" icon="fa fa-plus" @click="addTermin" fluid class="h-10 font-semibold" />
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
      <div class="flex gap-2 w-full md:w-auto">
        <Button label="Zeige JSON" severity="secondary" @click="showJson" icon="fa fa-code" class="flex-1 md:flex-none" />
        <Button label="JSON Download" severity="primary" @click="downloadJson" icon="fa fa-download" class="flex-1 md:flex-none" />
      </div>
      <div class="text-sm text-gray-500 bg-white px-3 py-1 border rounded-full shadow-sm w-full md:w-auto text-center">
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
    background-color: var(--p-red-50);
    color: var(--p-red-600);
    font-weight: 600;
}

:deep(.p-datepicker) {
    font-family: 'Inter', sans-serif;
}
</style>
