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
                <button @click="addPath(index, proIndex)">Add Path</button>
                <button @click="addDependency(index, proIndex)" class="ms-2">Add Dependency</button>
                <button @click="deleteProperty(index, proIndex)" class="delete-btn ms-2">🗑️</button>
              </div>
            </div>

            <!-- <div v-if="property.dependenciesArray.length > 0"> -->
              <!-- <hr style="border: none; border-top: 1px dashed #999;" /> -->
              <!-- <label>Dependencies not from last process:</label> -->
            <!-- </div> -->
            <div v-if="property.dependenciesArray.length > 0">
              <hr style="border: none; border-top: 1px dashed #999;" />
              <label>Dependencies:</label>
              <div v-for="(dependency, depIndex) in property.dependenciesArray" :key="depIndex" class="mt-2">
                <div class="name-delete">
                  <div class="dependency-row">
                    <label>Option:</label>
                    <input id="dependency option" v-model="dependency.option" placeholder="Option ID" class="form-control attribute-input ms-2" />
                    <label>Property:</label>
                    <input id="dependency property" v-model="dependency.propertyText" placeholder="Property" @input="updateDepProperty(dependency)" class="form-control attribute-input ms-2" />
                  </div>
                  <button @click="deleteProDependency(index, proIndex, depIndex)" class="delete-btn ms-2">🗑️</button>
                </div>
              </div>
            </div>

            <div v-for="(path, pathIndex) in property.paths" :key="pathIndex" class="mt-2">
              <hr style="border: none; border-top: 1px dashed #999;" />
              <div class="name-delete">
                <div class="dependency-row">
                  <label>Path ID: {{ path.id }}</label>
                  <label>Path Name: {{ path.name }}</label>
                  <input id="dependency option" v-model="path.name" placeholder="Option ID" class="form-control attribute-input ms-2" />
                </div>
                <button @click="deletePath(index, proIndex, pathIndex)" class="delete-btn ms-2">🗑️</button>
              </div>
              <div v-for="(pathDep, pathDepIndex) in path.dependencies" :key="pathDepIndex" class="mt-2">
                <div class="dependency-row">
                  <label>Option:</label>
                  <input id="dependency option" v-model="pathDep.option" placeholder="Option ID" class="form-control attribute-input ms-2" />
                  <label>Property:</label>
                  <input id="dependency property" v-model="pathDep.propertyText" placeholder="Property" @input="updateDepProperty(pathDep)" class="form-control attribute-input ms-2" />
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


// List of processes
const options = ref([]);

// List of special path
// const paths = ref([]);

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
      if (property.dependenciesArray.length > 0) {
        property.dependenciesArray.forEach((dependency, depIndex) => {
          let depDeclare = `(p: Option${optIndex + 1}(${proIndex + 1}), req: [`;
          dependency.propertyArray.forEach((prop, propIndex) => {
            if (propIndex != dependency.propertyArray.length - 1) {
              depDeclare += `Option${dependency.option}(${prop}), `;
            } else {
              depDeclare += `Option${dependency.option}(${prop})])`;
            }
          });
          if (optIndex == options.value.length - 1 && proIndex == option.properties.length - 1 && depIndex == property.dependenciesArray.length - 1) {
            depTemplate += depDeclare;
          } else {
            depTemplate += depDeclare + ', \n';
          }
        });
      }
      if (property.paths.length > 0) {
        property.paths.forEach((path, pathIndex) => {
          let depDeclare = `(p: Option${optIndex + 1}(${proIndex + 1}), req: [`;
          path.dependencies.forEach((pathDep, pathDepIndex) => {
            pathDep.propertyArray.forEach((prop, propIndex) => {
              if (propIndex != pathDep.propertyArray.length - 1 || pathDepIndex != path.dependencies.length - 1) {
                depDeclare += `Option${pathDep.option}(${prop}), `;
              } else {
                depDeclare += `Option${pathDep.option}(${prop})])`;
              }
            });
          });
          if (optIndex == options.value.length - 1 && proIndex == option.properties.length - 1 && pathIndex == property.paths.length - 1) {
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

// Function to add an attribute to all processes
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
        availabePropertiesText: '',
        availabePropertiesArray: [],
        dependenciesArray: [],
        paths: [],
      };
      options.value[index].properties.push(property);
    }
  }
};

// Function to add extra dependency to the process
const addDependency = (optionIndex, proIndex) => {
  const dependency = {
    id: options.value[optionIndex].properties[proIndex].dependenciesArray.length + 1,
    option: '',
    propertyText: '',
    propertyArray: [],
  };
  options.value[optionIndex].properties[proIndex].dependenciesArray.push(dependency);
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

const deleteProDependency = (optionIndex, proIndex, depIndex) => {
  options.value[optionIndex].properties[proIndex].dependenciesArray.splice(depIndex, 1);
};

const addPath = (optIndex, propIndex) => {
  const newPath = {
    id: options.value[optIndex].properties[propIndex].paths.length + 1, // Automatically generated unique ID
    name: '',
    dependencies: []
  };
  options.value.forEach((options, opindex) => {
    if (optIndex != opindex) {
      newPath.dependencies.push({
        option: opindex + 1,
        propertyText: '',
        propertyArray: [],
      });
    }
  });
  options.value[optIndex].properties[propIndex].paths.push(newPath);
}

const deletePath = (optIndex, propIndex, pathIndex) => {
  options.value[optIndex].properties[propIndex].paths.splice(pathIndex, 1);
};

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
  sessionStorage.setItem('options', JSON.stringify(options.value));
  router.push('/ProTest1');
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
              property.paths.forEach(path => {
                path.dependencies.forEach(pathDep => {
                  updateDepProperty(pathDep);
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
