<template>
  <div class="home">
    <!-- Title -->
    <h1>Manage Your Process</h1>

    <div class="content-container">
      <!-- Generate Process Section (65%) -->
      <div class="generate-process">
        <h2>Generate Process</h2>
        <button @click="addProcess" class="me-3">Add Process</button>
        <button @click="addAttribute">Add Attribute to All Processes</button>
        <div v-for="(process, index) in processes" :key="index" class="process-item">
          <div class="id-name-row" style="align-items: baseline;">
            <p class="">ID: {{ index + 1 }} </p>
            <label>Process Name:</label>
            <input v-model="process.name" placeholder="Process Name" class="process-name-input form-control" />
          </div>
          <div class="pretask-posttask-row">
            <label>Pre-task:</label>
            <input v-model="process.pretask" placeholder="Pre-task" class="process-name-input form-control form-control-pretask" />
          </div>
          <div class="pretask-posttask-row">
            <label>Post-task:</label>
            <input v-model="process.posttask" placeholder="Post-task" class="process-name-input form-control form-control-posttask"/>
          </div>
          <div v-for="(attribute, attrIndex) in process.attributes" :key="attrIndex" class="attribute-item">
            <p>Attribute ID: {{ attribute.id }}</p>
            <div class="attribute-row">
              <label>Name:</label>
              <input v-model="attribute.name" placeholder="Attribute Name" class="form-control attribute-input" />
            </div>
            <div class="attribute-row">
              <label>Value:</label>
              <input v-model="attribute.value" placeholder="Attribute Value" class="form-control attribute-input" />
            </div>
          </div>
        </div>
      </div>

      <!-- Vertical Divider -->
      <div class="vertical-line"></div>

      <!-- Add Constraint Section (35%) -->
      <div class="add-constraint">
        <h2>Add Constraint</h2>
        <button @click="addConstraint" class="me-3">Add Constraint</button>
        <div v-for="(constraint, index) in constraints" :key="index" class="constraint-item" style="align-items: baseline;">
          <div class="constraint-id-row">
            <p class="">Constraint ID: {{ index + 1 }} </p>
          </div>
          <label>For:</label>
          <select v-model="constraint.processId" class="form-control constraint-select">
            <option v-for="(process, processIndex) in processes" :key="processIndex" :value="process.id">
              {{ process.id }}
            </option>
          </select>
          <p>in</p>
          <input v-model="constraint.dayId" placeholder="Day ID" class="form-control constraint-input" />
          <p>,</p>
          <select v-model="constraint.attributeName" class="form-control constraint-select" placeholder="Attribute Name">
            <option v-for="(attribute, attrIndex) in commonAttributes" :key="attrIndex" :value="attribute">
              {{ attribute }}
            </option>
          </select>
          <select v-model="constraint.operator" class="form-control constraint-select" placeholder="Operator" style="width: 50px;">
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="=">=</option>
            <option value=">=">&gt;=</option>
            <option value=">">&gt;</option>
          </select>
          <input v-model="constraint.value" placeholder="Value" class="form-control constraint-input" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// List of processes
const processes = ref([]);

// List of constraints
const constraints = ref([]);

// Common attributes for all processes
const commonAttributes = ref([]);

// Function to add a new process
const addProcess = () => {
  const newAttributes = commonAttributes.value.map((attr, index) => ({ id: index + 1, name: attr, value: '' }));
  const newProcess = {
    id: processes.value.length + 1, // Automatically generated unique ID
    name: '',
    pretask: '',
    posttask: '',
    attributes: newAttributes
  };
  processes.value.push(newProcess);
};

// Function to add an attribute to all processes
const addAttribute = () => {
  const newAttributeName = `Attribute ${commonAttributes.value.length + 1}`;
  commonAttributes.value.push(newAttributeName);
  processes.value.forEach(process => {
    process.attributes.push({ id: process.attributes.length + 1, name: newAttributeName, value: '' });
  });
};

// Function to add a new constraint
const addConstraint = () => {
  const newConstraint = {
    id: constraints.value.length + 1, // Automatically generated unique ID
    processId: null,
    attributeName: '',
    operator: '<',
    value: ''
  };
  constraints.value.push(newConstraint);
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
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin-top: 50px;
}

.generate-process {
  width: 50%;
  margin-right: 20px;
}

.vertical-line {
  width: 1px;
  background-color: #ccc;
  margin: 0 20px;
}

.add-constraint {
  width: 50%;
}

.process-item {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.constraint-item {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.constraint-id-row {
  width: 100%;
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
}

.attribute-item {
  margin-top: 10px;
}

.attribute-row, .constraint-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 5px;
}

.process-name-input, .constraint-name-input {
  width: 200px; /* Adjust the width to your preference */
}

.attribute-input, .constraint-input, .constraint-select {
  width: 150px; /* Adjust the width to your preference */
}

/* Add some styling for the buttons */
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

input[type="file"] {
  padding: 10px;
}
</style>
