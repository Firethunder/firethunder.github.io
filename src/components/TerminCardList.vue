<script setup>
import DatePicker from "primevue/datepicker";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Button from "primevue/button";
import { formatDate } from "../utils/date";

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
  <div class="md:hidden space-y-4 mb-6">
    <div class="flex justify-between items-center px-1 mb-2">
      <span class="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1"
        >Termine</span
      >
      <Button
        label="Neu laden"
        icon="pi pi-refresh"
        text
        severity="warn"
        size="small"
        @click="$emit('discard-local-data')"
      />
    </div>
    <div
      v-for="termin in termine"
      :key="termin.id"
      class="bg-white p-4 shadow-sm border border-slate-200 rounded-xl"
    >
      <div class="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-red-600 uppercase tracking-tighter"
              >ID: {{ termin.id }}</span>
            <i
              v-if="termin.source === 'gcal'"
              class="pi pi-google text-blue-500 text-[10px]"
            ></i>
          </div>
          <div class="flex gap-2 items-center">
            <Select
              v-model="termin.Gruppe"
              :options="gruppeOptions"
              class="p-select-sm !w-24"
            />
            <Button
              icon="pi pi-calendar-plus"
              text
              size="small"
              @click="$emit('export-ical', termin)"
            />
          </div>
        </div>
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          @click="$emit('delete-termin', termin.id)"
        />
      </div>

      <div class="space-y-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500 ml-1">Datum</label>
          <DatePicker
            v-model="termin.datumDate"
            @date-select="termin.datum = formatDate(termin.datumDate)"
            showTime
            hourFormat="24"
            fluid
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500 ml-1">Name</label>
          <InputText
            v-model="termin.name"
            fluid
            :invalid="termin.name.length < 3"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-slate-500 ml-1"
            >Veranstalter</label
          >
          <InputText
            v-model="termin.veranstalter"
            fluid
            :invalid="!termin.veranstalter"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500 ml-1">Ort</label>
            <InputText v-model="termin.ort" fluid size="small" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-slate-500 ml-1">Dauer</label>
            <InputText v-model="termin.dauer" type="number" fluid size="small" />
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="termine.length === 0"
      class="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400"
    >
      Keine Termine vorhanden.
    </div>
  </div>
</template>
