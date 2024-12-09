<template>
  <div class="text-center">
    <h1>Process Construct</h1>
  </div>
  <div class="model">
    <div class="d-flex">
      <div class="model-container">
        <h2>Model</h2>
        <div class="model-content">
          <textarea
            class="form-control"
            id="model"
            rows="10"
            v-model="mcontent"
            required
            placeholder="Model"></textarea>
        </div>
      </div>

      <div class="constraints">
        <h2>Constraints</h2>
        <div class="model-content">
          <textarea
            class="form-control"
            id="constraints"
            rows="10"
            v-model="ccontent"
            required
            placeholder="Constraints"></textarea>
        </div>
      </div>
    </div>
    <div class="d-flex align-items-center justify-content-center" style="height: 100%;"></div>
  </div>

  <div class="model d-flex">
    <div class="data-container">
      <h2>Data</h2>
      <div class="model-content">
        <textarea
          class="form-control"
          id="data"
          rows="10"
          v-model="datacontent"
          required
          placeholder="Data"></textarea>
        <div class="d-flex align-items-center justify-content-center" style="height: 100%;">
          <button @click="createModel" class="btn btn-primary mt-3">Generate Model</button>
          <button @click="solveModel" class="btn btn-primary mt-3 ms-2">Solve</button>
        </div>
      </div>
    </div>
  </div>

  <div class="model d-flex">
    <div class="data-container">
      <h2>Complete Model</h2>
      <div class="model-content">
        <textarea
          class="form-control"
          id="completemodel"
          rows="10"
          v-model="completemodel"
          required
          placeholder="Complete Model"></textarea>
      </div>
    </div>
  </div>

  <div class="model d-flex">
    <div class="data-container">
      <h2>Solutions</h2>
      <div v-if="solutions.length > 0">
        <div v-for="(solution, index) in solutions" :key="index" class="solution">
          <span class="solution-header">解 {{ index + 1 }}:</span>
          <div v-for="(value, key) in solution" :key="key" class="solution-item">
            <strong>{{ key }}:</strong> {{ value }}
          </div>
        </div>
      </div>
    <div v-else>
      <p>No Solutions Found.</p>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Model } from 'https://cdn.jsdelivr.net/npm/minizinc/dist/minizinc.mjs';

const mcontent = ref("");
const ccontent = ref("");
const datacontent = ref("");
const completemodel = ref("");
// let model;
const solutions = ref([]);

const createModel = () => {
  completemodel.value = datacontent.value + "\n" + mcontent.value + "\n" + ccontent.value;
  // model.addFile('model.mzn', completemodel.value);
}

// 点击按钮时执行求解
const solveModel = async () => {
  const model = new Model();
  model.addFile('model.mzn', completemodel.value);
  if (!model) {
    console.error('Model is not loaded yet.');
    return;
  }

  try {
    const solve = model.solve({
      options: {
        solver: 'gecode',
        'all-solutions': false,
      },
    });

    // 清空之前的结果
    // solutions.value = [];

    // 解析解决方案
    solve.on('solution', solution => {
      console.log(solution.output.json);
      solutions.value.push(solution.output.json);
    });

    solve.then(result => {
      console.log(result.status);
    });

    // 监听求解结束的状态
    console.log(solve.status);

  } catch (error) {
    console.error('Error during solving:', error);
  }
};

</script>







<style scoped>
  .model {
    justify-content: space-around;
    align-items: center;
    margin-top: 50px;
    height: 100%;
    background-color: #8a8a8a;
    border-radius: 10px;
  }

  .model-container {
    width: 50%;
    height: 100%;
    background-color: #cccccc;
    border-radius: 10px;
    padding: 20px;
    margin: 20px
  }

  .data-container {
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    border-radius: 10px;
    padding: 20px;
    margin: 20px
  }

  .constraints {
    width: 50%;
    height: 100%;
    background-color: #cccccc;
    border-radius: 10px;
    padding: 20px;
    margin: 20px
  }

  .model-content {
    justify-content: center;
    align-items: center;
    height: 100%;
    border-radius: 5px;
  }

  textarea {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 5px;
    padding: 10px;
    resize: none;
  }

  .solution {
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* 防止内容太长导致溢出时自动换行 */
  background-color: #f9f9f9;
  /* border: 1px solid #ddd; */
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.solution-header {
  margin-right: 10px;
  font-weight: bold;
}

.solution-item {
  display: inline-block; /* 每个变量和值显示在同一行 */
  margin-right: 15px; /* 设置间距以保持整洁 */
}


</style>
