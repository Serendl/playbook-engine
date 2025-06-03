<template>
  <div class="container">
    <div class="mt-3" style="width: 100%;">
      <div v-if="selectedProcess">
        <!-- <h1>Process {{ selectedProcess.id }}  {{selectedProcess.name}}</h1> -->
         <h1>Process {{ props.currentProcess[0] + 1 }}. {{ localProcess.name }}</h1>
      </div>
      <div v-if="selectedSubProcess">
        <!-- <h2>SubProcess {{ selectedSubProcess.id }} {{ selectedSubProcess.name }}</h2> -->
        <!-- <h2>SubProcess {{ localSubProcess.id }} {{ localSubProcess.name }}</h2> -->
         <h2>{{ getPrefix() }}</h2>
      </div>
      <hr>


      <div class="process-area">
        <div class="process-detail">
          <div v-if="selectedSubProcess" >
            <div class="button-line">
              <button @click="addDepList()" class="btn btn-primary me-3">+ Add Dependency List</button>
              <button @click="addSection()" class="btn btn-primary me-3">+ Add Section</button>
              <!-- <button @click="addValuePanel()" class="btn btn-primary me-3">+ Add Value Define Panel</button> -->
            </div>

            <div class="description quill-card">
              <h3>Description</h3>
              <div id="subDescQuill">
                <textarea v-model="localSubProcess.description" rows="5" class="form-control" placeholder="Sub Process Description"></textarea>
              </div>
            </div>

            <div v-if="localSubProcess.depListArray.length > 0" class="dependecy-area">
              <div>
                <h3>Dependency</h3>
              </div>
              <div v-for="(depList, depListIndex) in localSubProcess.depListArray" :key="depListIndex" class="depList quill-card">
                <div class="depList-id"  style="align-items: baseline;">
                  <h5>DepList {{ depListIndex + 1 }}</h5>
                  <div>
                    <button @click="addDep(depListIndex)" class="delete-button me-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 24 24" fill="none">
                        <g id="Edit / Add_Plus">
                          <path id="Vector" d="M6 12H12M12 12H18M12 12V18M12 12V6" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                      </svg>
                    </button>
                    <button @click="deleteDepList(depListIndex)" class="delete-button">
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
                <div class="depList-name">
                  <label class="me-2">Name:</label>
                  <input type="text" class="form-control" v-model="depList.name" placeholder="DepList Name" style="width: 60%; height: 80%;">
                </div>
                <div v-for="(dep, depIndex) in depList.dependencies" :key="depIndex" class="dep">
                  <hr style="border: none; border-top: 1px dashed #999;" />
                    <div class="depRow">
                      <div class="d-flex align-items-center">
                        <label class="me-2">Process:</label>
                        <!-- <input type="text" class="form-control me-2" v-model="dep.process" placeholder="Process ID" style="width: 25%; height: 80%;"> -->
                        <select class="form-select me-2" v-model="dep.process" style="width: 25%; height: 80%;">
                          <option v-for="(item, index) in props.processData.processes" :key="index" :value="index + 1">{{ item.name }}</option>
                        </select>
                        <label class="me-2">SubPro:</label>
                        <!-- <input type="text" class="form-control" v-model="dep.subPro" placeholder="SubPro ID" style="width: 25%; height: 80%;"> -->
                        <select v-if="dep.process" class="form-select" v-model="dep.subPro" style="width: 25%; height: 80%;">
                          <option v-for="(item, index) in props.processData.processes[dep.process - 1].subProcessArray" :key="index + 1" :value="index">{{ item.name }}</option>
                        </select>
                      </div>
                      <div>
                        <button @click="deleteDep(depListIndex, depIndex)" class="delete-button">
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

            <div v-if="localSubProcess.sectionArray.length > 0 " class="section-area">
              <h3>Sections</h3>
              <div v-for="(section, index) in localSubProcess.sectionArray" :key="index">
                <div class="section quill-card">
                  <div class="section-title" style="align-items: baseline;">
                    <input type="text" class="form-control me-2" v-model="section.title" placeholder="Section Title">
                    <div>
                      <button @click="deleteSection(index)" class="delete-button ms-2">
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
                  <div class="section-description">
                    <!-- <input type="text" class="form-control" v-model="section.description" placeholder="Section Description"> -->
                    <textarea v-model="section.description" rows="5" class="form-control" placeholder="Section Description"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- <div v-if="localSubProcess.attributeArray.length > 0 " class="section-area">
              <h3>Value Define Panel</h3>
              <div v-for="(attr, index) in localSubProcess.attributeArray" :key="index">
                <div class="section quill-card">
                  <div class="section-title" style="align-items: baseline;">
                    <input type="text" class="form-control me-2" v-model="attr.title" placeholder="Value Title">
                    <div>
                      <button @click="deleteValue(index)" class="delete-button ms-2">
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
                  <div class="section-description">
                    <textarea v-model="attr.description" rows="5" class="form-control" placeholder="Value Description"></textarea>
                  </div>

                  <div class="slider-area">
                    <SliderComp v-model="attr.value" :min="1" :max="5" class="w-56 slider-space costom-slider"></SliderComp>
                    <div class="slider-info">
                      <div class="slider-value">
                        <input type="text" class="form-control me-2" v-model="attr.valueDesc[attr.value - 1]" placeholder="Value Description" style="width: 200px;">
                        <p>({{ attr.value }})</p>
                      </div>
                      <textarea v-model="attr.valueExplan[attr.value - 1 ]" rows="3" class="form-control" placeholder="Value Explanation"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div> -->
          </div>

          <div v-else class="description quill-card">
            <h3>Description</h3>
            <div id="descQuill">
              <textarea v-model="localProcess.description" rows="5" class="form-control" placeholder="Process Description"></textarea>
            </div>
          </div>

          <div class="button-line">
            <button v-if="currentProcess[0] + currentProcess[1] > -1 " @click="previousPage()" class="me-2 btn btn-primary">Previous Page</button>
            <button v-if="currentProcess[0] === totalpage[0] - 1 && currentProcess[1] === totalpage[1] -1 " @click="nextStep()" class="btn btn-primary">{{ getButtonDes() }}</button>
            <button v-else @click="nextPage()" class="btn btn-primary">Next Page</button>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
// import Quill from 'quill';

const props = defineProps({
  processData: {
    type: Object,
    required: true
  },
  selectedProcess: {
    type: Object,
    default: null
  },
  selectedSubProcess: {
    type: Object,
    default: null
  },
  currentProcess: {
    type: Array,
    default: () => [-1, -1]
  },
  totalpage: {
    type: Array,
    default: () => [0, 0]
  },
  type: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['updateProcess', 'updateSubProcess', 'previousPage', 'nextPage', 'nextStep']);

const localProcess = computed({
  get: () => props.selectedProcess,
  set: (value) => {
    emit('updateProcess', value);
  }
})

const localSubProcess = computed({
  get: () => props.selectedSubProcess,
  set: (value) => {
    emit('updateSubProcess', value);
  }
})


const getPrefix = () => {
  if (props.type === 'Text Playbook') {
    return  'SubProcess' + (props.currentProcess[1] + 1) + ' ' + localSubProcess.value.name;
  }
  if (props.type === 'Configurator Playbook') {
    return  'Option' + ' ' + String.fromCharCode(65 + props.currentProcess[1]) + '. ' + localSubProcess.value.name;
  }
}

const getButtonDes = () => {
  if (props.type === 'Text Playbook') {
    return 'Generate Process Model';
  }
  if (props.type === 'Configurator Playbook') {
    return 'Define Attributes';
  }
}

const addSection = () => {
  const newSection = {
    title: '',
    description: ''
  }
  localSubProcess.value.sectionArray.push(newSection);
}

const deleteSection = (index) => {
  localSubProcess.value.sectionArray.splice(index, 1);
}

const addValuePanel = () => {
  const newAttribute = {
    title: '',
    description: '',
    value: 1,
    valueDesc: ['', '', '', '', ''],
    valueExplan: ['', '', '', '', '']
  }
  localSubProcess.value.attributeArray.push(newAttribute);
}

// const deleteValue = (index) => {
//   localSubProcess.value.attributeArray.splice(index, 1);
// }

const addDepList = () => {
  const newDepList = {
    name: '',
    dependencies: []
  }

  newDepList.dependencies.push({
    process: '',
    subPro: ''
  })

  localSubProcess.value.depListArray.push(newDepList);
}

const deleteDepList = (index) => {
  localSubProcess.value.depListArray.splice(index, 1);
}

const addDep = (index) => {
  localSubProcess.value.depListArray[index].dependencies.push({
    process: '',
    subPro: ''
  });
}

const deleteDep = (depListIndex, depIndex) => {
  localSubProcess.value.depListArray[depListIndex].dependencies.splice(depIndex, 1);
}

const previousPage = () => {
  emit('previousPage');
}

const nextPage = () => {
  emit('nextPage');
}

const nextStep = () => {
  emit('nextStep');
}

</script>

<style scoped>
.process-area {
  display: flex;
}

.dependecy-area {
  width: 100%;
  max-width: 800px;
  /* height: 80vh; */
  background-color: #f1f1f1;
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  /* margin-left: 20px; */
  margin-bottom: 30px;
}

.button-line {
  display: flex;
  justify-content: flex-end;
  /* margin-bottom: 20px; */
  padding-bottom: 20px;
}

.description {
  margin-bottom: 30px;
  background-color: #f1f1f1;
}

.button-end {
  display: block;
  margin-left: auto;
}

.section-area {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  max-width: 800px;
  margin-bottom: 30px;
  background-color: #f1f1f1;
}

.quill-card {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  max-width: 800px;
}

.section {
  margin-bottom: 20px;
  background-color: #b0b0b026;
}

.section-title {
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.process-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 100vh;
}

.slider-space {
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: 5px;
  margin-right: 5px;
}

.slider-value{
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}

:deep(.costom-slider .p-slider-range) {
  background: #000000 !important;
}

:deep(.costom-slider .p-slider-handle) {
  background: #000000 !important;
  border-color: #2d2d2d !important;
}

:deep(.costom-slider) {
  background: #a2a2a2;
}

.delete-button {
  background-color: transparent;
  /* border: none; */
  border-radius: 8px;
  /* background-color: #f1f1f1; */
  cursor: pointer;
  border-color: grey;
}

.depList {
  margin-bottom: 20px;
  background-color: #b0b0b026;
}

.depList-id {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.depList-name {
  display: flex;
  align-items: center;
}

.depRow {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  align-items: baseline;
  justify-content: space-between;
}
</style>
