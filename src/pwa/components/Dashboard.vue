<script setup>
import { computed } from 'vue'

const props = defineProps({
  appointments: {
    type: Array,
    required: true
  }
})

const nextAppointment = computed(() => {
  if (!props.appointments || props.appointments.length === 0) return null
  
  const now = new Date()
  // Set to beginning of today
  now.setHours(0, 0, 0, 0)

  return props.appointments
    .filter(a => new Date(a.datum || a.Datum) >= now)
    .sort((a, b) => new Date(a.datum || a.Datum) - new Date(b.datum || b.Datum))[0]
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<template>
  <div v-if="nextAppointment" class="mb-8">
    <h2 class="text-lg font-semibold text-slate-700 mb-3">Nächster Termin</h2>
    <div class="bg-gradient-to-br from-red-600 to-red-700 text-white p-5 rounded-xl shadow-md">
      <div class="flex justify-between items-start mb-2">
        <span class="text-xs font-medium bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider">
          {{ nextAppointment.Gruppe || 'Alle' }}
        </span>
        <span class="text-sm font-medium">{{ formatDate(nextAppointment.datum || nextAppointment.Datum) }}</span>
      </div>
      <h3 class="text-xl font-bold mb-1">{{ nextAppointment.name || nextAppointment.Name }}</h3>
      <p class="text-red-100 text-sm">{{ nextAppointment.veranstalter || nextAppointment.Organisator }}</p>
    </div>
  </div>
</template>
