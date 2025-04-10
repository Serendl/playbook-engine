<template>
  <div class="container">
    <HeadBar
      @importProcess="importProcess"
      @saveProcess="saveProcess"
    />
    <div class="page-container">
      <div class="left-bar">
        <PlaybookStructure
          :processData="processData"
          @expand="expand"
          @selectProcess="selectProcess"
          @selectSubProcess="selectSubProcess"
        />
      </div>
      <div class="processDetial">
        <PlaybookDetailView
          v-if="processData.length > 0"
          :selectedProcess="selectedProcess"
          :selectedSubProcess="selectedSubProcess"
          :currentProcess="currentProcess"
          :totalpage="totalpage"
          @updateProcess="updateProcess"
          @updateSubProcess="updateSubProcess"
          @previousPage="previousPage"
          @nextPage="nextPage"
        />
        <ProEmptyView v-else />
      </div>
    </div>
  </div>


</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import HeadBar from '@/components/HeadBar.vue';
import PlaybookStructure from './PlaybookStructureView.vue';
import PlaybookDetailView from './PlaybookDetailView.vue';
import ProEmptyView from '../Creator/ProEmptyView.vue';

const processData = ref([])

const selectedProcess = ref(null)
const selectedSubProcess = ref(null)
const currentProcess = ref([-1, -1]);
const lastProcess = ref([-1, -1]);
const totalpage = ref([0, 0]);


const expand = (index) => {
  processData.value[index].show = !processData.value[index].show;
}

const selectProcess = (index) => {
  console.log(currentProcess.value);
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  console.log(lastProcess.value);
  selectedProcess.value = processData.value[index];
  selectedSubProcess.value = null;
  currentProcess.value[0] = index;
  currentProcess.value[1] = -1;
  console.log(currentProcess.value);
}

const selectSubProcess = (index, subIndex) => {
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  console.log(lastProcess.value);
  selectedProcess.value = processData.value[index];
  selectedSubProcess.value = processData.value[index].subProcessArray[subIndex];
  currentProcess.value[0] = index;
  currentProcess.value[1] = subIndex;
}

// New Trial
const updateProcess = (selectedProcess) => {
  processData.value[lastProcess.value[0]] = selectedProcess;
}

const updateSubProcess = () => {
  if (lastProcess.value[1] === -1) return;
  processData.value[lastProcess.value[0]].subProcessArray[lastProcess.value[1]] = selectedSubProcess;
}

const previousPage = () => {
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  if (currentProcess.value[1] >= 0) {
    currentProcess.value[1] -= 1;
    if (currentProcess.value[1] >= 0) {
      selectedSubProcess.value = processData.value[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
    } else {
      selectedSubProcess.value = null;
    }
  } else if (currentProcess.value[0] > 0) {
    currentProcess.value[0] -= 1;
    if (processData.value[currentProcess.value[0]].subProcessArray.length > 0) {
      currentProcess.value[1] = processData.value[currentProcess.value[0]].subProcessArray.length - 1;
      selectedSubProcess.value = processData.value[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
    } else {
      currentProcess.value[1] = -1;
      selectedSubProcess.value = null;
    }
  }
}

const nextPage = () => {
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  if (currentProcess.value[1] < processData.value[currentProcess.value[0]].subProcessArray.length - 1) {
    currentProcess.value[1] += 1;
    selectedSubProcess.value = processData.value[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
  } else if (currentProcess.value[0] < processData.value.length - 1) {
    currentProcess.value[0] += 1;
    currentProcess.value[1] = -1;
    selectedProcess.value = processData.value[currentProcess.value[0]];
    selectedSubProcess.value = processData.value[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
  }
}

// Function to save the model to a JSON file
const saveProcess = async() => {
  const process = processData.value;
  const data = {
    process
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
  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Check if the imported data has the required properties
        if (
          importedData
        ) {
          // load the imported data into the data variables
          processData.value = importedData.process;

          console.log('Data imported successfully:', importedData);

          if (processData.value.length > 0) {
            selectedProcess.value = processData.value[0];
            lastProcess.value[0] = 0;
            currentProcess.value[0] = 0;
            if (processData.value.length > 0) {
              totalpage.value = [
                processData.value.length,
                processData.value[processData.value.length - 1].subProcessArray.length
              ];
            } else {
              totalpage.value = [0, 0];
            }
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
  }
};

watch(processData, (newVal) => {
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
  await nextTick();
})

</script>

<style scoped>
.left-bar {
  width: 30%;
  height: 100vh;
  background-color: #f1f1f1;
  position: relative;
  border-radius: 10px;
  /* z-index: 1; */
  /* top: 0; */
  /* left: 0; */
  /* overflow-x: hidden; */
  /* display: flex; */
}

.processDetial {
  flex-grow: 1;
  /* padding: 20px; */
  overflow-y: auto;
  /* width: 80%; */
  /* margin-left: 20%; */
  padding: 1px 16px;
  height: 100vh;
  /* padding-top: 20px; */
}

/* .app-container {
  display: flex;
  justify-content: center;
  height: 100vh;
} */

 .page-container {
  display: flex;
  height: 100vh;
}
</style>
