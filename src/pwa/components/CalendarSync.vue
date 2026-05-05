<script setup>
import { computed } from 'vue'
import { getCalendarUrl } from '../../utils/calendar'

const icsBaseUrl = 'https://firethunder.github.io/ffwtool/termine.ics'

const subscriptionUrl = computed(() => {
  return getCalendarUrl(icsBaseUrl, navigator.userAgent)
})
</script>

<template>
  <div class="mt-8 pt-6 border-t border-slate-200">
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <h3 class="font-bold text-slate-800 mb-2">Kalender abonnieren</h3>
      <p class="text-xs text-slate-500 mb-4 leading-relaxed">
        Erhalte automatische Erinnerungen an dein Smartphone, indem du den Terminplan abonnierst.
      </p>
      
      <a 
        :href="subscriptionUrl"
        class="flex items-center justify-center w-full bg-slate-800 text-white py-3 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
        </svg>
        Jetzt abonnieren
      </a>
      
      <p class="text-[10px] text-center text-slate-400 mt-4">
        Funktioniert mit iOS Kalender, Google Calendar & Outlook.
      </p>
    </div>
  </div>
</template>
