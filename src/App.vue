<script setup>
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import ProgressBar from 'primevue/progressbar';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
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
  sortedTermine,
  gruppeOptions,
  newTermin,
  jsonOutput,
  validationErrors,
  isLoading,
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
  <div v-if="isLoading" class="fixed top-0 left-0 w-full z-50">
    <ProgressBar mode="indeterminate" style="height: 4px" />
  </div>
  
  <div class="p-4 max-w-7xl mx-auto min-h-screen bg-gray-50 text-gray-900 font-sans">
    <h1 class="text-3xl font-bold text-red-700 mb-6 flex items-center gap-2 border-b pb-2">
      <i class="fa fa-fire text-red-600"></i> Termin-Erfassungsmaske
    </h1>

    <Tabs value="0">
      <TabList class="mb-6">
        <Tab value="0" class="flex items-center gap-2"><i class="fa fa-calendar"></i> Termine</Tab>
        <Tab value="1" class="flex items-center gap-2"><i class="fa fa-database"></i> Daten-Export</Tab>
      </TabList>
      <TabPanels class="!p-0 !bg-transparent">
        <TabPanel value="0">
          <TerminTable 
            :termine="sortedTermine" 
            :gruppe-options="gruppeOptions" 
            @delete-termin="deleteTermin" 
            @discard-local-data="discardLocalData"
          />
          <TerminForm 
            :new-termin="newTermin" 
            :validation-errors="validationErrors" 
            :gruppe-options="gruppeOptions" 
            @add-termin="addTermin" 
          />
        </TabPanel>
        <TabPanel value="1">
          <TerminActions 
            :stand="data.stand" 
            :json-output="jsonOutput" 
            @show-json="showJson" 
            @download-json="downloadJson" 
            @close-preview="jsonOutput = ''" 
          />        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<style>
/* Global styles or theme overrides if needed */
.p-datepicker {
    font-family: 'Inter', sans-serif;
}
</style>
