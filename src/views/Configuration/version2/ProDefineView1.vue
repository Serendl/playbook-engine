<template>
  <div class="home">
    <!-- Title -->
    <h1>Manage Your Process</h1>

    <div class="content-container">
      <!-- Add Process Section -->
      <div class="generate-process">
      <!-- <div v-show="showprocess" class="generate-process"> -->
        <h2>Generate Process</h2>
        <div class="name-delete">
          <div>
            <button @click="addOption" class="btn btn-primary me-3">Add Option</button>
            <!-- <button @click="addAttribute" class="btn btn-primary me-3">Add Property Attribute</button> -->
            <button @click="visible = true" class="btn btn-primary me-3">Add Property Attribute</button>
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
          </div>
          <div>
            <button @click="saveModel" class="btn btn-primary mt-3 text-end">Save Model</button>
            <button @click="triggerFileUpload" class="btn btn-primary mt-3 ms-2">Import Model</button>
            <input type="file" ref="fileInput" @change="importModel" accept=".json" style="display: none;" />
          </div>
        </div>
        <div v-for="(option, index) in options" :key="index" class="process-item">
          <div class="name-delete">
            <div class="id-name-row" style="align-items: baseline;">
              <p>ID: {{ index + 1 }} </p>
              <label>Option Name:</label>
              <input v-model="option.name" placeholder="Option Name" class="process-name-input form-control" />
              <label class="ms-5">Property Number: </label>
              <input v-model="option.propertyNum" @input="addProperty(index)" placeholder="Option Number" class="process-name-input form-control" />
              <label class="ms-5">Choice Number: </label>
              <input v-model="option.choiceNum" placeholder="Choice Number" class="process-name-input form-control" />
            </div>
            <div>
              <!-- <button v-show="options.length" @click="addProperty(index)">Add Property to the Option</button> -->
              <button @click="deleteOption(index)" class="delete-btn ms-2">🗑️</button>
            </div>
          </div>

          <div v-for="(property, proIndex) in option.properties" :key="proIndex" class="attribute-item">
            <hr class="my-4" />
            <div class="name-delete">
              <div class="id-name-row">
                <!-- <p>Option ID: {{ option.id }}</p> -->
                <label>Property {{ property.idName }}</label>
                <label>Property Name: </label>
                <input v-model="property.name" placeholder="Property Name" class="form-control attribute-input ms-2" />
              </div>
              <div>
                <button @click="addDepList(index, proIndex)">Add Dependency List</button>
                <button @click="deleteProperty(index, proIndex)" class="delete-btn ms-2">🗑️</button>
              </div>
            </div>

            <div v-if="property.attributes.length > 0">
              <hr style="border: none; border-top: 1px dashed #999;" />
              <p>Property Attributes:</p>
            </div>

            <div v-for="(attribute,attrIndex) in property.attributes" :key="attrIndex" class="mt-2">

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

            <div v-for="(depList, depListIndex) in property.depLists" :key="depListIndex" class="mt-2">
              <hr style="border: none; border-top: 1px dashed #999;" />
              <div class="name-delete">
                <div class="dependency-row">
                  <label>Dependency List ID: {{ depList.id }}</label>
                  <label>Dependency List Name: </label>
                  <input id="dependency option" v-model="depList.name" placeholder="Option Name" class="form-control attribute-input ms-2" />
                </div>
                <div>
                  <button @click="addDependency(index, proIndex, depListIndex)" class="ms-2">Add Dependency</button>
                  <button @click="deleteDepList(index, proIndex, depListIndex)" class="delete-btn ms-2">🗑️</button>
                </div>

              </div>
              <div v-for="(listDep, listDepIndex) in depList.dependencies" :key="listDepIndex" class="mt-2">
                <div class="name-delete">
                  <div class="dependency-row">
                    <label>Option:</label>
                    <input id="dependency option" v-model="listDep.option" placeholder="Option ID" class="form-control attribute-input ms-2" />
                    <label>Property:</label>
                    <input id="dependency property" v-model="listDep.propertyText" placeholder="Property" @input="updateDepProperty(listDep)" class="form-control attribute-input ms-2" />
                  </div>
                  <button @click="deleteDep(index, proIndex, depListIndex, listDepIndex)" class="delete-btn ms-2">🗑️</button>
                </div>

              </div>
            </div>
          </div>

        </div>

        <div class="mt-3">
          <button v-show="options.length" @click="saveProcess" class="me-3">Save Process</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from '@/router';
import { ref } from 'vue';
import * as MiniZinc from 'minizinc';

const visible = ref(false);
const attrName = ref('');

// List of processes
const options = ref([]);

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

const attributes = ref([]);

const solutions = ref([]);

const dsReplenish = () => {
  // Property = OptionA(1..3) ++ OptionB(1..3) ++ OptionC(1..3);
  let propTemplate = 'Property = ';
  options.value.forEach((option, optIndex) =>{
    let optDeclare = 'Option';
    if (optIndex != options.value.length - 1) {
      optDeclare += `${optIndex + 1}(1..${option.properties.length}) ++ `;
    } else {
      optDeclare += `${optIndex + 1}(1..${option.properties.length}); \n`;
    }
    propTemplate += optDeclare;
  })

  dataString += propTemplate;

  // dependencies = [
  //   (p: OptionC(2), req: [OptionA(1), OptionB(2)]),
  //   (p: OptionC(1), req: [OptionA(2), OptionB(2)]),
  //   (p: OptionC(1), req: [OptionA(3), OptionB(3)]),
  //   (p: OptionC(3), req: [OptionA(3)]),
  // ];
  let depTemplate = 'dependencies = [';
  options.value.forEach((option, optIndex) => {
    option.properties.forEach((property, proIndex) => {
      if (property.depLists.length > 0) {
        property.depLists.forEach((depList, depListIndex) => {
          let depDeclare = `(p: Option${optIndex + 1}(${proIndex + 1}), req: [`;
          depList.dependencies.forEach((listDep, listDepIndex) => {
            listDep.propertyArray.forEach((prop, propIndex) => {
              if (propIndex != listDep.propertyArray.length - 1 || listDepIndex != depList.dependencies.length - 1) {
                depDeclare += `Option${listDep.option}(${prop}), `;
              } else {
                depDeclare += `Option${listDep.option}(${prop})])`;
              }
            });
          });
          if (optIndex == options.value.length - 1 && proIndex == option.properties.length - 1 && depListIndex == property.depLists.length - 1) {
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
  options.value.forEach((option, optIndex) => {
    let cardDeclare = `(props: Option${optIndex + 1}(1..${option.properties.length}), n: 1..${option.choiceNum})`;
    if (optIndex == options.value.length - 1) {
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
      options.value.forEach((option, optIndex) => {
        option.properties.forEach((property, proIndex) => {
          if(property.attributes.length > 0) {
            property.attributes.forEach((attr, attrIndex) => {
              if (attribute.name === attr.name && attributeIndex === attrIndex) {
                if (optIndex === options.value.length - 1 && proIndex == option.properties.length - 1 && attrIndex == property.attributes.length - 1) {
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

  }

  dataString += cardTemplate;
  // console.log(dataString)
};

// Function to add a new process
const addOption = () => {
  const newOption = {
    id: options.value.length + 1, // Automatically generated unique ID
    name: '',
    propertyNum: '',
    choiceNum: 0,
    properties: []
  };
  options.value.push(newOption);
};

// Function to delete a process
const deleteOption = (index) => {
  options.value.splice(index, 1);
};

// Function to add property
const addProperty = (index) => {
  const propNum = parseInt(options.value[index].propertyNum);

  if (propNum < options.value[index].properties.length) {
    options.value[index].properties.splice(propNum - 1, options.value[index].properties.length - propNum);
  }
  else if (propNum > options.value[index].properties.length) {
    let length = options.value[index].properties.length;
    for (let i = 0; i < propNum - length; i++) {
      console.log
      const property = {
        id: options.value[index].properties.length + 1,
        idName: String.fromCharCode(65 + options.value[index].properties.length),
        name: '',
        depLists: [],
        attributes: []
      };
      options.value[index].properties.push(property);
    }
  }
};

// Function to add a new dependency to a depList
const addDependency = (optIndex, propIndex, depListIndex) => {
  const dependency = {
    option: '',
    propertyText: '',
    propertyArray: []
  };

  options.value[optIndex].properties[propIndex].depLists[depListIndex].dependencies.push(dependency);
};

const updateDepProperty = (dependency) => {
  if (!dependency.propertyText) {
    dependency.propertyArray = [];
    return;
  }

  dependency.propertyArray = dependency.propertyText
    .split(',')
    .map(pro => pro.trim()) // remove leading and trailing spaces
    .filter(pro => pro) // filter out empty strings
    .map(pro => pro.charCodeAt(0) - 'A'.charCodeAt(0) + 1); // ASCII to integer conversion
  console.log(dependency.propertyArray);
};

const deleteProperty = (optIndex, proIndex) => {
  options.value[optIndex].properties.splice(proIndex, 1);
};

const deleteDep = (optIndex, proIndex, depListIndex, listDepIndex) => {
  options.value[optIndex].properties[proIndex].depLists[depListIndex].dependencies.splice(listDepIndex, 1);
};

const addDepList = (optIndex, propIndex) => {
  const newdepList = {
    id: options.value[optIndex].properties[propIndex].depLists.length + 1, // Automatically generated unique ID
    name: '',
    dependencies: []
  };

  newdepList.dependencies.push({
    option: '',
    propertyText: '',
    propertyArray: [],
  });

  options.value[optIndex].properties[propIndex].depLists.push(newdepList);
}

const deleteDepList = (optIndex, propIndex, depListIndex) => {
  options.value[optIndex].properties[propIndex].depLists.splice(depListIndex, 1);
};

const addAttribute = () => {
  options.value.forEach(option => {
    option.properties.forEach(property => {
      const newAttribute = {
        name: attrName.value,
        value: '0',
      };
      property.attributes.push(newAttribute);
    });
  });
  const newAttr = {
    name: attrName.value,
    type: 'int',
    index: 0,
  }
  attributes.value.push(newAttr);
  attrName.value = '';
}

const deleteAttr = (optIndex, proIndex, attrIndex) => {
  options.value.forEach(option => {
    option.properties.forEach(property => {
      property.attributes.splice(attrIndex, 1);
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

  sessionStorage.setItem('completeData', dataString);
  sessionStorage.setItem('modelString', modelString);
  sessionStorage.setItem('attrString', attrString);
  sessionStorage.setItem('options', JSON.stringify(options.value));
  router.push('/ProTest2');
  console.log(1);
};

const saveModel = async() => {
  const process = options.value;
  const processData = JSON.stringify(process, null, 2);
  const blob = new Blob([processData], { type: 'application/json' });
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

// Function to import a model from a JSON file
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
          options.value = importedData;

          options.value.forEach(option => {
            option.properties.forEach(property => {
              property.depLists.forEach(depList => {
                depList.dependencies.forEach(listDep => {
                  updateDepProperty(listDep);
                });
              });
            });
          });

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
  // console.log(modelString);
  // console.log(dataString);
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
        // console.log('Solution:', solution.output.json);
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
  margin-top: 50px;
}

.generate-process {
  /* width: 50%; */
  margin-right: 20px;
  margin-bottom: 20px;
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

.attribute-input, .constraint-input, .constraint-select {
  width: 150px; /* Adjust the width to your preference */
}

.attribute-row, .constraint-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 5px;
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
}

.dependency-row {
  display: flex;
  gap: 10px;
  align-items: center;
  /* margin-top: 20px; */
}
</style>
