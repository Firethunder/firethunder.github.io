<script setup>
import { computed } from 'vue'
import { getTime } from '../../utils/date'

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

const getTags = (a) => {
  const tags = new Set()
  const group = (a.Gruppe || a.gruppe || 'Alle').trim()
  if (group) tags.add(group)
  
  const name = (a.name || a.Name || '').toLowerCase()
  if (name.includes('jugend') || name.includes('jufeu')) tags.add('Jugend')
  if (name.includes('zugübung')) tags.add('Zug')
  if (name.includes('absturzsicherung')) tags.add('Hosi')
  
  return tags
}

const cardStyle = computed(() => {
  if (!nextAppointment.value) return {}
  const tags = getTags(nextAppointment.value)
  
  if (tags.has('Jugend')) return { bg: 'from-orange-500 to-orange-600', text: 'text-orange-100' }
  if (tags.has('Zug')) return { bg: 'from-blue-600 to-blue-700', text: 'text-blue-100' }
  if (tags.has('Hosi')) return { bg: 'from-green-600 to-green-700', text: 'text-green-100' }
  return { bg: 'from-red-600 to-red-700', text: 'text-red-100' }
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
    <div :class="['bg-gradient-to-br text-white p-5 rounded-xl shadow-md transition-all duration-500', cardStyle.bg]">
      <div class="flex justify-between items-start mb-2">
        <span class="text-xs font-medium bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider">
          {{ nextAppointment.Gruppe || 'Alle' }}
        </span>
        <span class="text-sm font-medium">{{ formatDate(nextAppointment.datum || nextAppointment.Datum) }}</span>
      </div>
      <h3 class="text-xl font-bold mb-1">{{ nextAppointment.name || nextAppointment.Name }}</h3>
      <p :class="['text-sm transition-colors duration-500', cardStyle.text]">
        {{ getTime(nextAppointment.datum || nextAppointment.Datum) }} &bull; {{ nextAppointment.veranstalter || nextAppointment.Organisator }}
      </p>
    </div>
  </div>
</template>
