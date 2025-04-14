<template>
  <div class="container">
    <HeadBar
      @importProcess="importProcess"
      @saveProcess="saveProcess"
    />
    <div v-if="initialized" class="page-container">
      <div class="left-bar">
        <ProStructure
          :processData="processData"
          @expand="expand"
          @addProcess="addProcess"
          @addSubProcess="addSubProcess"
          @selectProcess="selectProcess"
          @selectSubProcess="selectSubProcess"
          @deleteProcess="deleteProcess"
          @deleteSubProcess="deleteSubProcess"
          @nextStep="nextStep"
        />
      </div>
      <div class="processDetial">
        <ProDetailView
          v-if="processData.processes.length > 0"
          :selectedProcess="selectedProcess"
          :selectedSubProcess="selectedSubProcess"
          :currentProcess="currentProcess"
          :totalpage="totalpage"
          :type="processData.type"
          @updateProcess="updateProcess"
          @updateSubProcess="updateSubProcess"
          @previousPage="previousPage"
          @nextPage="nextPage"
          @nextStep="nextStep"
        />
        <ProEmptyView v-else />
      </div>
    </div>
  </div>


</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import HeadBar from '@/components/HeadBar.vue';
import ProStructure from './ProStructureView.vue';
import ProDetailView from './ProDetailView.vue';
import ProEmptyView from './ProEmptyView.vue';
import router from '@/router';


const processData = ref({
  type: '',
  processes: []
})

const attributes = ref([]);
const gateways = ref([]);
const events = ref([]);
let isLinear = true;

const selectedProcess = ref(null)
const selectedSubProcess = ref(null)
// current process is [processIndex, subProcessIndex]
const currentProcess = ref([-1, -1]);
// last process is [processIndex, subProcessIndex]
const lastProcess = ref([-1, -1]);
// total page is [processNum, subProcessNum]
const totalpage = ref([0, 0]);

// initialize status
const initialized = ref(false);


const setTotalPage = () => {
  totalpage.value = [
    processData.value.processes.length || 0,
    processData.value.processes[processData.value.processes.length - 1].subProcessArray.length || 0
  ];
}

// Function to expand or collapse the process
const expand = (index) => {
  processData.value.processes[index].show = !processData.value.processes[index].show;
}

// Function to delete a process
// If the process is the only one, set selectedProcess and selectedSubProcess to null
// If the process is selected, set selectedProcess and selectedSubProcess to null
// If the process is selected, set currentProcess[0] to 0 and currentProcess[1] to -1
// If the process is the last one, set currentProcess[0] to -1 and currentProcess[1] to -1
// If the process is selected, set selectedProcess to the first process
const deleteProcess = (index) => {
  if (processData.value.processes.length === 1) {
    selectedProcess.value = null;
    selectedSubProcess.value = null;
    currentProcess.value[0] = -1;
    currentProcess.value[1] = -1;
  } else {
    if (currentProcess.value === index) {
      selectedProcess.value = processData.value.processes[0];
      selectedSubProcess.value = null;
      currentProcess.value[0] = 0;
      currentProcess.value[1] = -1;
    }
  }
  processData.value.processes.splice(index, 1);
  setTotalPage();
}

// Function to delete a subprocess
// If the subprocess is the only one in the process, hide the process
// If the subprocess is selected, set selectedSubProcess to null
// If the subprocess is the last one in the process, set currentProcess[1] to -1
const deleteSubProcess = (index, subIndex) => {
  if (processData.value.processes[index].subProcessArray.length === 1) {
    processData.value.processes[index].show = false;
  }
  console.log(currentProcess.value, index, subIndex);
  if (currentProcess.value[0] === index && currentProcess.value[1] == subIndex) {
    selectedSubProcess.value = null;
    currentProcess.value[1] = -1;
  }
  processData.value.processes[index].subProcessArray.splice(subIndex, 1);
  setTotalPage();
}

// Function to add a process
const addProcess = (proName) => {
  const newProcess = {
    name: proName,
    id: processData.value.processes.length + 1,
    lowChoiceNum: 1,
    upChoiceNum: 1,
    subProcessArray: [],
    show: false,
    description: ''
  }
  processData.value.processes.push(newProcess);
  if (processData.value.processes.length === 1) {
    selectedProcess.value = processData.value.processes[0];
    currentProcess.value[0] = 0;
  }
  setTotalPage();
}

// Function to add a subprocess
const addSubProcess = (currentIndex, subProName) => {
  const newSubProcess = {
    name: subProName,
    id: processData.value.processes[currentIndex].subProcessArray.length + 1,
    lowChoiceNum: 1,
    upChoiceNum: 1,
    show: false,
    description: '',
    sectionArray: [],
    // attributes defined in the Value Panel
    attributeArray: [],
    // attributes of the option(subprocess)
    subAttrArray: [],
    depListArray: []
  }
  processData.value.processes[currentIndex].subProcessArray.push(newSubProcess);
  processData.value.processes[currentIndex].show = true;
  setTotalPage();
}

// Function to select a process
const selectProcess = (index) => {
  console.log(currentProcess.value);
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  console.log(lastProcess.value);
  selectedProcess.value = processData.value.processes[index];
  selectedSubProcess.value = null;
  currentProcess.value[0] = index;
  currentProcess.value[1] = -1;
  console.log(currentProcess.value);
}

// Function to select a subprocess
const selectSubProcess = (index, subIndex) => {
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  console.log(lastProcess.value);
  selectedProcess.value = processData.value.processes[index];
  selectedSubProcess.value = processData.value.processes[index].subProcessArray[subIndex];
  currentProcess.value[0] = index;
  currentProcess.value[1] = subIndex;
}

// Function to update the process
const updateProcess = (selectedProcess) => {
  processData.value.processes[lastProcess.value[0]] = selectedProcess;
}

// Function to update the subprocess
const updateSubProcess = () => {
  if (lastProcess.value[1] === -1) return;
  processData.value.processes[lastProcess.value[0]].subProcessArray[lastProcess.value[1]] = selectedSubProcess;
}

// Function to go to the previous page
const previousPage = () => {
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  if (currentProcess.value[1] >= 0) {
    currentProcess.value[1] -= 1;
    if (currentProcess.value[1] >= 0) {
      selectedSubProcess.value = processData.value.processes[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
    } else {
      selectedSubProcess.value = null;
    }
  } else if (currentProcess.value[0] > 0) {
    currentProcess.value[0] -= 1;
    if (processData.value.processes[currentProcess.value[0]].subProcessArray.length > 0) {
      currentProcess.value[1] = processData.value.processes[currentProcess.value[0]].subProcessArray.length - 1;
      selectedSubProcess.value = processData.value.processes[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
    } else {
      currentProcess.value[1] = -1;
      selectedSubProcess.value = null;
    }
  }
}

// Function to go to the next page
const nextPage = () => {
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  if (currentProcess.value[1] < processData.value.processes[currentProcess.value[0]].subProcessArray.length - 1) {
    currentProcess.value[1] += 1;
    selectedSubProcess.value = processData.value.processes[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
  } else if (currentProcess.value[0] < processData.value.processes.length - 1) {
    currentProcess.value[0] += 1;
    currentProcess.value[1] = -1;
    selectedProcess.value = processData.value.processes[currentProcess.value[0]];
    selectedSubProcess.value = processData.value.processes[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
  }
}

// Function to go to the next step
const nextStep = () => {
  console.log('Generate Process');
  if(processData.value.processes.length > 0) {
    // sessionStorage.setItem('processData', JSON.stringify(processData.value));
    // sessionStorage.setItem('attributes', JSON.stringify(processAttr.value));
    const data = {
      process: {
        type: processData.value.type,
        processes: processData.value.processes
      },
      gateways: gateways.value,
      events: events.value,
      processAttr: attributes.value,
      linear: isLinear
    }
    localStorage.setItem('processData', JSON.stringify(data));

    if (processData.value.type === 'Text Playbook') {
      router.push('/textPlaybook');
    } else if (processData.value.type === 'Configurator Playbook') {
      router.push('/DefineGateway');
    }
  } else {
    console.log('No process data');
  }

}

// Function to save the model to a JSON file
const saveProcess = async() => {
  const data = {
    process: {
      type: processData.value.type,
      processes: processData.value.processes
    },
    gateways: gateways.value,
    events: events.value,
    processAttr: attributes.value,
    linear: isLinear
  }
  const dataString = JSON.stringify(data, null, 2);
  const blob = new Blob([dataString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'proStructure.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
  console.log('Data saved successfully:');
}



// Function to import a model from a JSON file
const importProcess = async(file) => {
  initialized.value = false;
  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Check if the imported data has the required properties
        if (importedData) {
          // load the imported data into the data variables
          processData.value = importedData.process;
          attributes.value = importedData.processAttr;
          gateways.value = importedData.gateways;
          events.value = importedData.events;

          console.log('Data imported successfully:', importedData);

          if (processData.value.processes.length > 0) {
            selectedProcess.value = processData.value.processes[0];
            lastProcess.value[0] = 0;
            currentProcess.value[0] = 0;
            totalpage.value = [
              processData.value.processes.length || 0,
              processData.value.processes[processData.value.processes.length - 1].subProcessArray.length || 0
            ];
          } else {
            totalpage.value = [0, 0];
          }
        } else {
          console.error('JSON file does not contain the required data.');
        }
      } catch (error) {
        console.error('Import error:', error);
      }
    };

    reader.readAsText(file);

    console.log(processData.value);

    initialized.value = true;
  }
};

// Watch for changes in the processData and update the total page
watch(processData.value.processes, (newVal) => {
  if (newVal.length > 0) {
    totalpage.value = [
      newVal.length,
      newVal[newVal.length - 1]?.subProcessArray?.length || 0 // avoid undefined error
    ];
  } else {
    totalpage.value = [0, 0]; // avoid undefined error
  }
}, { deep: true });

onMounted(async() => {
  const processDataStorage = JSON.parse(localStorage.getItem('processData'));
  if (processDataStorage) {
    processData.value = processDataStorage.process;
    attributes.value = processDataStorage.processAttr;
    gateways.value = processDataStorage.gateways;
    events.value = processDataStorage.events;
    isLinear = processDataStorage.linear;
    if (processData.value.processes.length > 0) {
      selectedProcess.value = processData.value.processes[0];
      lastProcess.value[0] = 0;
      currentProcess.value[0] = 0;
      totalpage.value = [
        processData.value.processes.length || 0,
        processData.value.processes[processData.value.processes.length - 1].subProcessArray.length || 0
      ];
    } else {
      totalpage.value = [0, 0];
    }
  }

  initialized.value = true;
})

</script>

<style scoped>
.left-bar {
  width: 30%;
  max-height: 80vh;
  min-height: 50vh;
  overflow-y: auto;
  position: sticky;
  top: 0;
  background-color: #f1f1f1;
  border-radius: 10px;
}

.processDetial {
  flex-grow: 1;
  /* padding: 20px; */
  overflow-y: auto;
  /* width: 80%; */
  /* margin-left: 30%; */
  padding: 1px 16px;
  height: 100%;
  /* padding-top: 20px; */
}

 .page-container {
  display: flex;
  height: 100%;
  align-items: flex-start;
  position: relative;
}
</style>
