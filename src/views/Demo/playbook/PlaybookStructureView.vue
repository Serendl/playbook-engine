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
          </div>
          <div v-show="process.show" v-for="(subProcess, subIndex) in process.subProcessArray" :key="subIndex">
            <div class="d-flex align-items-center subprocess-name">
              <div class="subprocess-line ms-1 mb-1">

                <Checkbox
                  v-if="props.processData.type === 'Configurator Playbook'"
                  :input-id="'option-' + index + '-property-' + subIndex"
                  :name="'option-' + index"
                  :value="subIndex"
                  v-model="localChoices[index]"
                  @change="updateLastChoice(index, subIndex)"
                  :disabled="!localProcessSolution[index]?.has(subIndex + 1)"
                />
                <!-- <label :for="'option-' + index + '-property-' + subIndex" class="ms-2">{{ getPrefix(subIndex) }}: {{ subProcess.name }}</label> -->

                <div @click="selectSubProcess(index, subIndex)" class="ms-2 process-name">
                  <!-- {{ index + 1 }}.{{ subIndex + 1 }} {{ subprocess.name }} -->
                  {{ getPrefix(index, subIndex) }} {{ subProcess.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-3 button-line">
        <button @click="nextStep()" class="btn btn-primary">Define Attributes</button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue';
import Checkbox from 'primevue/checkbox';

const props = defineProps({
  processData: {
    type: Object,
    required: true
  },
  choices: {
    type: Array,
    required: true
  },
  processSolution: {
    type: Array,
    required: true
  }
});

const localChoices = computed({
  get: () => props.choices,
  set: (value) => {
    emit('updateChoices', value);
  }
})

const localProcessSolution = computed({
  get: () => props.processSolution,
  set: (value) => {
    emit('updateChoices', value);
  }
})

const emit = defineEmits(['expand', 'addProcess', 'deleteProcess', 'deleteSubProcess', 'addSubProcess', 'selectProcess', 'selectSubProcess', 'saveProcess', 'importProcess', 'nextStep', 'updateChoices', 'updateLastChoice']);

// const fileInput = ref(null);

const updateLastChoice = (index, subIndex) => {
  emit('updateLastChoice', index, subIndex);
}

const expand = (index) => {
  emit('expand', index);
}

const selectProcess = (index) => {
  emit('selectProcess', index);
}

const selectSubProcess = (index, subIndex) => {
  emit('selectSubProcess', index, subIndex);
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
