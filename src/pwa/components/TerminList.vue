<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDay, getShortMonth, getWeekday, getYear, getTime } from '../../utils/date'

const currentYear = new Date().getFullYear()

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

const getGroupColor = (group) => {
  const g = (group || '').toLowerCase()
  if (g.includes('jugend')) return 'bg-orange-600 border-orange-600'
  if (g.includes('zug')) return 'bg-blue-600 border-blue-600'
  if (g.includes('hosi')) return 'bg-green-600 border-green-600'
  return 'bg-red-600 border-red-600' // Alle / Default
}

const getGroupBadgeClass = (group) => {
  const g = (group || '').toLowerCase()
  if (g.includes('jugend')) return 'bg-orange-50 text-orange-600'
  if (g.includes('zug')) return 'bg-blue-50 text-blue-600'
  if (g.includes('hosi')) return 'bg-green-50 text-green-600'
  return 'bg-red-50 text-red-600'
}

const getDateTextColor = (termin) => {
  const tags = getTags(termin)
  if (tags.has('Jugend')) return 'text-orange-600'
  if (tags.has('Zug')) return 'text-blue-600'
  if (tags.has('Hosi')) return 'text-green-600'
  return 'text-red-600' // Alle / Default
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
              ? getGroupColor(group) + ' text-white rounded-full' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 rounded-full'
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
          <span :class="['text-[10px] uppercase font-bold leading-none mb-1', getDateTextColor(termin)]">{{ getWeekday(termin.datum || termin.Datum) }}</span>
          <span class="text-lg font-black text-slate-800 leading-none">{{ getDay(termin.datum || termin.Datum) }}</span>
          <div :class="['text-[10px] uppercase font-bold leading-none mt-1 flex flex-col items-center', getDateTextColor(termin)]">
            <span>{{ getShortMonth(termin.datum || termin.Datum) }}</span>
            <span class="text-[8px] opacity-70 mt-0.5">
              '{{ getYear(termin.datum || termin.Datum).toString().slice(-2) }}
            </span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-slate-800 truncate">{{ termin.name || termin.Name }}</h4>
          <p class="text-xs text-slate-500 truncate">
            {{ getTime(termin.datum || termin.Datum) }} &bull; {{ termin.veranstalter || termin.Organisator }}
          </p>
        </div>
        <div class="ml-2 flex flex-wrap gap-1 justify-end">
          <span 
            v-for="tag in Array.from(getTags(termin)).filter(t => t !== 'Alle')" 
            :key="tag"
            :class="['text-[10px] font-bold px-1.5 py-0.5 rounded uppercase whitespace-nowrap', getGroupBadgeClass(tag)]"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
