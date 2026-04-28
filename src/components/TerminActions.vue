<script setup>
import Button from 'primevue/button';

import InputText from 'primevue/inputtext';

const props = defineProps({
  stand: {
    type: String,
    default: 'Unbekannt'
  },
  jsonOutput: {
    type: String,
    default: ''
  },
  defaults: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['show-json', 'download-json', 'download-ical', 'close-preview']);
</script>

<template>
    <div class="bg-white p-6 shadow-sm border rounded-lg mb-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Export & Einstellungen</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Standardwerte</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 ml-1">Standard Ort</label>
              <InputText v-model="defaults.defaultOrt" placeholder="Brittheim" size="small" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 ml-1">Standard Dauer (Min)</label>
              <InputText v-model="defaults.defaultDauer" type="number" placeholder="120" size="small" />
            </div>
          </div>
        </div>
        
        <div class="flex flex-col justify-end">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Aktionen</h3>
          <div class="flex flex-wrap gap-2">
            <Button label="Zeige JSON" severity="secondary" @click="$emit('show-json')" icon="fa fa-code" size="small" />
            <Button label="JSON Download" severity="primary" @click="$emit('download-json')" icon="fa fa-download" size="small" />
            <Button label="iCal Download" severity="info" @click="$emit('download-ical')" icon="fa fa-calendar" size="small" />
          </div>
        </div>
      </div>

      <div class="flex justify-center border-t pt-4">
        <div class="text-xs text-gray-400 px-3 py-1 bg-gray-50 rounded-full border">
          Letzter Stand: {{ stand || 'Unbekannt' }}
        </div>
      </div>
    </div>

    <div v-if="jsonOutput" class="mt-6">
        <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium text-gray-700 ml-1">JSON Vorschau</h3>
            <Button icon="fa fa-times" text severity="secondary" @click="$emit('close-preview')" />
        </div>
        <pre class="p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto max-h-96 text-xs font-mono shadow-inner border border-gray-700">{{ jsonOutput }}</pre>
    </div>
</template>
