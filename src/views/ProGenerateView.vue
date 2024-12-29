<template>
  <div class="home">
    <!-- Title -->
    <h1>Manage Your Process</h1>

    <div>
        <button @click="saveModel" class="btn btn-primary mt-3 text-end">Save Model</button>
        <button @click="triggerFileUpload" class="btn btn-primary mt-3 ms-2">Import Model</button>
        <input type="file" ref="fileInput" @change="importModel" accept=".json" style="display: none;" />
    </div>

    <div class="content-container">
      <!-- Add Process Section -->
      <div class="generate-process">
      <!-- <div v-show="showprocess" class="generate-process"> -->
        <h2>Generate Process</h2>
        <button @click="addProcess" class="me-3">Add Process</button>
        <button v-show="processes.length" @click="addAttribute">Add Attribute to All Processes</button>
        <div v-for="(process, index) in processes" :key="index" class="process-item">
          <div class="name-delete">
            <div class="id-name-row" style="align-items: baseline;">
              <p>ID: {{ index + 1 }} </p>
              <label>Process Name:</label>
              <input v-model="process.name" placeholder="Process Name" class="process-name-input form-control" />
            </div>
            <div>
              <button @click="deleteProcess(index)" class="delete-btn ">🗑️</button>
            </div>
          </div>

          <div class="pretask-posttask-row">
            <label>Pre-task:</label>
            <input v-model="process.pretask" placeholder="Pre-task Name" class="process-name-input form-control form-control-pretask" />
          </div>
          <div v-for="(attribute, attrIndex) in process.attributes" :key="attrIndex" class="attribute-item">
            <hr class="my-4" />
            <div class="name-delete">
              <p>Attribute ID: {{ attribute.id }}</p>
              <button @click="deleteAttribute(index, attrIndex)" class="delete-btn">🗑️</button>
            </div>
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
          <div class="name-delete">
            <div class="id-name-row" style="align-items: baseline;">
              <p class="">ID: {{ index + 1 }} </p>
              <label>Resource Name:</label>
              <input v-model="resource.resourceName" placeholder="Resource Name" class="process-name-input form-control" />
            </div>
            <div>
              <button @click="deleteResource(index)" class="delete-btn">🗑️</button>
            </div>
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
          <div class="id-name-row name-delete" style="align-items: baseline;">
            <p class="">ID: {{ index + 1 }} </p>
            <button @click="deleteSPG(index)" class="delete-btn">🗑️</button>
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
          <div class="name-delete" style="align-items: baseline;">
            <div>
              <div class="d-flex align-items-center ms-3">
                <label>Variable Name:</label>
                <input v-model="variable.name" placeholder="Variable Name" class="process-name-input form-control ms-2 me-3" />
                <label>Type:</label>
                <select id="typeSelect" v-model="variable.type" class="form-control process-name-input ms-2">
                  <option value="number">Number</option>
                  <option value="bool">Bool</option>
                </select>
              </div>

              <div v-if="variable.type === 'number'" class="d-flex align-items-center ms-3 mt-3">
                <label>Domain Name:</label>
                <input v-model="variable.domainName" placeholder="Variable Domain" class="process-name-input form-control ms-2" />
                <label class="ms-3">Domain Scope:</label>
                <input v-model="variable.domainScope" placeholder="Variable Scope" class="process-name-input form-control ms-2" />
              </div>
            </div>
            <div>
              <button @click="deleteVariable(index)" class="delete-btn">🗑️</button>
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
        <div v-for="(goal, index) in goals" :key="index" class="process-item name-delete">
          <div class="d-flex align-items-center ms-3" style="width: 95%;">
            <label>Goal Expression:</label>
            <input v-model="goal.expression" placeholder="Goal Expression" class="form-control ms-2 me-3" style="width: 80%;" />
          </div>
          <div style="width: 5%;">
            <button @click="deleteGoal(index)" class="delete-btn">🗑️</button>
          </div>
       </div>
       <div class="mt-3">
          <button v-show="goals.length" @click="saveGoal" class="me-3">Save Goal</button>
        </div>
      </div>

      <!-- Add Constraint Section -->
      <div class="add-constraint">
        <!-- <hr class="my-4" /> -->
        <h2>Add Constraint</h2>
        <button @click="addConstraint" class="me-3">Add Constraint</button>
        <div v-for="(constraint, index) in constraints" :key="index" class="constraint-item" style="align-items: baseline;">
          <div class="constraint-id-row">
            <p class="">Constraint ID: {{ index + 1 }} </p>
            <div>
              <button @click="addLayer(index)" class="me-3">Add Layer</button>
              <button @click="deleteConstraint(index)" class="delete-btn">🗑️</button>
            </div>

          </div>

          <div v-for="(layer, layerIndex) in constraint.layers" :key="layerIndex" class="layer-item horizontal-layout">
            <div class="d-flex align-items-center justify-content-between"  style="align-items: baseline;">
              <p>Layer ID: {{ layerIndex + 1 }}</p>
              <div>
                <button @click="addObject(index, layerIndex)" class="ms-3">Add Object</button>
                <button @click="deleteLayer(index, layerIndex)" class="delete-btn ms-2">🗑️</button>
              </div>
            </div>
            <div v-for="(object, objectIndex) in layer.objects" :key="objectIndex" class="object-item" style="margin-top: 10px;">
              <div class="object-row">
                <label>Object Name:</label>
                <input v-model="object.name" placeholder="Object Name" class="form-control object-input ms-2" />
                <label>Resource:</label>
                <input v-model="object.resource" placeholder="Resource" class="form-control object-input ms-2 me-2" />
                <button @click="deleteObject(index, layerIndex, objectIndex)" class="delete-btn">🗑️</button>
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

      <!-- Generate Model -->
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
      <div class="data-container mb-3">
        <h2>Solutions</h2>
        <div v-if="solutions.length > 0">
          <!-- <div v-for="(solution, index) in solutions" :key="index" class="solution">
            <span class="solution-header">Solution {{ index + 1 }}:</span>
            <div v-for="(value, key) in solution" :key="key" class="solution-item">
              <strong>{{ key }}:</strong> {{ value }}
            </div>
          </div> -->
          <DataTable :value="tableData" tableStyle="min-width: 50rem">
            <!-- ID -->
            <Column field="id" header="Solution ID"></Column>
            <!-- Generate rows dynamically -->
            <Column
              v-for="col in columns"
              :key="col.field"
              :field="col.field"
              :header="col.header"
            ></Column>
          </DataTable>
        </div>
        <div v-else>
          <p>No Solutions Found.</p>
        </div>
      </div>



    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import * as MiniZinc from 'minizinc';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';


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

// Model file upload
const fileInput = ref(null);

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

// Function to delete a process
const deleteProcess = (index) => {
  processes.value.splice(index, 1);
};

// Function to add an attribute to all processes
const addAttribute = () => {
  const newAttributeName = '';
  commonAttributes.value.push(newAttributeName);
  processes.value.forEach(process => {
    process.attributes.push({ id: process.attributes.length + 1, name: newAttributeName, valueType: Number, value: '' });
  });
};

const deleteAttribute = (processIndex, attrIndex) => {
  processes.value[processIndex].attributes.splice(attrIndex, 1);
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

const deleteResource = (index) => {
  resources.value.splice(index, 1);
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

const deleteSPG = (index) => {
  spgs.value.splice(index, 1);
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

const deleteVariable = (index) => {
  variables.value.splice(index, 1);
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

const deleteGoal = (index) => {
  goals.value.splice(index, 1);
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

const deleteObject = (constraintIndex, layerIndex, objectIndex) => {
  constraints.value[constraintIndex].layers[layerIndex].objects.splice(objectIndex, 1);
};

const deleteLayer = (constraintIndex, layerIndex) => {
  constraints.value[constraintIndex].layers.splice(layerIndex, 1);
};

const deleteConstraint = (index) => {
  constraints.value.splice(index, 1);
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

const saveModel = () => {
  const process = {
    processes: processes.value,
    resources: resources.value,
    variables: variables.value,
    goals: goals.value,
    constraints: constraints.value,
    spgs: spgs.value
  }
  console.log(process);
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
          importedData &&
          importedData.processes &&
          importedData.resources &&
          importedData.variables &&
          importedData.goals &&
          importedData.constraints &&
          importedData.spgs
        ) {
          // load the imported data into the data variables
          processes.value = importedData.processes;
          resources.value = importedData.resources;
          variables.value = importedData.variables;
          goals.value = importedData.goals;
          constraints.value = importedData.constraints;
          spgs.value = importedData.spgs;

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

// generate headers for the data table
const columns = computed(() =>
  processes.value.map((proc) => ({
    field: proc.name.toLowerCase(),
    header: proc.name,
  }))
);

// generate table data for the data table
const tableData = computed(() =>
  solutions.value.map((sol, index) => {
    const row = { id: index + 1 }; // row Id
    sol.start.forEach((value, idx) => {
      const processName = processes.value[idx]?.name.toLowerCase(); // get the process name
      if (processName) {
        row[processName] = value; // add the process value to the row
      }
    });
    return row;
  })
);

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

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #d9534f;
}

.name-delete {
  display: flex;
  justify-content: space-between;
}

.data-container {
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    border-radius: 10px;
    padding: 20px;
    margin: 20px
  }

  .solution {
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* prevent content from overflowing */
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
  display: inline-block; /* display each variable and value on the same line */
  margin-right: 15px; /* set the spacing to keep it neat */
}

</style>
