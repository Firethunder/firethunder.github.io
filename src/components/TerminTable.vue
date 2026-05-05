<script setup>
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import DatePicker from "primevue/datepicker";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Button from "primevue/button";
import { formatDate } from "../utils/date";
import TerminCardList from "./TerminCardList.vue";

const props = defineProps({
  termine: {
    type: Array,
    required: true,
  },
  gruppeOptions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["delete-termin", "discard-local-data", "export-ical"]);
</script>

<template>
  <div
    class="hidden md:block bg-white shadow-sm border rounded-lg overflow-hidden mb-6"
  >
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
          <DatePicker
            v-model="slotProps.data.datumDate"
            @date-select="slotProps.data.datum = formatDate(slotProps.data.datumDate)"
            showTime
            hourFormat="24"
            fluid
          />
        </template>
      </Column>
      <Column field="name" header="Name" sortable>
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <i v-if="slotProps.data.source === 'gcal'" class="pi pi-google text-blue-500 text-xs" v-tooltip.top="'Synchronisiert von Google Calendar'"></i>
            <InputText v-model="slotProps.data.name" fluid :invalid="slotProps.data.name.length < 3" />
          </div>
        </template>
      </Column>
      <Column field="veranstalter" header="Veranstalter" sortable>
        <template #body="slotProps">
          <InputText
            v-model="slotProps.data.veranstalter"
            fluid
            :invalid="!slotProps.data.veranstalter"
          />
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
            <Button
              icon="pi pi-refresh"
              text
              severity="warn"
              @click="$emit('discard-local-data')"
              size="small"
            />
          </div>
        </template>
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button
              icon="pi pi-calendar-plus"
              text
              @click="$emit('export-ical', slotProps.data)"
              v-tooltip.top="'Kalender Export'"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              @click="$emit('delete-termin', slotProps.data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>

  <!-- Mobile Card View -->
  <TerminCardList
    :termine="termine"
    :gruppeOptions="gruppeOptions"
    @delete-termin="$emit('delete-termin', $event)"
    @discard-local-data="$emit('discard-local-data')"
    @export-ical="$emit('export-ical', $event)"
  />
</template>

<style scoped>
:deep(.p-datatable-thead > tr > th) {
  background-color: var(--p-red-50);
  color: var(--p-red-600);
  font-weight: 600;
}
</style>
