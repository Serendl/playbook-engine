<template>
  <div class="container">
    <div class="mt-3" style="width: 100%;">
      <h2>Pro Structure</h2>

      <hr>

      <div>
        <div v-for="(process, index) in props.processData.processes" :key="index" class="process-line">
          <div class="d-flex align-items-center justify-content-between process-name-line">
            <div class="d-flex align-items-center mb-1">
              <div>
                <button v-if="process.show" @click="expand(index)" class="drop-down-button">
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <g>
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path d="M12 15l-4.243-4.243 1.415-1.414L12 12.172l2.828-2.829 1.415 1.414z"/>
                      </g>
                  </svg>
                </button>
                <button v-else @click="expand(index)" class="drop-down-button">
                  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <g>
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path d="M12.172 12L9.343 9.172l1.414-1.415L15 12l-4.243 4.243-1.414-1.415z"/>
                      </g>
                  </svg>
                </button>
              </div>
              <div @click="selectProcess(index)" class="ms-2 process-name">
                {{ index + 1 }}. {{ process.name }}
              </div>
            </div>
            <div class="me-2">
              <button @click="deleteProcess(index)" class="delete-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M10 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button @click="openDialog(index)" class="add-subprocess">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
              <DialogComp v-model:visible="visible2" modal header="Add Subprocess" :style="{ width: '25rem' }">
                <p v-if="props.processData.type === 'Text Playbook'" style="font-size: 1.15em">Please Enter the Subprocess Name:</p>
                <p v-else style="font-size: 1.15em">Please Enter the Option Name:</p>
                <div class="id-name-row mt-3 mb-3" style="align-items: baseline;">
                    <input v-model="subProName" id="subprocess name" class="flex-auto process-name-input form-control" autocomplete="off" />
                </div>
                <div class="flex gap-2"  style="display: flex; justify-content: flex-end; max-width: 500px;">
                    <button type="button" label="Cancel" class="btn btn-primary me-3" @click="{visible2 = false; clearDialog()}">Cancel</button>
                    <button type="button" label="Save" class="btn btn-primary me-3" @click="{visible2 = false; addSubProcess(index)}">Save</button>
                </div>
              </DialogComp>
            </div>
          </div>
          <div v-show="process.show" v-for="(subprocess, subIndex) in process.subProcessArray" :key="subIndex">
            <div class="d-flex align-items-center subprocess-name">
              <div class="subprocess-line ms-1 mb-1">
                <div @click="selectSubProcess(index, subIndex)" class="ms-2 process-name">
                  <!-- {{ index + 1 }}.{{ subIndex + 1 }} {{ subprocess.name }} -->
                  {{ getPrefix(index, subIndex) }} {{ subprocess.name }}
                </div>
                <div class="me-2">
                  <button @click="deleteSubProcess(index, subIndex)" class="delete-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M10 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-3 button-line">
        <button @click="nextStep()" class="btn btn-primary">Define Attributes</button>
      </div>

      <!-- <div class="mb-3 button-line">
        <button @click="visible1 = true" class="btn btn-primary">+ Add Process</button>
        <DialogComp v-model:visible="visible1" modal header="Add Process" :style="{ width: '25rem' }">
          <p style="font-size: 1.15em">Please Enter the Process Name:</p>
          <div class="id-name-row mt-3 mb-3" style="align-items: baseline;">
              <input v-model="proName" id="process name" class="flex-auto process-name-input form-control" autocomplete="off" />
          </div>
          <div class="flex gap-2"  style="display: flex; justify-content: flex-end; max-width: 500px;">
              <button type="button" label="Cancel" class="btn btn-primary me-3" @click="{visible1 = false; clearDialog()}">Cancel</button>
              <button type="button" label="Save" class="btn btn-primary me-3" @click="{visible1 = false; addProcess()}">Save</button>
          </div>
        </DialogComp>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  processData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['expand', 'addProcess', 'deleteProcess', 'deleteSubProcess', 'addSubProcess', 'selectProcess', 'selectSubProcess', 'saveProcess', 'importProcess', 'nextStep']);

const proName = ref('');
// const visible1 = ref(false);

const subProName = ref('');
const currentIndex = ref(null);
const visible2 = ref(false);

// const fileInput = ref(null);

const expand = (index) => {
  emit('expand', index);
}

const deleteProcess = (index) => {
  emit('deleteProcess', index);
}

const deleteSubProcess = (index, subIndex) => {
  emit('deleteSubProcess', index, subIndex);
}

// const addProcess = () => {
//   emit('addProcess', proName.value);
//   proName.value = '';
// }

const openDialog = (index) => {
  currentIndex.value = index;
  visible2.value = true;
}

const addSubProcess = () => {
  emit('addSubProcess', currentIndex.value, subProName.value);
  subProName.value = '';
  visible2.value = false;
  currentIndex.value = null;
}

const selectProcess = (index) => {
  emit('selectProcess', index);
}

const selectSubProcess = (index, subIndex) => {
  emit('selectSubProcess', index, subIndex);
}

const clearDialog = () => {
  proName.value = '';
  subProName.value = '';
}

const getPrefix = (index, subIndex) => {
  if (props.processData.type === 'Text Playbook') {
    return `${index + 1}.${subIndex + 1}`;
  }
  if (props.processData.type === 'Configurator Playbook') {
    return String.fromCharCode(65 + subIndex ) + '.';
  }
}

const nextStep = () => {
  emit('nextStep');
}

</script>

<style scoped>
.process-line {
  background-color: rgba(168, 175, 175, 0.333);
  padding: 3px 0;
  margin-bottom: 8px;
  border-radius: 5px;
  align-items: baseline;
}

.process-name-line {
  padding: 10px 0;
  /* margin-bottom: 10px; */
  border-radius: 5px;
  align-items: baseline;
  width: 100%;
}

.process-name {
  flex-grow: 1;
}

.delete-button {
  /* height: 24px; */
  /* width: 28px; */
  background-color: transparent;
  border-radius: 8px;
  border-color: grey;
  /* border: none; */
  cursor: pointer;
}

.drop-down-button {
  height: 24px;
  width: 28px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.add-subprocess {
  height: 24px;
  width: 28px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.subprocess-line {
  /* background-color: rgba(168, 175, 175, 0.333); */
  padding: 5px 0;
  margin: 1px 0;
  border-radius: 5px;
  align-items: baseline;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.subprocess-name::before {
  content: '';
  display: inline-block;
  width: 28px;
  height: 24px;
}

.button-line {
  display: flex;
  justify-content: flex-end;

}

</style>
