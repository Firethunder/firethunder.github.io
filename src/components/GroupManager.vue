<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const props = defineProps({
  gruppen: {
    type: Object,
    required: true
  }
});

const newMemberA = ref('');
const newMemberB = ref('');

const addMember = (group) => {
  if (group === 'A' && newMemberA.value.trim()) {
    if (!props.gruppen.A) props.gruppen.A = [];
    props.gruppen.A.push(newMemberA.value.trim());
    newMemberA.value = '';
  } else if (group === 'B' && newMemberB.value.trim()) {
    if (!props.gruppen.B) props.gruppen.B = [];
    props.gruppen.B.push(newMemberB.value.trim());
    newMemberB.value = '';
  }
};

const removeMember = (group, index) => {
  props.gruppen[group].splice(index, 1);
};
</script>

<template>
  <div class="bg-white p-6 shadow-sm border rounded-lg mb-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
      <i class="fa fa-users text-red-600 mr-2"></i> Mannschaftsverwaltung
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
      <!-- Gruppe A -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-md font-bold text-red-700 uppercase tracking-wider">Gruppe A</h3>
            <span class="text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-full border border-red-100">
                {{ gruppen.A?.length || 0 }} Kameraden
            </span>
        </div>
        
        <div class="flex gap-2 mb-4">
          <InputText v-model="newMemberA" placeholder="Name eingeben..." fluid @keyup.enter="addMember('A')" size="small" />
          <Button icon="fa fa-plus" @click="addMember('A')" severity="primary" size="small" />
        </div>

        <ul class="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          <li v-for="(member, index) in gruppen.A" :key="index" 
              class="flex justify-between items-center p-2 bg-gray-50 border rounded hover:bg-white transition-colors group">
            <span class="text-sm font-medium text-gray-700">{{ member }}</span>
            <Button icon="fa fa-trash" severity="danger" text size="small" 
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="removeMember('A', index)" />
          </li>
          <li v-if="!gruppen.A || gruppen.A.length === 0" class="text-sm text-gray-400 italic text-center py-4 bg-gray-50 border-dashed border-2 rounded">
            Keine Mitglieder in Gruppe A
          </li>
        </ul>
      </div>

      <!-- Gruppe B -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-md font-bold text-blue-700 uppercase tracking-wider">Gruppe B</h3>
            <span class="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                {{ gruppen.B?.length || 0 }} Kameraden
            </span>
        </div>

        <div class="flex gap-2 mb-4">
          <InputText v-model="newMemberB" placeholder="Name eingeben..." fluid @keyup.enter="addMember('B')" size="small" />
          <Button icon="fa fa-plus" @click="addMember('B')" severity="info" size="small" />
        </div>

        <ul class="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          <li v-for="(member, index) in gruppen.B" :key="index" 
              class="flex justify-between items-center p-2 bg-gray-50 border rounded hover:bg-white transition-colors group">
            <span class="text-sm font-medium text-gray-700">{{ member }}</span>
            <Button icon="fa fa-trash" severity="danger" text size="small" 
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="removeMember('B', index)" />
          </li>
          <li v-if="!gruppen.B || gruppen.B.length === 0" class="text-sm text-gray-400 italic text-center py-4 bg-gray-50 border-dashed border-2 rounded">
            Keine Mitglieder in Gruppe B
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
