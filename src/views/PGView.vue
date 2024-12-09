<template>
  <div class="home">
    <!-- Title -->
    <h1>Manage Your Process</h1>

    <div class="content-container">
      <!-- Add Process Section -->
      <div class="generate-process">
      <!-- <div v-show="showprocess" class="generate-process"> -->
        <h2>Generate Process</h2>
        <button @click="addProcess" class="me-3">Add Process</button>
        <button v-show="processes.length" @click="addAttribute">Add Attribute to All Processes</button>
        <div v-for="(process, index) in processes" :key="index" class="process-item">
          <div class="id-name-row" style="align-items: baseline;">
            <p>ID: {{ index + 1 }} </p>
            <label>Process Name:</label>
            <input v-model="process.name" placeholder="Process Name" class="process-name-input form-control" />
          </div>
          <div class="pretask-posttask-row">
            <label>Pre-task:</label>
            <input v-model="process.pretask" placeholder="Pre-task Name" class="process-name-input form-control form-control-pretask" />
          </div>
          <div v-for="(attribute, attrIndex) in process.attributes" :key="attrIndex" class="attribute-item">
            <hr class="my-4" />
            <p>Attribute ID: {{ attribute.id }}</p>
            <div class="attribute-row">
              <label>Name:</label>
              <input v-model="attribute.name" placeholder="Attribute Name" class="form-control attribute-input ms-2 me-3" />
              <label>Value Type:</label>
              <select id="typeSelect" v-model="attribute.valueType" class="form-control process-name-input">
                <option value="number">Number</option>
                <option value="bool">Bool</option>
              </select>
              <label>Value:</label>
              <input v-if="attribute.valueType === 'number'" v-model="attribute.value" placeholder="Attribute Value" class="form-control attribute-input ms-2" />
              <select v-if="attribute.valueType === 'bool'" id="boolSelect" v-model="attribute.value" class="form-control process-name-input">
                <option value="ture">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>
        </div>
        <div class="mt-3">
          <button v-show="processes.length" @click="saveProcesses" class="me-3">Save Processes</button>
        </div>
      </div>

      <!-- Add Resource Section -->
      <div class="generate-process">
      <!-- <div v-show="showprocess" class="generate-process"> -->
        <h2>Add Resource</h2>
        <button @click="addResource" class="me-3">Add Resource</button>
        <button v-show="resources.length" @click="addResAttribute">Add Attribute to All Resources</button>
        <div v-for="(resource, index) in resources" :key="index" class="process-item">
          <div class="id-name-row" style="align-items: baseline;">
            <p class="">ID: {{ index + 1 }} </p>
            <label>Resource Name:</label>
            <input v-model="resource.resourceName" placeholder="Resource Name" class="process-name-input form-control" />
          </div>
          <div class="d-flex align-items-center">
            <label>Variable Name: </label>
            <input v-model="resource.variableName" placeholder="Variable Name" class="process-name-input form-control ms-2 me-3" />
            <label>Resource Value: </label>
            <input v-model="resource.value" placeholder="Resource Value" class="process-name-input form-control ms-2" />
          </div>
          <div v-for="(attribute, attrIndex) in resource.attributes" :key="attrIndex" class="attribute-item">
            <hr class="my-4" />
            <p>Attribute ID: {{ attribute.id }}</p>
            <div class="attribute-row">
              <label>Name:</label>
              <input v-model="attribute.name" placeholder="Attribute Name" class="form-control attribute-input ms-2 me-3" />
              <label>Value:</label>
              <input v-model="attribute.value" placeholder="Attribute Value" class="form-control attribute-input ms-2" />
            </div>
          </div>
        </div>
        <div class="mt-3">
          <button v-show="resources.length" @click="saveResrouces" class="me-3">Save Resources</button>
        </div>
      </div>

      <!-- Special Group -->
      <div class="generate-process">
      <!-- <div v-show="showprocess" class="generate-process"> -->
        <h2>Add Special Group</h2>
        <button @click="addSPG" class="me-3">Add Special Group</button>
        <div v-for="(spg, index) in spgs" :key="index" class="process-item">
          <div class="id-name-row" style="align-items: baseline;">
            <p class="">ID: {{ index + 1 }} </p>
          </div>
          <div>
            <div class="d-flex align-items-center ms-3 mb-3">
              <label>Special Group Name: </label>
              <input v-model="spg.name" placeholder="Special Group Name" class="process-name-input form-control ms-2 me-3" />
              <label>Value: </label>
              <input v-model="spg.value" placeholder="Special Group Value" class="process-name-input form-control ms-2 me-3" />
              <label>Source: </label>
              <input v-model="spg.source" placeholder="Special Group Value" class="process-name-input form-control ms-2" />
            </div>
          </div>
        </div>
        <div class="mt-3">
          <button v-show="spgs.length" @click="saveSPG" class="me-3">Save Special Groups</button>
        </div>
      </div>

      <!-- Custom Variable Section -->
      <div class="custom-variable">
        <h2>Add Variable</h2>
        <button @click="addVariable" class="me-3">Add Variable</button>
        <div v-for="(variable, index) in variables" :key="index" class="process-item">
          <div>
            <div class="d-flex align-items-center ms-3 mb-3">
              <label>Variable Name:</label>
              <input v-model="variable.name" placeholder="Variable Name" class="process-name-input form-control ms-2 me-3" />
              <label>Type:</label>
              <select id="typeSelect" v-model="variable.type" class="form-control process-name-input ms-2">
                <option value="number">Number</option>
                <option value="bool">Bool</option>
              </select>
            </div>

            <div v-if="variable.type === 'number'" class="d-flex align-items-center ms-3">
              <label>Domain Name:</label>
              <input v-model="variable.domainName" placeholder="Variable Domain" class="process-name-input form-control ms-2" />
              <label class="ms-3">Domain Scope:</label>
              <input v-model="variable.domainScope" placeholder="Variable Scope" class="process-name-input form-control ms-2" />
            </div>
          </div>
        </div>
        <div class="mt-3">
          <button v-show="variables.length" @click="saveVariables" class="me-3">Save Variables</button>
        </div>
      </div>

      <!-- Custom Goal Section -->
       <div class="custom-goal">
        <h2>Add Goal</h2>
        <button @click="addGaol" class="me-3">Add Goal</button>
        <div v-for="(goal, index) in goals" :key="index" class="process-item">
          <div class="d-flex align-items-center ms-3">
            <label>Goal Expression:</label>
            <input v-model="goal.expression" placeholder="Goal Expression" class="form-control ms-2 me-3" style="width: 70%;" />
          </div>
       </div>
       <div class="mt-3">
          <button v-show="goals.length" @click="saveGoal" class="me-3">Save Goal</button>
        </div>
      </div>

      <!-- Add Constraint Section -->
      <div class="add-constraint">
        <h2>Add Constraint</h2>
        <button @click="addConstraint" class="me-3">Add Constraint</button>
        <div v-for="(constraint, index) in constraints" :key="index" class="constraint-item" style="align-items: baseline;">
          <div class="constraint-id-row">
            <p class="">Constraint ID: {{ index + 1 }} </p>
            <button @click="addLayer(index)" class="me-3">Add Layer</button>
          </div>

          <div v-for="(layer, layerIndex) in constraint.layers" :key="layerIndex" class="layer-item horizontal-layout">
            <div class="d-flex align-items-center justify-content-between"  style="align-items: baseline;">
              <p>Layer ID: {{ layerIndex + 1 }}</p>
              <button @click="addObject(index, layerIndex)" class="ms-3">Add Object</button>
            </div>
            <div v-for="(object, objectIndex) in layer.objects" :key="objectIndex" class="object-item" style="margin-top: 10px;">
              <div class="object-row">
                <label>Object Name:</label>
                <input v-model="object.name" placeholder="Object Name" class="form-control object-input ms-2 me-3" />
                <label>Resource:</label>
                <input v-model="object.resource" placeholder="Resource" class="form-control object-input ms-2" />
              </div>
            </div>
            <div class="object-row mt-3">
                <label>Limination:</label>
                <input v-model="layer.limitation" placeholder="Limitation" class="form-control ms-2 me-3" style="width: 80%;" />
              </div>
          </div>

          <div class="expression-row">
            <label>Expression:</label>
            <input v-model="constraint.expression" placeholder="Constraint Expression" class="form-control constraint-input ms-2 mt-2" style="width: 50%;" />
          </div>
        </div>
        <div class="mt-3">
          <button v-show="constraints.length" @click="saveConstraints" class="me-3">Save Constraints</button>
        </div>
      </div>

      <!-- Generate Model-->
      <div class="d-flex align-items-center justify-content-center" style="height: 100%;">
        <button @click="createModel" class="btn btn-primary mt-3">Generate Model</button>
        <button @click="clearModel" class="btn btn-primary mt-3 ms-2">Clear Model</button>
        <button @click="solveModel" class="btn btn-primary mt-3 ms-2">Solve</button>
      </div>

      <hr class="my-4" />

      <!-- Complete Model -->
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

      <!-- Solutions -->
      <div class="data-container">
      <h2>Solutions</h2>
      <div v-if="solutions.length > 0">
        <div v-for="(solution, index) in solutions" :key="index" class="solution">
          <span class="solution-header">Solution {{ index + 1 }}:</span>
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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import * as MiniZinc from 'minizinc';

// List of processes
const processes = ref([]);

// List of resources
const resources = ref([]);

// List of custom variables
const variables = ref([]);

// Goal
const goals = ref([]);

// List of constraints
const constraints = ref([]);

// List of SPG
const spgs = ref([])

const modelData = ref('');
const model = ref('enum process;\n');
const modelConstraints = ref('');

const completemodel = ref('');

// List of solutions
const solutions = ref([]);

// Common attributes for all processes
const commonAttributes = ref([]);

// Common attributes for all resources
const commonResAttributes = ref([]);

// Function to add a new process
const addProcess = () => {
  const newAttributes = commonAttributes.value.map((attr, index) => ({ id: index + 1, name: attr, valueType: '', value: '' }));
  const newProcess = {
    id: processes.value.length + 1, // Automatically generated unique ID
    name: '',
    pretask: '',
    attributes: newAttributes
  };
  processes.value.push(newProcess);
};

// Function to add an attribute to all processes
const addAttribute = () => {
  const newAttributeName = '';
  commonAttributes.value.push(newAttributeName);
  processes.value.forEach(process => {
    process.attributes.push({ id: process.attributes.length + 1, name: newAttributeName, valueType: Number, value: '' });
  });
};

const saveProcesses = () => {
  const processName = `process = { ${processes.value.map(process => process.name).join(', ')} }`;
  // const attributeValues = [];
  const attributeValuesMap = {};
  const pretaskValues = [];
  const posttaskValues = [];
  const formattedAttributes = new Set();
  processes.value.forEach(process => {
    process.attributes.forEach(attribute => {
      // Format the attribute string
      const formattedString = `array[process] of int: ${attribute.name};`;
      // Add the formatted string to the set to avoid duplicates
      formattedAttributes.add(formattedString);
      // Change the value to a number if it is a number
      // attributeValues.push(Number(attribute.value));
      // Collect attribute values for each attribute name
      if (!attributeValuesMap[attribute.name]) {
        attributeValuesMap[attribute.name] = [];
      }
      attributeValuesMap[attribute.name].push(Number(attribute.value));
      if (process.pretask) {
        pretaskValues.push(process.pretask);
        posttaskValues.push(process.name);
      }
    });
  });
  // data content
  const preLength = 'm = ' + pretaskValues.length;
  const pre = 'pre =' + `[${pretaskValues.join(',')}]`
  const post = 'post =' + `[${posttaskValues.join(',')}]`
  let attributeValuesString = '';
  for (const [key, values] of Object.entries(attributeValuesMap)) {
    attributeValuesString += `${key} = [${values.join(', ')}];\n`;
  }
  modelData.value += processName + ';\n' + preLength + ';\n' + pre + ';\n' + post + ';\n' + attributeValuesString;
  // model content
  model.value += Array.from(formattedAttributes).join('\n');
  model.value += '\n' + 'int: m;' + '\n' + 'set of int: PREC = 1..m;' + '\n' + 'array[PREC] of process: pre;' + '\n' + 'array[PREC] of process: post;' + '\n';
};

// Function to add a new resource
const addResource = () => {
  const newAttributes = commonResAttributes.value.map((attr, index) => ({ id: index + 1, name: attr, value: '' }));
  const newResource = {
    id: resources.value.length + 1, // Automatically generated unique ID
    resourceName: '',
    variableName: '',
    value: '',
    attributes: newAttributes
  };
  resources.value.push(newResource);
};

// Function to add an attribute to all processes
const addResAttribute = () => {
  const newAttributeName = '';
  commonResAttributes.value.push(newAttributeName);
  resources.value.forEach(resource => {
    resource.attributes.push({ id: resource.attributes.length + 1, name: newAttributeName, value: '' });
  });
};


const saveResrouces = () => {
  let formattedResource = '';
  let formattedModelRes = '';
  resources.value.forEach(resource => {
    const resourceValue = Number(resource.value);
    formattedResource += `${resource.variableName} = ${resourceValue};\n`;
    formattedModelRes += `int: ${resource.variableName};\n`;
    formattedModelRes += `set of int: ${resource.resourceName} = 1..${resource.variableName};\n`;
    // resource.attributes.forEach(attribute => {
    //   formattedModelRes += `int: ${attribute.name};\n`;
    //   // generate "set of int: resourceName + attributeName = 0..resourceValue * attributeValue;"
    //   const formattedAttributeString = `set of int: ${resource.name}${attribute.name} = 0..${resource.name}*${attribute.name};\n`;
    //   formattedModelRes += formattedAttributeString;
    //   console.log(formattedAttributeString);
    // });
});
  console.log(formattedModelRes);
  // data content
  modelData.value += formattedResource;
  // model content
  model.value += formattedModelRes;
  console.log(model.value);
}

const addSPG = () => {
  const newSPG = {
    id: spgs.value.length + 1,
    name: '',
    value: '',
    valueType: '',
    source: ''
  }
  spgs.value.push(newSPG);
}

const saveSPG = () => {
  let formattedSPGData = '';
  let formattedSPGModel = '';
  spgs.value.forEach(spg => {
    const formattedValue = `{ ${spg.value} }`;
    formattedSPGData += `${spg.name} = ${formattedValue};\n`;
    formattedSPGModel += `set of ${spg.source}: ${spg.name};\n`;
  });
  modelData.value += formattedSPGData;
  model.value += formattedSPGModel;
  console.log('Special Group:', formattedSPGData);
  console.log('Special Group:', formattedSPGModel);
}

// Function to add a new variable
const addVariable = () => {
  const newVariable = {
    name: '',
    type: '',
    domainName: '',
    domainScope: ''
  };
  variables.value.push(newVariable);
};

const saveVariables = () => {
  let formattedVariables = '';
  variables.value.forEach(variable => {
    if (variable.type === 'number') {
      formattedVariables += `set of int: ${variable.domainName} = ${variable.domainScope};\n`;
      formattedVariables += `array[process] of var ${variable.domainName}: ${variable.name};\n`;
    } else {
      formattedVariables += `array[process] of var bool: ${variable.name};\n`;
    }
  });
  model.value += formattedVariables;
  console.log('Variables:', formattedVariables);
}

const addGaol = () => {
  const newGoal = {
    expression: ''
  };
  goals.value.push(newGoal);
};

const saveGoal = () => {
  let formattedGoal = '';
  goals.value.forEach(goal => {
    formattedGoal += `${goal.expression};\n`;
  });
  model.value += formattedGoal;
  console.log('Goal:', formattedGoal);
}

// Function to add a new constraint
const addConstraint = () => {
  const newConstraint = {
    id: constraints.value.length + 1, // Automatically generated unique ID
    expression: '',
    layers: [
      {
        id: 1,
        objects: [
          {
            name: '',
            resource: ''
          }
        ],
        limitation: ''
      }
    ]
  };
  constraints.value.push(newConstraint);
};

// Function to add a new layer to a constraint
const addLayer = (constraintIndex) => {
  const newLayer = {
    id: constraints.value[constraintIndex].layers.length + 1, // Automatically generated unique ID
    objects: [
          {
            name: '',
            resource: ''
          }
    ],
    limitation: ''
  };
  constraints.value[constraintIndex].layers.push(newLayer);
};

// Function to add a new object to a layer
const addObject = (constraintIndex, layerIndex) => {
  const newObject = {
    name: '',
    resource: ''
  };
  constraints.value[constraintIndex].layers[layerIndex].objects.push(newObject);
};

// Function to save constraints
const saveConstraints = () => {
  constraints.value.forEach(constraint => {
    let constraintText = '';
    if (constraint.layers.length === 1) {
      const layer = constraint.layers[0];
      const objects = layer.objects.map(object => `${object.name} in ${object.resource}`).join(', ');
      constraintText = `constraint forall(${objects}${layer.limitation ? ` where ${layer.limitation}` : ''})(\n  ${constraint.expression}\n);`;
    } else {
      constraintText = 'constraint ';
      constraint.layers.forEach((layer, layerIndex) => {
        const objects = layer.objects.map(object => `${object.name} in ${object.resource}`).join(', ');
        constraintText += `forall(${objects}${layer.limitation ? ` where ${layer.limitation}` : ''})`;
        if (layerIndex < constraint.layers.length - 1) {
          constraintText += '(\n';
        } else {
          constraintText += '(\n  ';
        }
      });
      constraintText += `${constraint.expression}\n`;
      constraint.layers.forEach(() => {
        constraintText += ')\n';
      });
      constraintText += ';';
    }
    console.log(constraintText);
    modelConstraints.value += constraintText + '\n';
  });
};

// Function to create the complete model
const createModel = () => {
  completemodel.value = modelData.value + "\n" + model.value + "\n" + modelConstraints.value;
}

// click the solve button to solve the model
const solveModel = async () => {
  const model = new MiniZinc.Model();
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

    // clear the previous results
    solutions.value = [];

    // parse the solutions
    solve.on('solution', solution => {
      console.log(solution.output.json);
      solutions.value.push(solution.output.json);
    });

    solve.then(result => {
      console.log(result.status);
    });

  } catch (error) {
    console.error('Error during solving:', error);
  }
};

const clearModel = () => {
  modelData.value = '';
  model.value = 'enum process;\n';
  modelConstraints.value = '';
  completemodel.value = '';
  solutions.value = [];
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

.vertical-line {
  width: 1px;
  background-color: #ccc;
  margin: 0 20px;
}

/* .add-constraint {
  width: 50%;
} */

.process-item {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.constraint-id-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  align-items: center;
}

.attribute-item {
  margin-top: 10px;
  margin-bottom: 10px;
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

.add-constraint {
  margin-bottom: 20px;
}

.constraint-item {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.layer-item {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #999;
  border-radius: 5px;
  align-items: center;
  gap: 20px;
}

.expression-row {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #999;
  border-radius: 5px;
  align-items: center;
}

.object-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}

.constraint-input, .object-input {
  width: 200px;
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
</style>
