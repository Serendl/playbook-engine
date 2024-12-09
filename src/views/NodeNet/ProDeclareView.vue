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
            <button @click="addProcess" class="btn btn-primary me-3">Add Process</button>
          </div>
          <div>
            <button @click="saveModel" class="btn btn-primary mt-3 text-end">Save Model</button>
            <button @click="triggerFileUpload" class="btn btn-primary mt-3 ms-2">Import Model</button>
            <input type="file" ref="fileInput" @change="importModel" accept=".json" style="display: none;" />
          </div>
        </div>
        <div v-for="(process, index) in processes" :key="index" class="process-item">
          <div class="name-delete">
            <div class="id-name-row" style="align-items: baseline;">
              <p>ID: {{ index + 1 }} </p>
              <label>Process Name:</label>
              <input v-model="process.name" placeholder="Process Name" class="process-name-input form-control" />
            </div>
            <div>
              <button v-show="processes.length" @click="addOption(index)">Add Option to the Processes</button>
              <button @click="deleteProcess(index)" class="delete-btn ms-2">🗑️</button>
            </div>
          </div>

          <div v-for="(option, opIndex) in process.options" :key="opIndex" class="attribute-item">
            <hr class="my-4" />
            <div class="name-delete">
              <div class="id-name-row">
                <!-- <p>Option ID: {{ option.id }}</p> -->
                <label>Option {{ option.idName }}</label>
                <label>Option Name: </label>
                <input v-model="option.name" placeholder="Option Name" class="form-control attribute-input ms-2" />
                <label class="ms-5">Next Process Available Options</label>
                <input id="available options" v-model="option.availabeOptionsText" @input="updateOptionArray(option)" placeholder="Available Options" class="form-control attribute-input ms-2" />
              </div>
              <div>
                <button @click="addExtraDependency(index, opIndex)">Add Extra Dependency</button>
                <button @click="deleteOption(index, opIndex)" class="delete-btn ms-2">🗑️</button>
              </div>
            </div>

            <div v-if="option.extraDependenciesArray.length > 0">
              <hr style="border: none; border-top: 1px dashed #999;" />
              <label>Dependencies not from last process:</label>
            </div>
            <div v-for="(dependency, depIndex) in option.extraDependenciesArray" :key="depIndex" class="mt-2">
              <hr style="border: none; border-top: 1px dashed #999;" />
              <div class="name-delete">
                <div class="dependency-row">
                  <label>Process:</label>
                  <input id="dependency process" v-model="dependency.process" placeholder="Dependency Process" class="form-control attribute-input ms-2" />
                  <label>Option:</label>
                  <input id="dependency option" v-model="dependency.optionText" placeholder="Dependency Option" @input="updateDepOption(dependency)" class="form-control attribute-input ms-2" />
                </div>
                <button @click="deleteOptDependency(index, opIndex, depIndex)" class="delete-btn ms-2">🗑️</button>
              </div>

            </div>
          </div>

        </div>

        <div class="mt-3">
          <button v-show="processes.length" @click="saveProcesses" class="me-3">Save Processes</button>
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
const processes = ref([]);

const completeData = ref('');

const fileInput = ref(null);

let modelString = 'int: processNum;\nint: max_optionNum;\narray[1..processNum] of int:optionNum;\narray[1..processNum] of var int: choice;\narray[1..processNum-1, 1..max_optionNum, 1..max_optionNum] of bool: available;\narray[2..processNum, 1..max_optionNum] of bool: extrapre;\narray[2..processNum, 1..max_optionNum, 1..processNum - 1] of set of int: pre;\nconstraint forall(i in 1..processNum)(choice[i] in options[i]);\nconstraint forall(p1 in 1..processNum-1, p2 in 1..processNum-1 where p1 + 1 >= p2, i in 1..max_optionNum)(\nchoice[p1 + 1] = i -> available[p1, choice[p1], i] = true /\\ \n(extrapre[p1 + 1, i] = false \\/\n(card(pre[p1 + 1, choice[p1 + 1], p2]) > 0 -> choice[p2] in pre[p1 + 1, choice[p1 + 1], p2])\n)\n);\nsolve satisfy;\n';

const solutions = ref([]);

const msReplenish = () => {
  // array[1..processNum] of set of int:options = [1..optionNum[1], 1..optionNum[2], 1..optionNum[3]];\n
  let optionsDeclaration = 'array[1..processNum] of set of int:options = [';
  processes.value.forEach((process, processIndex) =>{
    if (processIndex != processes.value.length - 1) {
      optionsDeclaration += `1..optionNum[${processIndex + 1}], `;
    } else {
      optionsDeclaration += `1..optionNum[${processIndex + 1}]];\n `;
    }
  })
  modelString += optionsDeclaration;
}

// Function to add a new process
const addProcess = () => {
  const newProcess = {
    id: processes.value.length + 1, // Automatically generated unique ID
    name: '',
    options: []
  };
  processes.value.push(newProcess);
};

// Function to delete a process
const deleteProcess = (index) => {
  processes.value.splice(index, 1);
};

// Function to add an attribute to all processes
const addOption = (index) => {
  const option = {
    id: processes.value[index].options.length + 1,
    idName: String.fromCharCode(65 + processes.value[index].options.length),
    name: '',
    availabeOptionsText: '',
    availabeOptionsArray: [],
    extraDependenciesArray: [],
  };

  processes.value[index].options.push(option);

};

// Function to add extra dependency to the process
const addExtraDependency = (processIndex, opIndex) => {
  const extraDependency = {
    id: processes.value[processIndex].options[opIndex].extraDependenciesArray.length + 1,
    process: '',
    optionText: '',
    optionArray: [],
  };

  processes.value[processIndex].options[opIndex].extraDependenciesArray.push(extraDependency);

};

// Update available options
const updateOptionArray = (option) => {
  if (!option.availabeOptionsText) {
    option.availabeOptionsArray = [];
    return;
  }

  option.availabeOptionsArray = option.availabeOptionsText
    .split(',')
    .map(opt => opt.trim()) // remove leading and trailing spaces
    .filter(opt => opt) // filter out empty strings
    .map(opt => opt.charCodeAt(0) - 'A'.charCodeAt(0) + 1); // ASCII to integer conversion
};

const updateDepOption = (dependency) => {
  if (!dependency.optionText) {
    dependency.optionArray = [];
    return;
  }

  dependency.optionArray = dependency.optionText
    .split(',')
    .map(opt => opt.trim()) // remove leading and trailing spaces
    .filter(opt => opt) // filter out empty strings
    .map(opt => opt.charCodeAt(0) - 'A'.charCodeAt(0) + 1); // ASCII to integer conversion
  console.log(dependency.optionArray);
};

const deleteOption = (processIndex, opIndex) => {
  processes.value[processIndex].options.splice(opIndex, 1);
};

const deleteOptDependency = (processIndex, opIndex, depIndex) => {
  processes.value[processIndex].options[opIndex].extraDependenciesArray.splice(depIndex, 1);
};


const saveProcesses = async() => {
  // complete the model string
  msReplenish();

  completeData.value = 'processNum = ' + `${processes.value.length};\n`;
  completeData.value += 'optionNum = [';
  const max_optionNum = Math.max(...processes.value.map(process => process.options.length));
  processes.value.forEach((process, index) => {
    if (index != processes.value.length - 1) {
      completeData.value += `${process.options.length}, `
    } else {
      completeData.value += `${process.options.length}];\n`
    }
  });
  completeData.value += 'max_optionNum = ' + ` ${max_optionNum};\n`;

  // dependencies between adjacent options
  let available = `available = array3d(1..${processes.value.length - 1}, 1..${max_optionNum}, 1..${max_optionNum},[`;
  const array3d = Array.from({ length: processes.value.length - 1 }, () =>
    Array.from({ length: max_optionNum }, () => Array(max_optionNum).fill('false'))
  );
  processes.value.slice(0, -1).forEach((process, processIndex) => {
    process.options.forEach((option, opIndex) => {
      option.availabeOptionsArray.forEach(avaOpt => {
        array3d[processIndex][opIndex][avaOpt - 1] = 'true';
      })
    });
  });
  available += array3d.map(process => {
    return process.map(option => {
      return option.map(opt => {
        return opt;
      }).join(', ');
    }).join(', ');
  }).join(', ');
  available += ']);\n';
  console.log(available);
  completeData.value += available;

  // array to check if one option has extra prerequisite(not in the last process)
  let extrapre = `extrapre = array2d(2..${processes.value.length}, 1..${max_optionNum},[`;
  const array2d = Array.from({ length: processes.value.length - 1 }, () =>
    Array(max_optionNum).fill('false')
  );
  processes.value.slice(1, processes.value.length).forEach((process, processIndex) => {
    process.options.forEach((option, opIndex) => {
      if (option.extraDependenciesArray.length > 0) {
        array2d[processIndex][opIndex] = 'true';
      }
    });
  });
  extrapre += array2d.map(process => {
    return process.map(option => {
      return option;
    }).join(', ');
  }).join(', ');
  extrapre += ']);\n';
  console.log(extrapre);
  completeData.value += extrapre;

  // extra prerequisite set array
  let pre = `pre = array3d(2..${processes.value.length}, 1..${max_optionNum}, 1..${processes.value.length - 1},[`;
  const array3dpre = Array.from({ length: processes.value.length - 1 }, () =>
    Array.from({ length: max_optionNum }, () => Array(processes.value.length - 1).fill('{}'))
  );
  processes.value.slice(1, processes.value.length).forEach((process, processIndex) => {
    process.options.forEach((option, opIndex) => {
      option.extraDependenciesArray.forEach(dependency => {
        if (dependency.optionArray.length > 0)
        array3dpre[processIndex][opIndex][dependency.process - 1] = `{${dependency.optionArray.join(', ')}}`;
      });
    });
  });
  pre += array3dpre.map(process => {
    return process.map(option => {
      return option.map(opt => {
        return opt;
      }).join(', ');
    }).join(', ');
  }).join(', ');
  pre += ']);\n';
  console.log(pre);
  completeData.value += pre;

  try{
    await solveModel();
    sessionStorage.setItem('allSolutions', JSON.stringify(solutions.value));
    console.log('All solutions stored:', solutions.value);
  } catch (error) {
    console.error('Error during solving:', error);
  }


  sessionStorage.setItem('completeData', completeData.value);
  sessionStorage.setItem('modelString', modelString);
  sessionStorage.setItem('processes', JSON.stringify(processes.value));
  router.push('/ProTest');
  console.log(1);
};


const saveModel = async() => {
  const process = processes.value;
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
          processes.value = importedData;
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
  console.log(completeData.value);
  model.addString(modelString);
  model.addString(completeData.value);
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
        resolve(); // 标记完成
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
  gap: 20px;
  align-items: baseline;
}

.pretask-posttask-row, .constraint-details-row {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  align-items: center;
}

.process-name-input, .constraint-name-input {
  width: 200px; /* Adjust the width to your preference */
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
  margin-top: 20px;
}
</style>
