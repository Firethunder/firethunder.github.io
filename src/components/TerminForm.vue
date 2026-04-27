<script setup>
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';

const props = defineProps({
  newTermin: {
    type: Object,
    required: true
  },
  validationErrors: {
    type: Object,
    required: true
  },
  gruppeOptions: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['add-termin']);
</script>

<template>
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
          <Button label="Hinzufügen" icon="fa fa-plus" @click="$emit('add-termin')" fluid class="h-10 font-semibold" />
        </div>
      </div>
    </div>
</template>
