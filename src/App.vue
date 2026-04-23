<script setup>
import { ref, onMounted, computed } from 'vue';

const data = ref({
  termine: [],
  stand: '',
  gruppen: { A: [], B: [] }
});

const newTermin = ref({
  datum: '',
  name: '',
  veranstalter: '',
  Gruppe: 'Alle'
});

const jsonOutput = ref('');

onMounted(async () => {
  try {
    const response = await fetch('./termine.json');
    const jsonData = await response.json();
    
    // Normalize Gruppe field as per legacy script
    jsonData.termine = jsonData.termine.map(t => ({
      ...t,
      Gruppe: t.Gruppe || t.gruppe || "Alle"
    }));
    
    data.value = jsonData;
  } catch (error) {
    console.error('Error loading data:', error);
  }
});

const maxId = computed(() => {
  return Math.max(0, ...data.value.termine.map(t => parseInt(t.id) || 0));
});

const addTermin = () => {
  if (!newTermin.value.datum || !newTermin.value.name) return;

  const now = new Date(newTermin.value.datum);
  const pad = n => n.toString().padStart(2, '0');
  const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const termin = {
    id: maxId.value + 1,
    datum: formattedDate,
    name: newTermin.value.name,
    veranstalter: newTermin.value.veranstalter,
    Gruppe: newTermin.value.Gruppe,
    send: "0"
  };

  data.value.termine.push(termin);

  // Reset form
  newTermin.value = {
    datum: '',
    name: '',
    veranstalter: '',
    Gruppe: 'Alle'
  };
};

const deleteTermin = (index) => {
  data.value.termine.splice(index, 1);
};

const showJson = () => {
  jsonOutput.value = JSON.stringify(data.value, null, 2);
};

const downloadJson = () => {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  
  const outputData = { ...data.value, stand: formattedDate };
  
  const blob = new Blob([JSON.stringify(outputData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "termine.json";
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <h1 class="w3-text-red">Termin-Erfassungsmaske</h1>

  <table class="w3-table-all w3-hoverable w3-card-4">
    <thead>
      <tr class="w3-red">
        <th>Datum</th>
        <th>Name</th>
        <th>Veranstalter</th>
        <th>Gruppe</th>
        <th>Aktion</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(termin, index) in data.termine" :key="termin.id">
        <td><input type="datetime-local" class="w3-input" v-model="termin.datum"></td>
        <td><input type="text" class="w3-input" v-model="termin.name"></td>
        <td><input type="text" class="w3-input" v-model="termin.veranstalter"></td>
        <td>
          <select class="w3-select w3-center" v-model="termin.Gruppe">
            <option value="Alle">Alle</option>
            <option value="Zug">Zug</option>
            <option value="HoSi">HoSi</option>
          </select>
        </td>
        <td>
          <button @click="deleteTermin(index)" class="w3-button w3-small"><i class="fa fa-trash"></i></button>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td><input type="datetime-local" class="w3-input" v-model="newTermin.datum"></td>
        <td><input type="text" class="w3-input" v-model="newTermin.name" placeholder="Name"></td>
        <td><input type="text" class="w3-input" v-model="newTermin.veranstalter" placeholder="Veranstalter"></td>
        <td>
          <select class="w3-select w3-center" v-model="newTermin.Gruppe">
            <option value="Alle">Alle</option>
            <option value="Zug">Zug</option>
            <option value="HoSi">HoSi</option>
          </select>
        </td>
        <td>
          <button @click="addTermin" class="w3-button w3-small w3-border"><i class="fa fa-save"></i> Hinzufügen</button>
        </td>
      </tr>
    </tfoot>
  </table>

  <div class="w3-margin-top">
    <button @click="showJson" class="w3-button w3-blue">Zeige JSON</button>
    <button @click="downloadJson" class="w3-button w3-blue w3-margin-left">JSON Download</button>
  </div>

  <pre v-if="jsonOutput" class="w3-code w3-border w3-padding">{{ jsonOutput }}</pre>
</template>

<style scoped>
/* Scoped styles if needed */
</style>
