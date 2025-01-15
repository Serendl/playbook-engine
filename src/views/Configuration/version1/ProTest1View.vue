<template>
  <div class="process-container">
    <h1>Process Selection</h1>
    <div class="process-list">
      <div v-for="(option, index) in options" :key="index" class="process-card d-flex">
        <div class="name-row">
          <h3>Option {{ option.id }}: {{ option.name }}</h3>
        </div>
        <!-- Single Choice -->
        <!-- <div v-if="option.choiceNum = 1">
          <div v-for="(property, proIndex) in option.properties" :key="proIndex" class="d-flex items-center gap-2" style="align-items: center;">
            <RadioButton
              :input-id="'option-' + index + '-property-' + proIndex" :name="'option-' + index"
              :value="proIndex"
              v-model="choices[index]"
            />
            <label :for="'option-' + index + '-property-' + proIndex" :class="[{ disabled: !optionSolution[index]?.has(proIndex + 1) }, 'ms-2']">{{ property.idName }}: {{ property.name }}</label>
          </div>
        </div> -->
        <!-- Multi Choice -->
        <!-- <div v-else-if="option.choiceNum > 1"> -->
          <div v-for="(property, proIndex) in option.properties" :key="proIndex" class="d-flex items-center gap-2" style="align-items: center;">
            <Checkbox
              :input-id="'option-' + index + '-property-' + proIndex"
              :name="'option-' + index"
              :value="proIndex"
              v-model="choices[index]"
              @change="updateLastChoice(index, proIndex)"
            />
            <label :for="'option-' + index + '-property-' + proIndex" class="ms-2">{{ property.idName }}: {{ property.name }}</label>
          </div>
        <!-- </div> -->
      </div>
    </div>
    <button @click="back" class="btn btn-primary mt-3 text-end">Back</button>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import * as MiniZinc from 'minizinc';
// import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';

const completeData = ref('');
let modelString = '';
const options = ref([]);
const solutions = ref([]);

// const optionSolution = ref([]);

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
const supportSolution = ref([]);

// minizinc status
const resultStatus = ref('ALL_SOLUTIONS');

const choiceArrayCreate = () => {
  for (let i = 0; i < options.value.length; i++) {
    choices.value.push([]);
  }
};

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

// listen to the choices change
watch(
  choices.value,
  () => {
    supportSolutionCheck();
  },
);

// clean the last choice array
const back = async () => {
  choices.value.pop();
  try {
    await solveModel();
    // setOptionSolution();
  } catch (error) {
    console.error('Error during going back:', error);
  }
}

// check minizinc result status
const checkResultStatus = () => {
  if (resultStatus.value === 'SATISFIED' || resultStatus.value === 'ALL_SOLUTIONS') {
    setSupportSolution();
  } else if (resultStatus.value === 'UNSATISFIABLE' || resultStatus.value === 'NO_SOLUTION') {
    console.log('Unsatisfied');
    noSolution();
  }
}

//
const noSolution = async () => {
  await updateLastChoice(lastChoice.value.option, lastChoice.value.property);
  if (choices.value[lastChoice.value.option].length > options.value[lastChoice.value.option].choiceNum) {
    alert(`You can only choose ${options.value[lastChoice.value.option].choiceNum} properties in option${lastChoice.value.option + 1}.`);
  } else {
    let dependencyAlert = '';
    let pathAlert = '';
    alert('This property cannot coexist with your previous selection. Please try othters.');
    // if (options.value[lastChoice.value.option].properties[lastChoice.value.property].dependenciesArray.length > 0) {
    //   dependencyAlert = 'For this property, you need to choose:\n';
    //   options.value[lastChoice.value.option].properties[lastChoice.value.property].dependenciesArray.forEach(dependency => {
    //     dependencyAlert += `Option${dependency.option}: ${dependency.propertyText} `;
    //     if (dependency !== options.value[lastChoice.value.option].properties[lastChoice.value.property].dependenciesArray.slice(-1)[0]) {
    //       dependencyAlert += 'or\n';
    //     }
    //   })
    //   alert(dependencyAlert);
    // }
    if (options.value[lastChoice.value.option].properties[lastChoice.value.property].paths.length > 0){
      pathAlert = 'For this property, you can choose:\n';
      options.value[lastChoice.value.option].properties[lastChoice.value.property].paths.forEach(path => {
        pathAlert += `Path ${path.name}: `;
        path.dependencies.forEach((dep) => {
          pathAlert += `Option${dep.option}(${dep.propertyText}) `;
          // if (path.dependencies.indexOf(dep) === path.dependencies.length - 1) {
          //   pathAlert += '\n';
          // }
        })
        if (path !== options.value[lastChoice.value.option].properties[lastChoice.value.property].paths.slice(-1)[0]) {
          pathAlert += ';\n';
        }
      })
      alert(dependencyAlert + pathAlert);
    }
  }
  choices.value[lastChoice.value.option].splice(-1, 1);
}

// const setOptionSolution = () => {
//   const optionsLength = options.value.length;
//   let solutionArray = solutions.value.flatMap(solution => solution.chosen_prop.set);
//   optionSolution.value = [];

//   for (let i = 0; i < optionsLength; i++) {
//     const optSet = new Set();
//     solutionArray.forEach(solution => {
//       if (solution.c === 'Option' + (i + 1)) {
//         optSet.add(solution.e);
//       }
//     });
//     // console.log(optSet);
//     optionSolution.value.push(optSet);
//   }
// }

// set the support solution as the one with the most properties
const setSupportSolution = () => {
  if (solutions.value.length === 0) {
    return;
  }
  let sizeNum = 0;
  let supportIndex = 0;
  solutions.value.forEach(solution => {
    if(solution.chosen_prop.set.length > sizeNum) {
      sizeNum = solution.chosen_prop.set.length;
      supportIndex = solutions.value.indexOf(solution);
    }
  });
  supportSolution.value = solutions.value[supportIndex];
}


const supportSolutionCheck = async () => {
  for (let i = 0; i < choices.value.length; i++) {
    const choiceArray = choices.value[i];
    for (let j = 0; j < choiceArray.length; j++) {
      const choice = choiceArray[j];
      let existMark = false; // Mark the property is not found in support solution

      for (let k = 0; k < supportSolution.value.chosen_prop.set.length; k++) {
        const solution = supportSolution.value.chosen_prop.set[k];
        if (solution.c === 'Option' + (i + 1) && solution.e === Number(choice) + 1) {
          existMark = true; // property is found in support solution
          break; // exit the loop
        }
      }

      if (!existMark) {
        // if the property not in the support solution, add the constraint and return
        await addConstraint();
      }
    }
  }
};

// click the solve button to solve the model
const solveModel = async () => {
  const model = new MiniZinc.Model();
  model.addString(modelString);
  model.addString(completeData.value);
  model.addString(choiceConstraint);
  model.addString(choiceData.value);
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


onMounted(() =>{
  const optionsStorage = JSON.parse(sessionStorage.getItem('options'));
  const completeDataStorage = sessionStorage.getItem('completeData');
  const solutionsStorage = JSON.parse(sessionStorage.getItem('allSolutions'));
  const modelStringStorage = sessionStorage.getItem('modelString');

  if (optionsStorage) {
    options.value = optionsStorage;
  };

  if (completeDataStorage) {
    completeData.value = completeDataStorage;
  };

  if (modelStringStorage) {
    modelString = modelStringStorage;
  };

  if (solutionsStorage) {
    solutions.value = solutionsStorage;
  };

  // setOptionSolution();
  choiceArrayCreate();
  setSupportSolution();
})



</script>

<style>
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
</style>
