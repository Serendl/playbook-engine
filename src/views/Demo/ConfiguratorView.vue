<template>
  <contextHolder />
  <div class="page-container">
    <div class="left-container">
      <div class="process-container mb-2">
        <h1>Configurator</h1>
        <div class="process-list">
          <div v-for="(process, index) in processes" :key="index" class="process-card d-flex">
            <div class="name-row">
              <h3>Prcoess {{ index + 1 }}: {{ process.name }}</h3>
            </div>
              <div v-for="(subProcess, subIndex) in process.subProcessArray" :key="subIndex" class="d-flex items-center gap-2" style="align-items: center;">
                <Checkbox
                  :input-id="'option-' + index + '-property-' + subIndex"
                  :name="'option-' + index"
                  :value="subIndex"
                  v-model="choices[index]"
                  @change="updateLastChoice(index, subIndex)"
                  :disabled="!processSolution[index]?.has(subIndex + 1)"
                />
                <label :for="'option-' + index + '-property-' + subIndex" class="ms-2">{{ getPrefix(subIndex) }}: {{ subProcess.name }}</label>
              </div>
          </div>
        </div>
        <button @click="back" class="btn btn-primary mt-3 text-end">Back</button>
      </div>

      <div v-if="recommendedSolutions.length > 0" class="process-container">
        <h1>Solutions</h1>
        <div v-for="(recSolution, recIndex) in recommendedSolutions" :key="recIndex" class="process">
            <span class="solution-header">Solution {{ recIndex + 1 }}:</span>
            <div class="solution-item">
              <div v-for="(prop, opIndex) in recSolution.chosen_prop.set" :key="opIndex" class="prop">
                <strong>{{ prop.c }}: {{ prop.e }}</strong>
              </div>
              <div class="prop">
                <strong class="me-2">Total Cost: {{ recSolution.TotalCost }}</strong>
                <strong>Total Time: {{ recSolution.TotalTime }}</strong>
              </div>
            </div>
        </div>
      </div>
    </div>


    <!-- <div class="attribute-container">
      <h1>Solution Customization</h1>
      <div v-for="(attribute, attrIndex) in attributes" :key="attrIndex" class="process-item">
        <label class="mb-2">Attribute Name: {{ attribute.name }}</label>
        <div class="d-flex mb-2" style="align-items: baseline;">
          <label for="operation" class="me-2">Operation:</label><br>
          <select id="operation" v-model="attribute.operation" class="form-control attr-input">
            <option value="maximize">Maximize</option>
            <option value="minimize">Minimize</option>
            <option value="">No Operation</option>
          </select>
        </div>
        <div class="d-flex mb-2" style="align-items: baseline;">
          <label class="me-2">Range:</label>
          <input type="number" placeholder="Low Bound" v-model="attribute.lowBound" class="form-control attr-input me-2"/>
          <label class="me-2">to</label>
          <input type="number" placeholder="Up Bound" v-model="attribute.upBound" class="form-control attr-input"/>
        </div>
        <div class="d-flex" style="align-items: baseline;">
          <label class="me-2">Influence Index(0-1):</label>
          <input type="text" v-model="attribute.index" class="form-control attr-input"/>
        </div>
      </div>
      <div>
        <button @click="applyCustomization()" class="btn btn-primary mt-3">Get Recommended Solutions</button>
      </div>
    </div> -->
  </div>

</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import * as MiniZinc from 'minizinc';
// import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import { message } from 'ant-design-vue';
const [messageApi, contextHolder] = message.useMessage();

// let initialized = false;

const getPrefix = (subIndex) => {
  return String.fromCharCode(65 + subIndex);
}

const completeData = ref('');
const modelString = ref('');
const processes = ref([]);
const solutions = ref([]);

const attributes = ref([]);

const processData = ref([]);

// String of choice constraint
const choiceConstraint = 'set of Property: been_chosen;\n' + 'constraint forall(p in been_chosen) (chosen[p]);\n';

// String of choice data
const choiceData = ref('');

// array to store the choices
const choices = ref([]);

// record the last choice
const lastChoice = ref({
  option: 0,
  property: 0,
});

// current support solution
// const supportSolution = ref([]);

// option solution
const processSolution = ref([]);

// custom dataString
const customDataString = ref('');

// custom constraintString
const customConstraintString = ref('');

// recommended solutions
const customSolutions = ref([]);

const recommendedSolutions = ref([]);

// minizinc status
const resultStatus = ref('ALL_SOLUTIONS');

// create choice array
const choiceArrayCreate = () => {
  for (let i = 0; i < processes.value.length; i++) {
    choices.value.push([]);
  }
};

// update the last choice
const updateLastChoice = async (option, property) => {
  lastChoice.value.option = option;
  lastChoice.value.property = property;
}

// add Constraint for the choices
const addConstraint = async () => {
  let choiceConstraintData = [];
  choices.value.forEach((choiceArray, i) => {
    let ccData = '';
    choiceArray.forEach((choice, j) => {
      if (j < choiceArray.length - 1) {
        ccData += `Option${i + 1}(${Number(choice) + 1}), `;
      } else {
        ccData += `Option${i + 1}(${Number(choice) + 1})`;
      }
    })
    choiceConstraintData.push(ccData);
  })

  choiceData.value = 'been_chosen = {';
  choiceConstraintData.forEach((ccData, i) => {
    if (i < choiceConstraintData.length - 1 && ccData !== '') {
      choiceData.value += ccData + ', ';
    } else {
      choiceData.value += ccData;
    }
  })
  choiceData.value += '};\n';
  console.log(choiceData.value);

  try {
    await solveModel();
    checkResultStatus();
  } catch (error) {
    console.error('Error during adding constraint:', error);
  }
}

let initialized = false;

// listen to the choices change
watch(
  choices.value,
  () => {
    if (initialized) {
      addConstraint();
      console.log('watch');
    }
  },
);

// clean the last choice array
const back = async () => {
  choices.value.pop();
  try {
    await solveModel();
  } catch (error) {
    console.error('Error during going back:', error);
  }
}

// check minizinc result status
const checkResultStatus = () => {
  if (resultStatus.value === 'SATISFIED' || resultStatus.value === 'ALL_SOLUTIONS') {
    // setSupportSolution();
    setProcessSolution();
  } else if (resultStatus.value === 'UNSATISFIABLE' || resultStatus.value === 'NO_SOLUTION') {
    console.log('Unsatisfied');
    noSolution();
  }
}

// promption message for no solution
const noSolution = async () => {
  await updateLastChoice(lastChoice.value.option, lastChoice.value.property);
  if (choices.value[lastChoice.value.option].length > processes.value[lastChoice.value.option].choiceNum) {
    messageApi.info(`You can only choose ${processes.value[lastChoice.value.option].choiceNum} properties in option${lastChoice.value.option + 1}.`);
  } else {
    let dependencyAlert = '';
    let depListAlert = '';
    messageApi.info('This property cannot coexist with your previous selection. Please try others.');
    if (processes.value[lastChoice.value.option].properties[lastChoice.value.property].depLists.length > 0){
      depListAlert = 'For this property, you can choose:\n';
      processes.value[lastChoice.value.option].properties[lastChoice.value.property].depLists.forEach(depList => {
        depListAlert += `Dependency List: ${depList.name}: `;
        depList.dependencies.forEach((dep) => {
          depListAlert += `Option${dep.option}(${dep.propertyText}) `;
        })
        if (depList !== processes.value[lastChoice.value.option].properties[lastChoice.value.property].depLists.slice(-1)[0]) {
          depListAlert += ';\n';
        }
      })
      messageApi.info(dependencyAlert + depListAlert);
    }
  }
  choices.value[lastChoice.value.option].splice(-1, 1);
}

// set the option solution
const setProcessSolution = async () => {
  const optionLength = processes.value.length;
  processSolution.value = [];
  console.log(solutions.value);

  for (let i = 0; i < optionLength; i++) {
    const optSet = new Set();
    processSolution.value.push(optSet);
  }

  solutions.value.forEach((solution) => {
    solution.chosen_prop.set.forEach((prop) => {
      const optionIndex = prop.c.match(/\d+/)[0];
      processSolution.value[optionIndex - 1].add(prop.e);
    })
  })
  console.log('setPS', processSolution.value);
}

// click the solve button to solve the model
const solveModel = async () => {
  const model = new MiniZinc.Model();
  model.addString(modelString.value);
  model.addString(completeData.value);
  model.addString(choiceConstraint);
  model.addString(choiceData.value);

  let complete = modelString.value + completeData.value + customDataString.value + customConstraintString.value;
  sessionStorage.setItem('completeModel', complete);

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
        resultStatus.value = result.status;
        console.log(solutions.value.length);
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

// apply attribute customization
const applyCustomization = async () => {
  customDataString.value = '';
  // lowCost = 10;
  // upCost = 700;
  attributes.value.forEach((attribute) => {
    customDataString.value += `low${attribute.name} = ${attribute.lowBound};\n`;
    customDataString.value += `up${attribute.name} = ${attribute.upBound};\n`;
  })

  // constraint TotalCost <= upCost /\ TotalCost >= lowCost;
  customConstraintString.value = '';
  attributes.value.forEach((attribute) => {
    customConstraintString.value += `int: low${attribute.name};\n int: up${attribute.name};\n`;
    customConstraintString.value += `constraint Total${attribute.name} <= up${attribute.name} /\\ Total${attribute.name} >= low${attribute.name};\n`;
  })

  try {
    await solveCustomModel();
  } catch (error) {
    console.error('Error during applying customization:', error);
  }

  customSolutionFilter();
  initialized = true;
}

// custom solutions filter
const customSolutionFilter = () => {
  let baselineArray = [];
  let attrMax = [];
  let attrMin = [];
  let disArray = [];

  attributes.value.forEach((attribute) =>{
    if (attribute.operation === 'maximize') {
      baselineArray.push(1);
    } else if (attribute.operation === 'minimize') {
      baselineArray.push(0);
    } else {
      baselineArray.push(1);
    }

    let attrName = `Total${attribute.name}`;
    attrMax.push(Math.max(...customSolutions.value.map(solution => solution[attrName])));
    attrMin.push(Math.min(...customSolutions.value.map(solution => solution[attrName])));
  })

  console.log('Max', attrMax);
  console.log('Min',attrMin);
  console.log('Baseline', baselineArray);

  customSolutions.value.forEach((solution) => {
    let dis = 0;
    attributes.value.forEach((attribute, attrIndex) => {
      let attrName = `Total${attribute.name}`;
      dis += parseFloat(distance(solution[attrName], attrMin[attrIndex], attrMax[attrIndex], attribute.index, baselineArray[attrIndex]));
      console.log(dis);
    })
    disArray.push(Math.abs(parseFloat(dis)).toFixed(3));
  })

  // console.log(disArray.map(dis => parseFloat(dis)));

  const filterArray = [];

  disArray.forEach((value, index) => {
    // insert the value and index into the result array
    filterArray.push({ value, index });
    // sort the result array by value and remove the first 3 elements
    filterArray.sort((a, b) => a.value - b.value).splice(5);
  });

  const minIndexes = filterArray.map(item => item.index);
  const minValues = filterArray.map(item => item.value);
  console.log(minIndexes);
  console.log(minValues);

  recommendedSolutions.value = customSolutions.value.filter((solution, index) => minIndexes.includes(index));

}

const distance = (attrValue, minValue, maxValue, attrIndex, baseLine) => {
  const squareValue = ((attrValue - minValue) / (maxValue - minValue) - baseLine).toFixed(3);
  const dis = (squareValue * squareValue * attrIndex).toFixed(3);
  return dis;
}

// click the solve button to solve the model
const solveCustomModel = async () => {
  const model = new MiniZinc.Model();
  model.addString(modelString.value);
  model.addString(completeData.value);
  model.addString(customDataString.value);
  model.addString(customConstraintString.value);

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
        customSolutions.value.push(solution.output.json);
      });

      // listen to the solve status
      solve.then(result => {
        console.log('Solve Status:', result.status);
        resolve(); // mark as success
        // resultStatus.value = result.status;
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

// load data
onMounted(async() =>{
  const processDataStorage = sessionStorage.getItem('processData');
  const processesStorage = JSON.parse(sessionStorage.getItem('processes'));
  const completeDataStorage = sessionStorage.getItem('completeData');
  const solutionsStorage = JSON.parse(sessionStorage.getItem('allSolutions'));
  const modelStringStorage = sessionStorage.getItem('modelString');
  const attributesStorage = JSON.parse(sessionStorage.getItem('attributes'));

  if (processDataStorage) {
    processData.value = processDataStorage;
  };

  if (processesStorage) {
    processes.value = processesStorage;
  };

  if (completeDataStorage) {
    completeData.value = completeDataStorage;
  };

  if (modelStringStorage) {
    modelString.value = modelStringStorage;
  };

  if (solutionsStorage) {
    solutions.value = solutionsStorage;
  };

  if (attributesStorage) {
    attributes.value = attributesStorage;
  };

  choiceArrayCreate();
  setProcessSolution();
  // await nextTick();
  initialized = true;
})



</script>

<style>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 95vh;
  margin: 20px;
}

.left-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  margin: 20px
}

.process-container {
  width: 100%;
  height: 50%;
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 20px;
}

.attribute-container {
  width: 25%;
  height: 100%;
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 20px;
  margin: 20px
}

.process-list {
  display: flex;
  flex-direction: row; /* align items in a row */
  gap: 20px; /* space between items */
  overflow-x: auto; /* allow horizontal scrolling */
}

.process-card {
  display: flex;
  flex-direction: column; /* align items in a column */
  justify-content: space-between;
  width: 300px; /* width of the card */
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; /* prevent shrinking */
}

.name-row {
  display: flex;
  align-items: center;
}

.process-item {
  position: relative;
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.attr-input {
  width: 35%;
}

.props-container {
  display: flex;
  flex-wrap: wrap; /* if there is too much content, allow line change */
  gap: 1rem; /* set line gap */
}

.prop {
  display: inline-block; /* make each item in a line */
  margin-right: 1rem; /* set spacing to keep it neat */
  padding: 0.5rem; /* optional: set internal padding */
  border: 1px solid #ccc; /* optional: add border to each item */
  border-radius: 4px; /* optional: rounded border */
}

</style>
