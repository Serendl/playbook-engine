<template>
  <div class="home">
    <h1>Recommendation Template</h1>

    <div v-if="attributes.length > 0" class="content-container">
      <div class="button-line">
        <button @click="addTemplate()" class="btn btn-primary me-3">+ Add Value Define Panel</button>
        <!-- <button @click="triggerFileUpload" class="btn btn-primary me-3">Import Model</button> -->
        <!-- <input type="file" ref="fileInput" @change="importModel" accept=".json" style="display: none;" /> -->
        <button @click="saveModel" class="btn btn-primary text-end">Save Model</button>
      </div>

      <div class="process-detail">

        <div v-for="(attrTemplate, index) in attributeTemplates" :key="index" class="align-items-center section-area">
          <h4 class="section-title mb-2">
            <div class="d-flex align-items-center">
              <div class="me-2">
                <button v-if="attrTemplate.show" @click="expand(index)" class="drop-down-button">
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
              Model {{ index + 1 }}
            </div>
            <div>
              <button @click="deleteTemplate(index)" class="delete-button ms-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M10 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 11V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M4 7H20" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </h4>
          <div v-show="attrTemplate.show" class="align=itmes-center">
            <div class="d-flex align-items-center mb-1" style="align-items: baseline;">
              <input v-model="attrTemplate.name" class="form-control mb-2" placeholder="Value Template Name" style="width: 200px;" />
            </div>
            <div class="section-description">
              <textarea v-model="attrTemplate.description" rows="3" class="form-control mb-3" placeholder="Value Description"></textarea>
            </div>
            <div v-for="(attr, index) in attrTemplate.attrInfo" :key="index" >
              <div class="section quill-card">
                <div class="section-title" style="align-items: baseline;">
                  <h4 class="section-title"> {{ attr.attrName}}</h4>
                </div>

                <!-- Range Value Slider -->
                <div class="slider-area">
                  <SliderComp
                    v-model="attr.rangeValue"
                    :min="1"
                    :max="5"
                    :range="true"
                    class="w-56 slider-space custom-slider"
                  />

                  <div class="slider-info mt-2">
                    <div class="slider-value d-flex align-items-center" style="align-items: baseline;">
                      <input
                        type="text"
                        class="form-control me-2"
                        v-model="attr.rangeDesc"
                        placeholder="Value Range Description"
                        style="width: 200px;"
                      >
                      <p>({{ attr.rangeValue[0] }} - {{ attr.rangeValue[1] }})</p>
                    </div>

                    <textarea
                      v-model="attr.rangeExplan"
                      rows="3"
                      class="form-control"
                      placeholder="Range Explanation"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="button-line">
        <button @click="saveProcess" class="btn btn-primary text-end">Save Process</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import router from '@/router';
// import Quill from 'quill';

const processData = ref({
  type: '',
  processes: []
})

const attributes = ref([]);
const gateways = ref([]);
const events = ref([]);
let isLinear = true;

// let initialized = false;

const attributeTemplates = ref([]);

// const fileInput = ref(null);

const expand = (index) => {
  attributeTemplates.value[index].show = !attributeTemplates.value[index].show;
}

const saveModel = async() => {
  const data = {
    process: {
      type: processData.value.type,
      processes: processData.value.processes
    },
    gateways: gateways.value,
    events: events.value,
    processAttr: attributes.value,
    linear: isLinear,
    attributeTemplates: attributeTemplates.value
  }
  const dataString = JSON.stringify(data, null, 2);
  const blob = new Blob([dataString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'process.json';
  a.click();

  URL.revokeObjectURL(url);
};

// save the model and go to the next page
const saveProcess = async() => {
  const data = {
    process: {
      type: processData.value.type,
      processes: processData.value.processes
    },
    gateways: gateways.value,
    events: events.value,
    processAttr: attributes.value,
    linear: isLinear,
    attributeTemplates: attributeTemplates.value
  }
  localStorage.setItem('processData', JSON.stringify(data));

  router.push('/Playbook');

  console.log(1);
};

// const triggerFileUpload = () => {
//   fileInput.value.click();
// };

// // Function to import a model from a JSON file
// const importModel = (event) => {
//   const file = event.target.files[0];

//   if (file) {
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       try {
//         const importedData = JSON.parse(e.target.result);

//         // Check if the imported data has the required properties
//         if (
//           importedData
//         ) {
//           // load the imported data into the data variables
//           processData.value = importedData.process;
//           attributes.value = importedData.processAttr;
//           gateways.value = importedData.gateways;
//           events.value = importedData.events;
//           isLinear = importedData.linear;
//           attributeTemplates.value = importedData.attributeTemplates;

//           console.log('Data improted successfully:', importedData);
//         } else {
//           console.error('JSON file does not contain the required data.');
//         }
//       } catch (error) {
//         console.error('Import error:', error);
//       }
//     };

//     reader.readAsText(file);
//   }
// };

onMounted(async() => {
  const processDataStorage = JSON.parse(localStorage.getItem('processData'));
  if (processDataStorage) {
    processData.value = processDataStorage.process;
    attributes.value = processDataStorage.processAttr;
    gateways.value = processDataStorage.gateways;
    events.value = processDataStorage.events;
    isLinear = processDataStorage.linear;
    attributeTemplates.value = processDataStorage.attributeTemplates;
    // if (processDataStorage.attributeTemplates) {
    //   attrTemplates.value = processDataStorage.attributeTemplates;
    // } else {
    //   attrTemplates.value = [];
    // }
    // initialized = true;
  }


})

const addTemplate = () => {
  // initialized = false;
  const template = {
    id: attributeTemplates.value.length + 1,
    name: '',
    description: '',
    show: true,
    attrInfo: []
  }
  attributes.value.forEach(attr => {
    // const newAttribute = {
    //   attrName: attr.name,
    //   value: 1,
    //   valueDesc: ['', '', '', '', ''],
    //   valueExplan: ['', '', '', '', '']
    // }
    const newAttribute = {
      attrName: attr.name,
      rangeValue: [1, 5],
      rangeDesc: '',
      rangeExplan: ''
    }
    template.attrInfo.push(newAttribute);
  })
  attributeTemplates.value.push(template);
  // initialized = true;
}

const deleteTemplate = (index) => {
  attributeTemplates.value.splice(index, 1);
}

</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

.content-container {
  /* display: flex; */
  width: 100%;
  max-width: 1200px;
  margin-top: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.process-area {
  display: flex;
}

.drop-down-button {
  height: 24px;
  width: 28px;
  background-color: transparent;
  border: none;
  cursor: pointer;
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
  min-width: 90vh;
  margin-bottom: 30px;
  background-color: #f1f1f1;
}

.section-description {
  width: 100%;
  max-width: 800px;
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
  max-height: 80vh;
  overflow-y: auto;
  align-items: center;
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

:deep(.custom-slider .p-slider-range) {
  background: #000000 !important;
}

:deep(.custom-slider .p-slider-handle) {
  background: #000000 !important;
  border-color: #2d2d2d !important;
}

:deep(.custom-slider) {
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
