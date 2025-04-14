<template>
  <div class="home">
    <!-- Title -->
    <h1>Define Attributes</h1>

    <div class="content-container">
      <!-- Add Process Section -->
      <div class="button-line">
        <div>
          <button @click="visible = true" class="btn btn-primary me-3">Add Option Attribute</button>
          <button @click="triggerFileUpload" class="btn btn-primary me-3">Import Model</button>
          <input type="file" ref="fileInput" @change="importModel" accept=".json" style="display: none;" />
          <button @click="saveModel" class="btn btn-primary text-end">Save Model</button>
        </div>
      </div>

      <div class="generate-process">

        <div v-for="(process, index) in processData.processes" :key="index" class="process-item">
          <div class="name-delete">
            <div class="id-name-row" style="align-items: baseline;">
              <p>ID: {{ index + 1 }} </p>
              <label>Process Name: {{ process.name }}</label>
              <label class="ms-5">Choice Number Range: </label>
              <input v-model="process.lowChoiceNum" placeholder="Low Choice Number" class="choice-number-input form-control" />
              <label class="ms-2">to</label>
              <input v-model="process.upChoiceNum" placeholder="Up Choice Number" class="choice-number-input form-control" />
            </div>
          </div>

          <div v-for="(subProcess, subIndex) in process.subProcessArray" :key="subIndex" class="attribute-item">
            <hr class="my-4" />
            <div class="name-delete">
              <div class="id-name-row">
                <label class="me-3">{{ getPrefix(subIndex) }}</label>
                <label>Name: {{subProcess.name}}</label>
              </div>
            </div>

            <div v-if="subProcess.subAttrArray.length > 0">
              <hr style="border: none; border-top: 1px dashed #999;" />
              <p>Property Attributes:</p>

              <div v-for="(attribute, attrIndex) in subProcess.subAttrArray" :key="attrIndex" class="mt-2">

                <div class="name-delete">
                  <div class="attribute-row">
                    <label class="me-2">Attribute Name: {{attribute.name}}</label>
                    <label>Attribute Value:</label>
                    <input v-model="attribute.value" placeholder="Attribute Value" class="form-control attribute-input ms-2" />
                  </div>
                  <div>
                    <button @click="deleteAttr(index, proIndex, attrIndex)" class="delete-btn ms-2">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div class="mt-3 button-line">
        <button v-show="processData.processes" @click="saveProcess()" class="me-3">Save Process</button>
      </div>
    </div>
  </div>

  <DialogComp v-model:visible="visible" modal header="Add Attribute" :style="{ width: '25rem' }">
    <p style="font-size: 1.15em">Please Enter the Attribute Name:</p>
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
import { ref, onMounted, nextTick } from 'vue';
import * as MiniZinc from 'minizinc';
import GWConstraint from '@/model/Gateconstraint.txt?raw';

const GWConstraintString = GWConstraint;

const visible = ref(false);
const attrName = ref('');

// List of processes
const processData = ref([]);

const gateways = ref([]);
const events = ref([]);
const isLinear = ref('false')

// const completeData = ref('');

const fileInput = ref(null);

let modelString = 'enum Property;\n' +
                  'array[Property] of var bool: chosen ::no_output;\n' +
                  'set of Property: chosen_prop ::output ::output_only = {p | p in Property where fix(chosen[p])};\n' +
                  'list of record(Property: p, list of Property: req): dependencies;\n' +
                  'constraint forall(p in Property where length([0 | i in index_set(dependencies) where dependencies[i].p = p]) > 0) (\n' +
                  '  chosen[p] -> exists(i in index_set(dependencies) where dependencies[i].p = p) (\n' +
                  '    forall(r in dependencies[i].req) (chosen[r])\n' +
                  '  )\n' +
                  ');\n' +
                  'list of record(set of Property: props, set of int: n): card; \n' +
                  'constraint forall(i in index_set(card)) (  \n' +
                  '  count(p in card[i].props)(chosen[p]) in card[i].n  \n' +
                  '); \n';

let dataString = '';

let attrString = '';

let gwDataString = '';

const attributes = ref([]);

const solutions = ref([]);

const getPrefix = (subIndex) => {
  return  'Option' + ' ' + String.fromCharCode(65 + subIndex);
}

const dsReplenish = () => {
  // Property = OptionA(1..3) ++ OptionB(1..3) ++ OptionC(1..3);
  let propTemplate = 'Property = ';
  processData.value.processes.forEach((process, proIndex) =>{
    let proDeclare = 'Option';
    if (proIndex != processData.value.processes.length - 1) {
      proDeclare += `${proIndex + 1}(1..${process.subProcessArray.length}) ++ `;
    } else {
      proDeclare += `${proIndex + 1}(1..${process.subProcessArray.length}); \n`;
    }
    propTemplate += proDeclare;
  })

  dataString += propTemplate;

  // dependencies = [
  //   (p: OptionC(2), req: [OptionA(1), OptionB(2)]),
  //   (p: OptionC(1), req: [OptionA(2), OptionB(2)]),
  //   (p: OptionC(1), req: [OptionA(3), OptionB(3)]),
  //   (p: OptionC(3), req: [OptionA(3)]),
  // ];
  let depTemplate = 'dependencies = [';
  processData.value.processes.forEach((process, proIndex) => {
    process.subProcessArray.forEach((subPro, subIndex) => {
      if (subPro.depListArray.length > 0) {
        subPro.depListArray.forEach((depList, depListIndex) => {
          let depDeclare = `(p: Option${proIndex + 1}(${subIndex + 1}), req: [`;
          const grouped = new Map();
          depList.dependencies.forEach((listDep) => {
            const { process, subPro} = listDep;
            if (!grouped.has(process)) {
              grouped.set(process, []);
            }
            grouped.get(process).push(subPro);
          });
          grouped.forEach((mapsubPros, mapprocess) => {
            mapsubPros.forEach((mapsubPro, subProIndex) => {
              if (subProIndex != mapsubPros.length - 1) {
                depDeclare += `Option${mapprocess}(${mapsubPro}), `;
              } else {
                depDeclare += `Option${mapprocess}(${mapsubPro})])`;
              }
            })
          })
          if (proIndex == processData.value.processes.length - 1 && subIndex == process.subProcessArray.length - 1 && depListIndex == subPro.depListArray.length - 1) {
              depTemplate += depDeclare;
            } else {
              depTemplate += depDeclare + ', \n';
            }
        });

      }
    });
  });
  depTemplate += '];\n';

  dataString += depTemplate;

  // card = [
  //   (props: OptionA(1..3), n: 1..1),
  //   (props: OptionB(1..3), n: 1..1),
  //   (props: OptionC(1..3), n: 1..1),
  // ];
  let cardTemplate = 'card = [';
  processData.value.processes.forEach((process, proIndex) => {
    let cardDeclare = `(props: Option${proIndex + 1}(1..${process.subProcessArray.length}), n: ${process.lowChoiceNum}..${process.upChoiceNum})`;
    if (proIndex == processData.value.processes.length - 1) {
      cardTemplate += cardDeclare;
    } else {
      cardTemplate += cardDeclare + ', \n';
    }
  });
  cardTemplate += '];\n';

  // cost = [80, 45, 50, 40, 15, 60, 40, 250, 100];
  if (attributes.value.length > 0) {
    attributes.value.forEach((attribute, attributeIndex) => {
      let attrDeclare = `${attribute.name} = [`;
      processData.value.processes.forEach((process, proIndex) => {
        process.subProcessArray.forEach((subPro, subIndex) => {
          if(subPro.subAttrArray.length > 0) {
            subPro.subAttrArray.forEach((attr, attrIndex) => {
              if (attribute.name === attr.name && attributeIndex === attrIndex) {
                if (proIndex === processData.value.processes.length - 1 && subIndex == process.subProcessArray.length - 1) {
                  attrDeclare += `${attr.value}];\n`;
                } else {
                  attrDeclare += `${attr.value}, `;
                }
              }
            })
          }
        })
      })
      attrString += attrDeclare;
    })
    let attrDefine = '';
    attributes.value.forEach((attribute) => {
      attrDefine += `array[Property] of ${attribute.type}: ${attribute.name};\n`;
      attrDefine += `${attribute.type}: max${attribute.name} = sum(${attribute.name});\n`
      attrDefine += `var 0..max${attribute.name}: Total${attribute.name} ::output = sum(p in Property)(chosen[p]*${attribute.name}[p]);\n`
    })
    modelString += attrDefine;
    dataString += attrString;
  }

  dataString += cardTemplate;


  if (processData.value.type === 'Configurator Playbook') {
    modelString += GWConstraintString;
    dataString += gwDataString;
  }

  console.log('Model String:', modelString);
  console.log('Data String:', dataString);
};


const addAttribute = () => {
  processData.value.processes.forEach(process => {
    process.subProcessArray.forEach(option => {
      const newAttribute = {
        name: attrName.value,
        value: '0',
      };
      option.subAttrArray.push(newAttribute);
    });
  });
  const newAttr = {
    name: attrName.value,
    type: 'int',
    index: 0,
    lowBound: 0,
    upBound: 0,
    operation: ''
  }
  attributes.value.push(newAttr);
  attrName.value = '';
}

const deleteAttr = (attrIndex) => {
  processData.value.processes.forEach(process => {
    process.subProcessArray.forEach(option => {
      option.subAttrArray.splice(attrIndex, 1);
    });
  });
  attributes.value.splice(attrIndex, 1);
}

const saveProcess = async() => {
  // complete the model string
  dsReplenish();

  try{
    await solveModel();
    sessionStorage.setItem('allSolutions', JSON.stringify(solutions.value));
    console.log('All solutions stored:', solutions.value);
  } catch (error) {
    console.error('Error during solving:', error);
  }

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

  if (attributes.value.length > 0) {
    router.push('/AttrTemplate');
  } else {
    router.push('/ConfiguratorPlaybook');
  }
  console.log(1);
};

const saveModel = async() => {
  const data = {
    process: {
      type: processData.value.type,
      processes: processData.value.processes
    },
    gateways: gateways.value,
    events: events.value,
    processAttr: attributes.value,
    linear: isLinear.value
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

const triggerFileUpload = () => {
  fileInput.value.click();
};

// // Function to import a model from a JSON file
const importModel = (event) => {
  const file = event.target.files[0];

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
          attributes.value = importedData.processAttr;
          gateways.value = importedData.gateways;
          events.value = importedData.events;
          isLinear.value = importedData.linear;

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

// click the solve button to solve the model
const solveModel = async () => {
  const model = new MiniZinc.Model();
  console.log(modelString);
  console.log(dataString);
  model.addString(modelString);
  model.addString(dataString);
  if (!model) {
    console.error('Model is not loaded yet.');
    return;
  }

  try {
    const solve = model.solve({
      options: {
        solver: 'gecode',
        'all-solutions': true,
      },
    });

    await new Promise((resolve, reject) => {
      solutions.value = []; // clear the previous results

      // parse the solutions
      solve.on('solution', solution => {
        console.log('Solution:', solution.output.json);
        solutions.value.push(solution.output.json);
      });

      // listen to the solve status
      solve.then(result => {
        console.log('Solve Status:', result.status);
        resolve(); // mark as success
      });

      // listen to the solve error
      solve.on('error', error => {
        console.error('Solve error:', error);
        reject(error); // mark as error
      });
    });
  } catch (error) {
    console.error('Error during solving model:', error);
    throw error;
  }
};

onMounted(async() => {
  await nextTick();
  const processDataStorage = JSON.parse(localStorage.getItem('processData'));
  const gwDataStorage = JSON.parse(localStorage.getItem('GWConstraint'));

  if (processDataStorage) {
    processData.value = processDataStorage.process;
    attributes.value = processDataStorage.processAttr;
    gateways.value = processDataStorage.gateways;
    events.value = processDataStorage.events;
    isLinear.value = processDataStorage.linear;
  }

  if (gwDataStorage) {
    gwDataString = gwDataStorage;
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
</style>
