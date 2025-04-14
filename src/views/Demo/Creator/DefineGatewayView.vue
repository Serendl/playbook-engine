<template>
  <div class="home">
    <!-- Title -->
    <h1>Define Gateway Dependencies</h1>

    <div class="content-container">
      <!-- Add Process Section -->
      <div class="button-line">
        <div>
          <!-- <button @click="addOption" class="btn btn-primary me-3">Add Option</button> -->
          <!-- <button @click="addAttribute" class="btn btn-primary me-3">Add Property Attribute</button> -->
          <button @click="triggerFileUpload()" class="btn btn-primary me-3">Import</button>
          <input type="file" ref="fileInput" @change="importModel" accept=".json" style="display: none;" />
          <button @click="saveModel()" class="btn btn-primary text-end">Save</button>
        </div>
        <!-- <div>
          <button @click="saveModel" class="btn btn-primary mt-3 text-end">Save Model</button>
          <button @click="triggerFileUpload" class="btn btn-primary mt-3 ms-2">Import Model</button>
          <input type="file" ref="fileInput" @change="importModel" accept=".json" style="display: none;" />
        </div> -->
      </div>

      <div class="generate-process">

        <div v-for="(gateway, index) in gateways" :key="index" class="process-item">
          <div class="name-delete">
            <div class="id-name-row" style="align-items: baseline;">
              <h4>Process Name: {{ gateway.name }}</h4>
              <p class="ms-3">Incoming Activity ID: {{ gateway.incomingDetails[index].id }} </p>
              <p class="ms-3">Incoming Activity Name: {{ gateway.incomingDetails[index].name }} </p>
            </div>

            <!-- <div>
              <button v-show="options.length" @click="addProperty(index)">Add Property to the Option</button>
              <button @click="deleteOption(index)" class="delete-btn ms-2">🗑️</button>
            </div> -->
          </div>



          <div v-for="(outProcess, outIndex) in gateway.outgoingDetails" :key="outIndex" class="attribute-item">
            <hr class="my-4" />
            <div class="name-delete">
              <div class="id-name-row">
                <div class="id-name-row row-part1">
                  <label class="me-3">{{ getPrefix(outIndex) }}</label>
                  <label>Name: {{outProcess.name}}</label>
                </div>
                <div class="id-name-row row-part2">
                  <label class="ms-5">Depend Process: </label>
                  <select v-model="outProcess.selectedPro" class="form-select selection" aria-label="Dependency process select">
                    <option v-for="item in gateway.incomingDetails" :key="item.id" :value="item">{{ item.name }}</option>
                  </select>
                  <label class="ms-5">Depend Option: </label>
                  <select v-if="outProcess.selectedPro" v-model="outProcess.selectedOption" class="form-select selection" aria-label="Dependency option select">
                    <option v-for="item in outProcess.selectedPro.subProcessArray" :key="item.id" :value="item.id">{{ item.name }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div class="mt-3 button-line">
        <button @click="defineAttr()" class="me-3">Define Attributes</button>
      </div>
    </div>
  </div>

  <DialogComp v-model:visible="visible" modal header="Add Attribute" :style="{ width: '25rem' }">
    <p style="font-size: 1.15em">Please Enter the Attribute Name:</p>
    <!-- <span class="text-surface-800 dark:text-surface-400 block mb-8">Please Enter the Attribute Name:</span> -->
    <div class="id-name-row mt-3 mb-3" style="align-items: baseline;">
        <label for="attribute name" class="font-semibold w-24 me-2">Attribute Name: </label>
        <input v-model="attrName" id="attribute name" class="flex-auto process-name-input form-control" autocomplete="off" />
    </div>
    <div class="flex gap-2"  style="display: flex; justify-content: flex-end; max-width: 500px;">
        <button type="button" label="Cancel" class="btn btn-primary me-3" @click="visible = false">Cancel</button>
        <button type="button" label="Save" class="btn btn-primary me-3" @click="{visible = false; addAttribute()}">Save</button>
    </div>
  </DialogComp>

</template>

<script setup>
import router from '@/router';
import { ref, onMounted } from 'vue';

const visible = ref(false);
const attrName = ref('');

// List of processes
const processData = ref([]);

// List of gateways
const gateways = ref([]);

const attributes = ref([]);
const events = ref([]);
let isLinear = true;

const fileInput = ref(null);

const GWConstraint = ref('');

// gateway activity choosen number can be 0
const generateGWConstraint = () => {
  // Gateway = Gate(1..1);
  const gateDefine = `Gateway = Gate(1..${gateways.value.length});`;
  GWConstraint.value += gateDefine + '\n';

  // gateDependencies = [(p: Option3(3), req: [Option1(3)])];
  // p: Option + 'outPro.index' + ('outPro.subPro.index')
  // req: Option + 'selectedPro.index' + ('selectedOption')
  let gateDependencies = 'gateDependencies = [';
  // gateOutgoings = [(g: Gate(1), props: Option2(1..3)), (g: Gate(1), props: Option3(1..3))];
  // g: Gate + '(gate.index)'
  // props: Option + 'outPro.index' + ('1..outPro.subPro.length)')
  let gateOutgoings = 'gateOutgoings = [';
  gateways.value.forEach((gateway, index) => {
    gateway.outgoingDetails.forEach((outProcess, outIndex) => {
      outProcess.subProcessArray.forEach((outSub, outSubIndex) => {
        // gateDependencies part
        const gd = `(p: Option${outProcess.index + 1}(${outSubIndex + 1}), req: [Option${outProcess.selectedPro.index + 1}(${outProcess.selectedOption})])`;
        gateDependencies += gd;
        if ( index === gateways.value.length - 1 && outIndex === gateway.outgoingDetails.length - 1 && outSubIndex === outProcess.subProcessArray.length - 1) {
          gateDependencies += ']; \n';
        } else {
          gateDependencies += ',\n ';
        }
      })
      // gateOutgoings part
      const go = `(g: Gate(${index + 1}), props: Option${outProcess.index + 1}(1..${outProcess.subProcessArray.length}))`;
      gateOutgoings += go;
      if ( index === gateways.value.length - 1 && outIndex === gateway.outgoingDetails.length - 1) {
        gateOutgoings += '];';
      } else {
        gateOutgoings += ',\n ';
      }
    })
  })

  GWConstraint.value += gateDependencies;
  GWConstraint.value += gateOutgoings;
  console.log('GWConstraint:', GWConstraint.value);
  localStorage.setItem('GWConstraint', JSON.stringify(GWConstraint.value));
}

const getPrefix = (index) => {
  return  'Subsequent' + ' ' + (index + 1);
}

// Function to save the model to a JSON file
const saveModel = async() => {
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
  a.download = 'DefineGateway.json';
  a.click();

  URL.revokeObjectURL(url);
};

const triggerFileUpload = () => {
  fileInput.value.click();
};

// Function to import a model from a JSON file
const importModel = (event) => {
  const file = event.target.files[0];

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

          console.log('Data improted successfully:', importedData);
        } else {
          console.error('JSON file does not contain the required data.');
        }
      } catch (error) {
        console.error('Import error:', error);
      }
    };

    reader.readAsText(file);
  }
};


// Go to the next step
const defineAttr = () => {
  // generate gateway constraints
  generateGWConstraint();
  localStorage.setItem('gateways', JSON.stringify(gateways.value));
  router.push('/DefineAttr');
};

onMounted(async() => {
  // const gatewayStorage = JSON.parse(localStorage.getItem('gateways'));
  const processDataStorage = JSON.parse(localStorage.getItem('processData'));

  // console.log('Gateway Storage:', gatewayStorage);
  // console.log('Process Storage:', processStorage);

  if (processDataStorage) {
    gateways.value = processDataStorage.gateways;
    processData.value = processDataStorage.process;
    attributes.value = processDataStorage.processAttr;
    gateways.value = processDataStorage.gateways;
    events.value = processDataStorage.events;
    isLinear = processDataStorage.linear;

    const processMap = {};
    const indexMap = {};
    processData.value.processes.forEach((process, index) => {
      processMap[process.id] = process;
      indexMap[process.id] = index;
    });

    gateways.value.forEach((gateway) => {
      gateway.incomingDetails = gateway.incoming.map(id => {
        const proc = processMap[id];
        proc.index = indexMap[id];
        return proc;
      })

      gateway.outgoingDetails = gateway.outgoing.map(id => {
        const proc = processMap[id];
        proc.index = indexMap[id];
        return proc;
      })
    })
  }
});
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
}

.generate-process {
  /* width: 50%; */
  margin-right: 20px;
  margin-bottom: 20px;
  margin-top: 20px;
  max-height: 75vh;
  overflow-y: auto;
}

.process-item {
  position: relative;
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.id-name-row {
  display: flex;
  gap: 5px;
  align-items: baseline;
  width: 100%;
}

.pretask-posttask-row, .constraint-details-row {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  align-items: center;
}

.process-name-input, .constraint-name-input {
  width: 150px; /* Adjust the width to your preference */
}

.choice-number-input {
  width: 50px; /* Adjust the width to your preference */
}

.attribute-input, .constraint-input, .constraint-select {
  width: 150px; /* Adjust the width to your preference */
}

.attribute-row, .constraint-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 5px;
}

.button-line {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.name-delete {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.dependency-row {
  display: flex;
  gap: 10px;
  align-items: center;
  /* margin-top: 20px; */
}

.row-part1 {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 20%;
}

.row-part2 {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 80%;
}

.selection {
  min-width: 150px; /* Adjust the width to your preference */
  max-width: 250px; /* Adjust the width to your preference */
}
</style>
