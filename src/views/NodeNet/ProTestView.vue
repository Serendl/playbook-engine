<template>
  <div class="process-container">
    <h1>Process Selection</h1>
    <div class="process-list">
      <div v-for="(process, index) in processes" :key="index" class="process-card d-flex">
        <div class="name-row">
          <h3>Process {{ process.id }}: {{ process.name }}</h3>
        </div>
        <div v-for="(option, opIndex) in process.options" :key="opIndex">
          <input
            type="radio"
            :id="'process-' + index + '-option-' + opIndex" :name="'process-' + index"
            :value="opIndex"
            v-model="choices[index]"
            @input="addConstraint(index, opIndex)"
            :disabled="!processSolution[index]?.has(opIndex + 1)"
          >
          <label :for="'process-' + index + '-option-' + opIndex" :class="[{ disabled: !processSolution[index]?.has(opIndex + 1) }, 'ms-2']">{{ option.idName }}: {{ option.name }}</label>
        </div>
      </div>
    </div>
    <button @click="back" class="btn btn-primary mt-3 text-end">Back</button>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import * as MiniZinc from 'minizinc';

const completeData = ref('');
let modelString = '';
const processes = ref([]);
const solutions = ref([]);
const processSolution = ref([]);

const choiceConstraints = ref([]);
// const choices = ref([]);
const choices = ref(Array.from({ length: processes.value.length }, () => null));

const addConstraint = async (index, opIndex) => {
  const constraintTemplate = `constraint(choice[${index + 1}] = ${opIndex + 1});\n`;
  choiceConstraints.value[index] = constraintTemplate;
  try {
    await solveModel();
    setProcessSolution();
  } catch (error) {
    console.error('Error during adding constraint:', error);
  }
}

const back = async () => {
  choices.value.pop();
  choiceConstraints.value.pop();
  try {
    await solveModel();
    setProcessSolution();
  } catch (error) {
    console.error('Error during going back:', error);
  }
}

const setProcessSolution = () => {
  const processLength = processes.value.length;
  processSolution.value = [];
  console.log(solutions.value);

  for (let i = 0; i < processLength; i++) {
    // console.log(solutions.value);
    const optSet = new Set(solutions.value.map(solution => solution.choice[i]));
    console.log(optSet);
    processSolution.value.push(optSet);
  }
}

// click the solve button to solve the model
const solveModel = async () => {
  const model = new MiniZinc.Model();
  model.addString(modelString);
  model.addString(completeData.value);
  if (choiceConstraints.value.length > 0) {
    choiceConstraints.value.forEach(constraint => {
      model.addString(constraint);
    });
  }
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
  const processesStorage = JSON.parse(sessionStorage.getItem('processes'));
  const completeDataStorage = sessionStorage.getItem('completeData');
  const solutionsStorage = JSON.parse(sessionStorage.getItem('allSolutions'));
  const modelStringStorage = sessionStorage.getItem('modelString');

  if (processesStorage) {
    processes.value = processesStorage;
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

  setProcessSolution();
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
  width: 200px; /* width of the card */
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
