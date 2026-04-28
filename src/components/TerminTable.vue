<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { formatDate } from '../utils/date';

const props = defineProps({
  termine: {
    type: Array,
    required: true
  },
  gruppeOptions: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['delete-termin', 'discard-local-data', 'export-ical']);
</script>

<template>
    <div class="hidden md:block bg-white shadow-sm border rounded-lg overflow-hidden mb-6">
      <DataTable 
        :value="termine" 
        class="p-datatable-sm" 
        scrollable 
        tableStyle="min-width: 80rem"
        paginator 
        :rows="10" 
        :rowsPerPageOptions="[5, 10, 20, 50]"
        removableSort
      >
        <Column field="datum" header="Datum" style="width: 250px" sortable>
          <template #body="slotProps">
            <DatePicker v-model="slotProps.data.datumDate" @date-select="slotProps.data.datum = formatDate(slotProps.data.datumDate)" showTime hourFormat="24" fluid />
          </template>
        </Column>
        <Column field="name" header="Name" sortable>
          <template #body="slotProps">
            <InputText v-model="slotProps.data.name" fluid :invalid="slotProps.data.name.length < 3" />
          </template>
        </Column>
        <Column field="veranstalter" header="Veranstalter" sortable>
          <template #body="slotProps">
            <InputText v-model="slotProps.data.veranstalter" fluid :invalid="!slotProps.data.veranstalter" />
          </template>
        </Column>
        <Column field="Gruppe" header="Gruppe" style="width: 150px" sortable>
          <template #body="slotProps">
            <Select v-model="slotProps.data.Gruppe" :options="gruppeOptions" fluid />
          </template>
        </Column>
        <Column field="ort" header="Ort" style="width: 200px" sortable>
          <template #body="slotProps">
            <InputText v-model="slotProps.data.ort" fluid />
          </template>
        </Column>
        <Column field="dauer" header="Dauer" style="width: 100px" sortable>
          <template #body="slotProps">
            <InputText v-model="slotProps.data.dauer" type="number" fluid />
          </template>
        </Column>
        <Column style="width: 10rem">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <span>Aktion</span>
              <Button icon="fa fa-refresh" text severity="warn" @click="$emit('discard-local-data')" size="small" />
            </div>
          </template>
          <template #body="slotProps">
            <div class="flex gap-1">
              <Button icon="fa fa-calendar-plus" text @click="$emit('export-ical', slotProps.data)" v-tooltip.top="'Kalender Export'" />
              <Button icon="fa fa-trash" severity="danger" text @click="$emit('delete-termin', slotProps.data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-4 mb-6">
      <div class="flex justify-between items-center px-1 mb-2">
          <span class="text-sm font-semibold text-gray-500 uppercase tracking-wider ml-1">Termine</span>
          <Button label="Neu laden" icon="fa fa-refresh" text severity="warn" size="small" @click="$emit('discard-local-data')" />
      </div>
      <div v-for="termin in termine" :key="termin.id" class="bg-white p-4 shadow-sm border rounded-lg">
          <div class="flex justify-between items-start mb-3 border-b pb-2">
              <div class="flex flex-col gap-1">
                  <span class="text-xs font-bold text-red-600 uppercase tracking-tight">ID: {{ termin.id }}</span>
                  <div class="flex gap-2 items-center">
                    <Select v-model="termin.Gruppe" :options="gruppeOptions" class="p-select-sm !w-24" />
                    <Button icon="fa fa-calendar-plus" text size="small" @click="$emit('export-ical', termin)" />
                  </div>
              </div>
              <Button icon="fa fa-trash" severity="danger" text @click="$emit('delete-termin', termin.id)" />
          </div>
          
          <div class="space-y-4">
              <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-gray-500 ml-1">Datum</label>
                  <DatePicker v-model="termin.datumDate" @date-select="termin.datum = formatDate(termin.datumDate)" showTime hourFormat="24" fluid />
              </div>
              <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-gray-500 ml-1">Name</label>
                  <InputText v-model="termin.name" fluid :invalid="termin.name.length < 3" />
              </div>
              <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-gray-500 ml-1">Veranstalter</label>
                  <InputText v-model="termin.veranstalter" fluid :invalid="!termin.veranstalter" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-500 ml-1">Ort</label>
                    <InputText v-model="termin.ort" fluid size="small" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs font-semibold text-gray-500 ml-1">Dauer</label>
                    <InputText v-model="termin.dauer" type="number" fluid size="small" />
                </div>
              </div>
          </div>
      </div>
      <div v-if="termine.length === 0" class="text-center py-8 bg-white rounded-lg border border-dashed text-gray-400">
          Keine Termine vorhanden.
      </div>
    </div>
</template>

<style scoped>
:deep(.p-datatable-thead > tr > th) {
    background-color: var(--p-red-50);
    color: var(--p-red-600);
    font-weight: 600;
}
</style>
