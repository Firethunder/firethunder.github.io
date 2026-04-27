<script setup>
import Button from 'primevue/button';

const props = defineProps({
  stand: {
    type: String,
    default: 'Unbekannt'
  },
  jsonOutput: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['show-json', 'download-json', 'close-preview']);
</script>

<template>
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
      <div class="flex flex-wrap gap-2 w-full md:w-auto">
        <Button label="Zeige JSON" severity="secondary" @click="$emit('show-json')" icon="fa fa-code" class="flex-1 md:flex-none" />
        <Button label="JSON Download" severity="primary" @click="$emit('download-json')" icon="fa fa-download" class="flex-1 md:flex-none" />
      </div>
      <div class="text-sm text-gray-500 bg-white px-3 py-1 border rounded-full shadow-sm w-full md:w-auto text-center">
        Letzter Stand: {{ stand || 'Unbekannt' }}
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
