<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatShortDate, getWeekday } from '../../utils/date'

const props = defineProps({
  appointments: {
    type: Array,
    required: true
  }
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

const availableGroups = computed(() => {
  const groups = new Set(['Alle'])
  props.appointments.forEach(a => {
    getTags(a).forEach(t => groups.add(t))
  })
  return Array.from(groups).sort()
})

const activeFilters = ref(new Set())
const showPast = ref(localStorage.getItem('pwa-show-past') === 'true')

onMounted(() => {
  const saved = localStorage.getItem('pwa-active-filters')
  if (saved) {
    try {
      activeFilters.value = new Set(JSON.parse(saved))
    } catch (e) {
      activeFilters.value = new Set(availableGroups.value)
    }
  } else {
    activeFilters.value = new Set(availableGroups.value)
  }
})

function toggleFilter(group) {
  const next = new Set(activeFilters.value)
  if (next.has(group)) {
    next.delete(group)
  } else {
    next.add(group)
  }
  activeFilters.value = next
  localStorage.setItem('pwa-active-filters', JSON.stringify(Array.from(next)))
}

function togglePast() {
  showPast.value = !showPast.value
  localStorage.setItem('pwa-show-past', showPast.value)
}

const filteredList = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  let list = props.appointments.filter(a => {
    const tags = getTags(a)
    return Array.from(tags).some(t => activeFilters.value.has(t))
  })

  if (!showPast.value) {
    // Only future, oldest first
    return list
      .filter(a => new Date(a.datum || a.Datum) >= now)
      .sort((a, b) => new Date(a.datum || a.Datum) - new Date(b.datum || b.Datum))
  } else {
    // All, newest first
    return list.sort((a, b) => new Date(b.datum || b.Datum) - new Date(a.datum || a.Datum))
  }
})

</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-semibold text-slate-700">Termine</h2>
        <button 
          @click="togglePast"
          :class="['text-[10px] font-bold px-2 py-1 rounded transition-colors uppercase tracking-wider', 
            showPast ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-500'
          ]"
        >
          {{ showPast ? 'Vergangen ausblenden' : 'Vergangene anzeigen' }}
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="group in availableGroups"
          :key="group"
          @click="toggleFilter(group)"
          :class="['px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm', 
            activeFilters.has(group) 
              ? 'bg-red-600 border-red-600 text-white' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-red-300'
          ]"
        >
          {{ group }}
        </button>
      </div>
    </div>

    <div v-if="filteredList.length === 0" class="text-center py-12 text-slate-400">
      Keine Termine gefunden.
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="termin in filteredList" 
        :key="termin.id"
        class="flex items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm"
      >
        <div class="flex flex-col items-center justify-center w-12 mr-4 border-r border-slate-100 pr-4">
          <span class="text-[10px] uppercase font-bold text-slate-400">{{ getWeekday(termin.datum || termin.Datum) }}</span>
          <span class="text-lg font-bold text-slate-700 leading-none">{{ formatShortDate(termin.datum || termin.Datum) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-slate-800 truncate">{{ termin.name || termin.Name }}</h4>
          <p class="text-xs text-slate-500 truncate">{{ termin.veranstalter || termin.Organisator }}</p>
        </div>
        <div v-if="termin.Gruppe && termin.Gruppe !== 'Alle'" class="ml-2">
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
            {{ termin.Gruppe }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
