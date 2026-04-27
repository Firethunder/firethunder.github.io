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

const emit = defineEmits(['delete-termin']);
</script>

<template>
    <div class="hidden md:block bg-white shadow-sm border rounded-lg overflow-hidden mb-6">
      <DataTable 
        :value="termine" 
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
            <InputText v-model="slotProps.data.name" fluid :invalid="slotProps.data.name.length < 3" />
          </template>
        </Column>
        <Column field="veranstalter" header="Veranstalter">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.veranstalter" fluid :invalid="!slotProps.data.veranstalter" />
          </template>
        </Column>
        <Column field="Gruppe" header="Gruppe" style="width: 150px">
          <template #body="slotProps">
            <Select v-model="slotProps.data.Gruppe" :options="gruppeOptions" fluid />
          </template>
        </Column>
        <Column header="Aktion" style="width: 4rem">
          <template #body="slotProps">
            <Button icon="fa fa-trash" severity="danger" text @click="$emit('delete-termin', slotProps.data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Mobile Card View -->
    <div class="md:hidden space-y-4 mb-6">
      <div v-for="termin in termine" :key="termin.id" class="bg-white p-4 shadow-sm border rounded-lg">
          <div class="flex justify-between items-start mb-3 border-b pb-2">
              <div class="flex flex-col gap-1">
                  <span class="text-xs font-bold text-red-600 uppercase tracking-tight">ID: {{ termin.id }}</span>
                  <Select v-model="termin.Gruppe" :options="gruppeOptions" class="p-select-sm !w-32" />
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
