<script setup>
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// Components
import TerminTable from './components/TerminTable.vue';
import TerminForm from './components/TerminForm.vue';
import TerminActions from './components/TerminActions.vue';

// Composables
import { useTermine } from './composables/useTermine';

const toast = useToast();
const confirm = useConfirm();

const {
  data,
  gruppeOptions,
  newTermin,
  jsonOutput,
  validationErrors,
  addTermin,
  deleteTermin,
  discardLocalData,
  showJson,
  downloadJson
} = useTermine(toast, confirm);
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <div class="p-4 max-w-7xl mx-auto min-h-screen bg-gray-50 text-gray-900 font-sans">
    <h1 class="text-3xl font-bold text-red-700 mb-6 flex items-center gap-2 border-b pb-2">
      <i class="fa fa-fire text-red-600"></i> Termin-Erfassungsmaske
    </h1>

    <TerminTable 
      :termine="data.termine" 
      :gruppe-options="gruppeOptions" 
      @delete-termin="deleteTermin" 
    />

    <TerminForm 
      :new-termin="newTermin" 
      :validation-errors="validationErrors" 
      :gruppe-options="gruppeOptions" 
      @add-termin="addTermin" 
    />

    <TerminActions 
      :stand="data.stand" 
      :json-output="jsonOutput" 
      @show-json="showJson" 
      @download-json="downloadJson" 
      @discard-local-data="discardLocalData" 
      @close-preview="jsonOutput = ''" 
    />
  </div>
</template>

<style>
/* Global styles or theme overrides if needed */
.p-datepicker {
    font-family: 'Inter', sans-serif;
}
</style>
