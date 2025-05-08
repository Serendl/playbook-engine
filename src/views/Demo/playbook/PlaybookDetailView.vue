<template>
  <div class="container">
    <div class="mt-3" style="width: 100%;">
      <div v-if="selectedProcess">
        <h1>Process {{ props.currentProcess[0] + 1 }}. {{ localProcess.name }}</h1>
        <!-- <div class="text-end">
          <button
            @click="onClick"
            class="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
          >
            <FileImageOutlined style="font-size: 20px" />
          </button>
        </div> -->
      </div>
      <div v-if="localSubProcess">
        <h2>{{ getPrefix() }}</h2>
      </div>
      <hr>


      <div class="process-area">
        <div class="process-detail">
          <div v-if="selectedSubProcess" >

            <div v-if="localSubProcess.description" class="description quill-card">
              <h3>Description</h3>
              <div id="subDescQuill">
                <p>{{ localSubProcess.description }}</p>
              </div>
            </div>

            <div v-if="localSubProcess.sectionArray.length > 0 " class="section-area">
              <h3>Sections</h3>
              <div v-for="(section, index) in localSubProcess.sectionArray" :key="index">
                <div class="section quill-card">
                  <div class="section-title" style="align-items: baseline;">
                    <h5>{{section.title}}</h5>
                  </div>
                  <div class="section-description">
                    <p>{{ section.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="localSubProcess.attributeArray.length > 0 " class="section-area">
              <h3>Value Define Panel</h3>
              <div v-for="(attr, index) in localSubProcess.attributeArray" :key="index">
                <div class="section quill-card">
                  <div class="section-title" style="align-items: baseline;">
                    <h5 type="text" class="me-2" placeholder="Value Title">{{ attr.title }}</h5>
                  </div>
                  <div class="section-description">
                    <!-- <input type="text" class="form-control" v-model="attr.description" placeholder="Value Description"> -->
                    <!-- <textarea v-model="attr.description" rows="5" class="form-control" placeholder="Value Description"></textarea> -->
                    <p>{{ attr.description }}</p>
                  </div>

                  <div class="slider-area">
                    <SliderComp v-model="attr.value" :min="1" :max="5" class="w-56 slider-space costom-slider"></SliderComp>
                    <div class="slider-info">
                      <div class="slider-value">
                        <!-- <input type="text" class="form-control me-2" v-model="attr.valueDesc[attr.value - 1]" placeholder="Value Description" style="width: 200px;"> -->
                        <p style="font-size: 20px">{{ attr.valueDesc[attr.value - 1] }} ({{ attr.value }})</p>
                      </div>
                      <!-- <input type="text" class="form-control" v-model="attr.valueExplan[attr.value - 1 ]" placeholder="Value Explanation"> -->
                      <!-- <textarea v-model="attr.valueExplan[attr.value - 1 ]" rows="3" class="form-control" placeholder="Value Explanation"></textarea> -->
                      <p>{{ attr.valueExplan[attr.value - 1 ] }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="description quill-card">
            <h3>Description</h3>
            <div id="descQuill">
              <p>{{ localProcess.description }}</p>
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

const emit = defineEmits(['previousPage', 'nextPage', 'nextStep']);

const localProcess = computed({
  get: () => props.selectedProcess
})

const localSubProcess = computed({
  get: () => props.selectedSubProcess
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
