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

const choiceConstraint = 'set of Property: been_chosen;\n' + 'constraint forall(p in been_chosen) (chosen[p]);\n';
const choiceConstraintData = ref([]);
const choiceData = ref('');

const choices = ref([]);

const choieceArrayCreate = () => {
  options.value.forEach((option, i) => {
    choices.value[i] = [];
  });
}

const addConstraint = async () => {
  choiceConstraintData.value = [];
  choices.value.forEach((choiceArray, i) => {
    let ccData = '';
    choiceArray.forEach((choice, j) => {
      if (j < choiceArray.length - 1) {
        ccData += `Option${i + 1}(${Number(choice) + 1}), `;
      } else {
        ccData += `Option${i + 1}(${Number(choice) + 1})`;
      }
    })
    choiceConstraintData.value.push(ccData);
  })

  choiceData.value = 'been_chosen = {';
  choiceConstraintData.value.forEach((ccData, i) => {
    if (i < choiceConstraintData.value.length - 1 && ccData !== '') {
      choiceData.value += ccData + ', ';
    } else {
      choiceData.value += ccData;
    }
  })
  choiceData.value += '};\n';
  console.log(choiceData.value);

  try {
    await solveModel();
    // setOptionSolution();
  } catch (error) {
    console.error('Error during adding constraint:', error);
  }
}

watch(
  choices.value,
  () => {
    addConstraint()
  },
);

const back = async () => {
  choices.value.pop();
  choiceConstraintData.value.pop();
  try {
    await solveModel();
    // setOptionSolution();
  } catch (error) {
    console.error('Error during going back:', error);
  }
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
  choieceArrayCreate();
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
