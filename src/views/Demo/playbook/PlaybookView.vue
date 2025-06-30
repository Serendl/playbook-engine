<template>
  <PlaybookHeadBar1/>
  <div class="playbook-container">
    <div v-if="initialized">
      <contextHolder />
    </div>
    <div class="page-container">
      <div class="left-bar">
        <PlaybookStructure
          :processData="processData"
          :choices="choices"
          :processSolution="processSolution"
          @expand="expand"
          @selectProcess="selectProcess"
          @selectSubProcess="selectSubProcess"
          @updateLastChoice="updateLastChoice"
        />
      </div>
      <div class="processDetial">
        <PlaybookDetailView
          v-if="processData.processes.length > 0"
          :selectedProcess="selectedProcess"
          :selectedSubProcess="selectedSubProcess"
          :currentProcess="currentProcess"
          :totalpage="totalpage"
          :type="processData.type"
          @previousPage="previousPage"
          @nextPage="nextPage"
        />
        <ProEmptyView v-else />
      </div>
    </div>
  </div>
  <button
    @click="showDiagram()"
    class="floating-button"
    style="top: 15%;"
  >
    <FileImageOutlined style="font-size: 20px" />
  </button>

  <button
    v-if="attributeTemplates.length > 0"
    v-show="!drawerVisible1"
    @click="toggleDrawer1()"
    class="floating-button"
    style="top: 22%;"
  >
    <SettingOutlined style="font-size: 20px" />
  </button>

  <button
    v-if="recommendedSolutions.length > 0"
    v-show="!drawerVisible2"
    @click="toggleDrawer2()"
    class="floating-button"
    style="top: 29%;"
  >
    <UnorderedListOutlined style="font-size: 20px" />
  </button>

  <a-drawer
    v-model:open="drawerVisible1"
    placement="right"
    title="Recommendation Configuration"
    width="600"
  >
    <div>
      <div class="d-flex justify-content-between mb-2" style="align-items: baseline;">
        <h3 class="ms-2">Set Value Range</h3>
        <button
          @click="getRecom()"
          class="btn me-2"
          :class="{
            'btn-primary': selectedTempt !== null,
            'btn-secondary': selectedTempt === null
          }"
        >
          Get Recommendations
        </button>
      </div>
      <div>
        <div v-for="(attr, index) in attributes" :key="index" class="d-flex ms-2" style="align-items: baseline;">
          <label class="me-2">{{ attr.name }} Range:</label>
          <input v-model="attr.lowBound" class="form-control mb-3" placeholder="Low" style="width: 80px;" />
          <p class="ms-2 me-2">-</p>
          <input v-model="attr.upBound" class="form-control mb-3" placeholder="Up" style="width: 80px;" />
          <label class="ms-2 me-2">Operation:</label>
          <select class="form-select mb-3" v-model="attr.operation" style="width: 120px;">
            <option v-for="(operation, index) in operationList" :key="index" :value="operation">{{ operation }}</option>
          </select>
        </div>
      </div>

      <DialogComp v-model:visible="DiaVisible" modal header="Customize Your Model" :style="{ width: '57rem' }">
        <div class="align=itmes-center section-area">
          <div class="d-flex align-items-center mb-1" style="align-items: baseline;">
            <input v-model="newAttrTempt.name" class="form-control mb-3" placeholder="Value Template Name" style="width: 200px;" />
          </div>
          <div class="section-description">
            <textarea v-model="newAttrTempt.description" rows="3" class="form-control mb-3" placeholder="Template Description"></textarea>
          </div>
          <div v-for="(attr, index) in newAttrTempt.attrInfo" :key="index" >
            <div class="section quill-card">
              <div class="section-title" style="align-items: baseline;">
                <h4> {{ attr.attrName }}</h4>
              </div>

              <div class="slider-area">
                <SliderComp
                  v-model="attr.rangeValue"
                  :min="1"
                  :max="5"
                  :range="true"
                  class="w-56 slider-space custom-slider"
                />

                <div class="slider-info mt-2">
                  <div class="slider-value d-flex align-items-center">
                    <input
                      type="text"
                      class="form-control me-2"
                      v-model="attr.rangeDesc"
                      placeholder="Value Range Description"
                      style="width: 200px;"
                    >
                    <p>({{ attr.rangeValue[0] }} - {{ attr.rangeValue[1] }})</p>
                  </div>

                  <textarea
                    v-model="attr.rangeExplan"
                    rows="3"
                    class="form-control"
                    placeholder="Range Explanation"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-2"  style="display: flex; justify-content: flex-end; max-width: 500px;">
            <button type="button" label="Cancel" class="btn btn-primary me-3" @click="{visible2 = false; clearDialog()}">Clear</button>
            <button type="button" label="Save" class="btn btn-primary me-3" @click="{visible2 = false; saveAttrTempt()}">Save</button>
        </div>
      </DialogComp>
    </div>
    <div>
      <h3 class="ms-2">Select a Model</h3>
      <div
        v-for="(attrTempt, temIndex) in attributeTemplates"
        :key="temIndex"
        @click="selectTempt(temIndex)"
        class="template-card"
        :class="{
          'selected': selectedTempt === temIndex
        }"
      >
        <div>
          <h4>{{ attrTempt.name }}</h4>
          <p>{{ attrTempt.description }}</p>
          <h5>Attributes:</h5>
          <div v-for="(attr, attrIndex) in attrTempt.attrInfo" :key="attrIndex">
            <p>{{ attr.attrName }}: {{ attr.rangeValue[0] }}-{{ attr.rangeValue[1] }} {{ attr.rangeExplan }}</p>
          </div>
        </div>
      </div>
      <div
        class="template-card d-flex align-items-center justify-content-center"
        @click="newTempt()"
      >
        <PlusCircleOutlined style="font-size: 20px"/>
      </div>
    </div>
  </a-drawer>

  <a-drawer
    v-model:open="drawerVisible2"
    placement="right"
    title="Recommendation"
    width="600"
  >
    <div v-if="recommendedSolutions.length > 0">
      <h1>Solutions</h1>
      <div
        v-for="(recSolution, recIndex) in recommendedSolutions"
        :key="recIndex"
        class="process template-card"
        :class="{
          'selected': selectedRec === recIndex
        }"
        @click="selectRec(recIndex)"
      >
        <div class="d-flex" style="align-items: baseline;">
          <button
            v-if="recSolution.show"
            class="drop-down-button me-2"
            @click.stop="expandOption(recIndex)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M12 15l-4.243-4.243 1.415-1.414L12 12.172l2.828-2.829 1.415 1.414z"/>
                </g>
            </svg>
          </button>
          <button
            v-if="!recSolution.show"
            class="drop-down-button me-2"
            @click.stop="expandOption(recIndex)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M12.172 12L9.343 9.172l1.414-1.415L15 12l-4.243 4.243-1.414-1.415z"/>
                </g>
            </svg>
          </button>
          <h6 class="solution-header">Solution {{ recIndex + 1 }}:</h6>
        </div>
        <div v-show="recSolution.show" class="solution-item">
          <div v-for="(prop, opIndex) in recSolution.chosen_prop.set" :key="opIndex" class="prop mb-2">
            <strong class="me-1">Process {{ prop.c }} {{ processData.processes[prop.c - 1].name }}:</strong>
            <strong>{{ transformer(prop.e - 1) }}. {{prop.displayName}}</strong>
          </div>
        </div>
        <div v-for="(attr, attrIndex) in attributes" :key="attrIndex" class="ms-3">
          <strong class="me-2">Total {{attr.name}}: {{ recSolution['Total' + attr.name] }}</strong>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import PlaybookHeadBar1 from '@/components/PlaybookHeadBar1.vue';
import PlaybookStructure from './PlaybookStructureView.vue';
import PlaybookDetailView from './PlaybookDetailView.vue';
import ProEmptyView from '../Creator/ProEmptyView.vue';
import GWConstraint from '@/model/Gateconstraint.txt?raw';
import BasicModelString from '@/model/BasicModelString.txt?raw';
import ChoiceConstraint from '@/model/ChoiceConstraint.txt?raw';
// import * as MiniZinc from 'minizinc';
import { init, Model } from 'https://cdn.jsdelivr.net/npm/minizinc/dist/minizinc.mjs'
import { FileImageOutlined, SettingOutlined, PlusCircleOutlined, UnorderedListOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
const [messageApi, contextHolder] = message.useMessage();
// import router from '@/router';

// recommendation setting drawer visible
const drawerVisible1 = ref(false)
const toggleDrawer1 = () => {
  drawerVisible1.value = !drawerVisible1.value
}

// recommendation solutions drawer visible
const drawerVisible2 = ref(false)
const toggleDrawer2 = () => {
  drawerVisible2.value = !drawerVisible2.value
}

const processData = ref({
  type: '',
  processes: []
})

// opration list
const operationList = ["Minimize", "Maximize"];


// basic data
const attributes = ref([]);
const gateways = ref([]);
const events = ref([]);
const attributeTemplates = ref([]);
const newAttrTempt = ref(null);

// create a new attribute template Dialog
const DiaVisible = ref(false);

// select a new attribute template
const selectedTempt = ref(null);
const selectTempt = (temIndex) => {
  if (selectedTempt.value === temIndex) {
    selectedTempt.value = null
  } else {
    selectedTempt.value = temIndex;
  }
}

// select a recommended solution
const selectedRec = ref(null);
const selectRec = (recIndex) => {
  if (selectedRec.value === recIndex) {
    selectedRec.value = null
    choices.value = [];
    choiceArrayCreate();
  } else {
    selectedRec.value = recIndex;
    choices.value = [];
    choiceArrayCreate();
    recommendedSolutions.value[recIndex].chosen_prop.set.forEach((prop) => {
      const optionIndex = prop.c - 1;
      const subOptionIndex = prop.e - 1;
      choices.value[optionIndex].push(subOptionIndex);
    })
  }
}

// current process and subprocess
const selectedProcess = ref(null)
const selectedSubProcess = ref(null)
// current process is [processIndex, subProcessIndex]
const currentProcess = ref([-1, -1]);
// last process is [processIndex, subProcessIndex]
const lastProcess = ref([-1, -1]);
// total page is [processNum, subProcessNum]
const totalpage = ref([0, 0]);

// initialize status
let initialized = false;

//////////////////////////////Solution and Choices////////////////////////////////////

// array to store the choices
const choices = ref([]);

// option solution
const processSolution = ref([]);

// solutions from Minizinc
const solutions = ref([]);

// attrWeight
// [
//   [0.2, 0.3, 0.5],
//   [0.1, 0.4, 0.5],
//   [0.3, 0.3, 0.4]
// ]
const weightArray = ref([]);

// temporary array to store the solution distance
const disArray = ref([]);

// custom dataString
const customDataString = ref('');
// custom constraintString
const customConstraintString = ref('');
// all solutions meeting user customization
const customSolutions = ref([]);
// recommended solutions: solutions filtered from customSolutions
const recommendedSolutions = ref([]);


// Model Strings
const GWConstraintString = GWConstraint;

let modelString = BasicModelString;
let dataString = '';
let attrString = '';
const gwDataString = ref('');
let choiceConstraint = ChoiceConstraint;

// String of choice data
const choiceData = ref('');

// record the last choice
const lastChoice = ref({
  option: 0,
  property: 0,
});

// minizinc status
const resultStatus = ref('ALL_SOLUTIONS');

// create choice array
const choiceArrayCreate = () => {
  for (let i = 0; i < processData.value.processes.length; i++) {
    choices.value.push([]);
  }
};


// recommendSolutions expand button
const expandOption = (recIndex) => {
  recommendedSolutions.value[recIndex].show = !recommendedSolutions.value[recIndex].show;
}

//////////////////////////////// Recommendation Algorithm /////////////////////////////

// cartesianProduct to get all combinations
const cartesianProduct = (arrays) => {
  return arrays.reduce((acc, curr) => {
    return acc.flatMap((x) => curr.map((y) => [...x, y]));
  }, [[]]);
};

// set the attribute weight
const setAttrWeight = () => {
  if (selectedTempt.value === null) {
    return;
  }
  weightArray.value = [];
  const currentAttrTempt = attributeTemplates.value[selectedTempt.value];
  const attrWeightSet = [];
  currentAttrTempt.attrInfo.forEach((attr) => {
    let weightList = [];
    let currentWeight = attr.rangeValue[0];
    while(currentWeight <= attr.rangeValue[1]) {
      weightList.push(Number(currentWeight.toFixed(1)));
      currentWeight += 0.2;
    }
    attrWeightSet.push(weightList);
  })
  const cartesianProductResult = cartesianProduct(attrWeightSet);
  cartesianProductResult.forEach((array) => {
    let weightSum = 0;
    array.forEach((value) => {
      weightSum += value;
    })
    // normalize the weight to make sure the balance between the attributes
    const normalizedArray = array.map((value) => Number((value / weightSum).toFixed(3)));
    weightArray.value.push(normalizedArray);
  })
  console.log(weightArray.value);
}

// get recommendation
const getRecom = async() => {
  await setAttrWeight();
  await applyCustomization();
  drawerVisible1.value = false;
  drawerVisible2.value = true;
}

// apply user customization
const applyCustomization = async() => {
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

  let completeModel = modelString + dataString + customConstraintString.value + customDataString.value;

  if (choices.value.length > 0) {
    completeModel += choiceConstraint + choiceData.value;
  }

  try {
    await solveModel(completeModel, customSolutions);
  } catch (error) {
    console.error('Error during applying customization:', error);
  }

  await solveDisModel(buildDisModel());
  initialized = true;
}

// build distance model
const buildDisModel = () => {
  let completeDisModel = `int: nSolutions;\nint: nWeights;\n`;
  let attrArrayString = '';
  let attrWeightString = '';
  let idealAttrString = '';
  let boundString = '';
  let disConstraintString = 'array[1..nWeights, 1..nSolutions] of var float: distance;\nconstraint\n  forall(w in 1..nWeights, i in 1..nSolutions) (\n    distance[w, i] =\n';

  let completeDataString = `nSolutions = ${customSolutions.value.length};\nnWeights = ${weightArray.value.length};\n`;
  let attrArrayData = '';
  let boundData = '';
  let idealAttrData = '';
  let weightDataString = '';

  attributes.value.forEach((attribute, attrIndex) => {
    const attrName = `Total${attribute.name}`;
    const name = attribute.name;

    // === Declaration in the model ===
    attrArrayString += `array[1..nSolutions] of float: ${attrName};\n`;
    attrWeightString += `array[1..nWeights] of float: w${name};\n`;
    idealAttrString += `float: ideal${name};\n`;
    boundString += `float: max${name};\nfloat: min${name};\n`;

    // === Calculation formula ===
    const rangeExpr = `(max${name} - min${name})`;
    const normExpr = `((Total${name}[i] - min${name}) / ${rangeExpr} - ideal${name})^2`;
    disConstraintString += `      w${name}[w] * ${normExpr}`;
    disConstraintString += (attrIndex < attributes.value.length - 1) ? ' +\n' : '\n  );\n';

    // === Data ===
    attrArrayData += `${attrName} = [${customSolutions.value.map(sol => sol[attrName]).join(', ')}];\n`;

    const attrValues = customSolutions.value.map(sol => sol[attrName]);
    const attrMaxValue = Math.max(...attrValues);
    const attrMinValue = Math.min(...attrValues);

    boundData += `max${name} = ${attrMaxValue};\nmin${name} = ${attrMinValue};\n`;
    idealAttrData += `ideal${name} = ${attribute.operation === 'Maximize' ? 1 : 0};\n`;

    weightDataString += `w${name} = [${weightArray.value.map(w => w[attrIndex].toFixed(3)).join(', ')}];\n`;
  });

  const outputString = `
    solve satisfy;

    output [
      if w = 1 then "[" else ",\\n" endif ++
      "[" ++ concat([ show(distance[w, i]) ++ if i < nSolutions then ", " else "]" endif | i in 1..nSolutions ])
      ++ if w = nWeights then "]" else "" endif
      | w in 1..nWeights
    ];
    `;

  completeDisModel += attrArrayString + attrWeightString + idealAttrString + boundString + disConstraintString + outputString;
  completeDataString += attrArrayData + boundData + idealAttrData + weightDataString;

  return completeDisModel + completeDataString;
};


// solve the Distance Model
const solveDisModel = async(model) => {
  disArray.value = [];

  console.log('completeModel', model);
  await solveModel(model, disArray);

  if (disArray.value.length === 0) {
    console.error('No solution found for the distance model');
    return;
  }

  const solutionHashMap = new Map();

  const distanceMatrix = disArray.value[0].distance; // 2D array: distance[w][i]

  for (let w = 0; w < weightArray.value.length; w++) {
    const distanceList = distanceMatrix[w];

    const sortedIndices = distanceList
      .map((distance, index) => ({ distance, index }))
      .sort((a, b) => a.distance - b.distance)
      .map(item => item.index);

    const top3 = sortedIndices.slice(0, 3);

    console.log(`top3 for weight group ${w}:`, top3);

    top3.forEach((index) => {
      solutionHashMap.set(index, (solutionHashMap.get(index) || 0) + 1);
    });
  }

  console.log('solutionHashMap:', solutionHashMap);

  const minIndexes = Array.from(solutionHashMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(item => item[0]);

  const minIndexSet = new Set(minIndexes);
  recommendedSolutions.value = customSolutions.value
  .map((solution, index) => {
    const updatedSet = solution.chosen_prop.set.map(prop => {
      // transform 'OptionX' to index
      const optionIndex = parseInt(prop.c.replace('Option', ''));

      // capture the sub option name
      const name =
        processData.value.processes?.[optionIndex - 1]?.subProcessArray?.[prop.e - 1]?.name || 'N/A';


      return {
        ...prop,
        c: optionIndex,     // set 'OptionX' to index
        displayName: name   // add displayName
      };
    });

    return {
      ...solution,
      index,
      show: false,
      chosen_prop: {
        ...solution.chosen_prop,
        set: updatedSet
      }
    };
  })
  .filter(solution => minIndexSet.has(solution.index));

}

///////////////////////////////////////////////////////////////////////////////////////




// set the option solution
const setProcessSolution = async () => {
  const optionLength = processData.value.processes.length;
  processSolution.value = [];
  // console.log(solutions.value);

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
}

// Gateway Data
// gateway activity choosen number can be 0
const generateGWConstraint = () => {
  // Gateway = Gate(1..1);
  const gateDefine = `Gateway = Gate(1..${gateways.value.length});`;
  gwDataString.value += gateDefine + '\n';

  // gateDependencies = [(p: Option3(3), req: [Option1(3)])];
  // p: Option + 'outPro.index' + ('outPro.subPro.index')
  // req: Option + 'selectedPro.index' + ('selectedOption')
  let gateDependencies = 'gateDependencies = [';
  // gateOutgoings = [(g: Gate(1), props: Option2(1..3)), (g: Gate(1), props: Option3(1..3))];
  // g: Gate + '(gate.index)'
  // props: Option + 'outPro.index' + ('1..outPro.subPro.length)')
  let gateOutgoings = 'gateOutgoings = [';
  gateways.value.forEach((gateway, gateIndex) => {
    gateway.outgoingDetails.forEach((outProcess, outIndex) => {
      // -------------------- gateDependencies（expand range） --------------------
      const targetProcessIds = gateway.pathsMap[outProcess.id] || [];

      targetProcessIds.forEach((processId) => {
        const targetProcess = processData.value.processes.find(p => p.id === processId);
        console.log('targetProcess:', targetProcess);

        if (!targetProcess || !targetProcess.subProcessArray) return;

        targetProcess.subProcessArray.forEach((sub, subIndex) => {
          console.log(targetProcess.index)
          const gd = `(p: Option${targetProcess.index + 1}(${subIndex + 1}), req: [Option${outProcess.selectedPro.index + 1}(${outProcess.selectedOption})])`;
          gateDependencies += gd;

          // check if it is the last one
          const isLastGateway = gateIndex === gateways.value.length - 1;
          const isLastOut = outIndex === gateway.outgoingDetails.length - 1;
          const isLastProcess = processId === targetProcessIds[targetProcessIds.length - 1];
          const isLastSub = subIndex === targetProcess.subProcessArray.length - 1;

          if (isLastGateway && isLastOut && isLastProcess && isLastSub) {
            gateDependencies += '];\n';
          } else {
            gateDependencies += ',\n ';
          }
        });
      });

      const go = `(g: Gate(${gateIndex + 1}), props: Option${outProcess.index + 1}(1..${outProcess.subProcessArray.length}))`;
      gateOutgoings += go;
      if ( gateIndex === gateways.value.length - 1 && outIndex === gateway.outgoingDetails.length - 1) {
        gateOutgoings += ']; \n';
      } else {
        gateOutgoings += ',\n ';
      }
    })
  })

  gwDataString.value += gateDependencies;
  gwDataString.value += gateOutgoings;
}


const dsReplenish = () => {
  // Property = OptionA(1..3) ++ OptionB(1..3) ++ OptionC(1..3);
  let propTemplate = 'Property = ';
  processData.value.processes.forEach((process, proIndex) =>{
    let proDeclare = 'Option';
    if (proIndex != processData.value.processes.length - 1) {
      proDeclare += `${proIndex + 1}(1..${process.subProcessArray.length}) ++ `;
    } else {
      proDeclare += `${proIndex + 1}(1..${process.subProcessArray.length}); \n`;
    }
    propTemplate += proDeclare;
  })

  dataString += propTemplate;

  // dependencies = [
  //   (p: OptionC(2), req: [OptionA(1), OptionB(2)]),
  //   (p: OptionC(1), req: [OptionA(2), OptionB(2)]),
  //   (p: OptionC(1), req: [OptionA(3), OptionB(3)]),
  //   (p: OptionC(3), req: [OptionA(3)]),
  // ];
  let depTemplate = 'dependencies = [';
  processData.value.processes.forEach((process, proIndex) => {
    process.subProcessArray.forEach((subPro, subIndex) => {
      if (subPro.depListArray.length > 0) {
        subPro.depListArray.forEach((depList, depListIndex) => {
          let depDeclare = `(p: Option${proIndex + 1}(${subIndex + 1}), req: [`;

          // collect dependencies for the current subPro
          let reqOptions = [];

          depList.dependencies.forEach((listDep) => {
            const { process, subPro } = listDep;
            reqOptions.push(`Option${process}(${subPro + 1})`);
          });

          depDeclare += reqOptions.join(', ') + '])';

          // Determine if it is the last one
          if (
            proIndex === processData.value.processes.length - 1 &&
            subIndex === process.subProcessArray.length - 1 &&
            depListIndex === subPro.depListArray.length - 1
          ) {
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
  processData.value.processes.forEach((process, proIndex) => {
    let cardDeclare = `(props: Option${proIndex + 1}(1..${process.subProcessArray.length}), n: ${process.lowChoiceNum}..${process.upChoiceNum})`;
    if (proIndex == processData.value.processes.length - 1) {
      cardTemplate += cardDeclare;
    } else {
      cardTemplate += cardDeclare + ', \n';
    }
  });
  cardTemplate += '];\n';

  // cost = [80, 45, 50, 40, 15, 60, 40, 250, 100];
  if (attributes.value.length > 0) {
    attributes.value.forEach((attribute, attributeIndex) => {
      let attrDeclare = `${attribute.name} = [`;
      processData.value.processes.forEach((process, proIndex) => {
        process.subProcessArray.forEach((subPro, subIndex) => {
          if(subPro.subAttrArray.length > 0) {
            subPro.subAttrArray.forEach((attr, attrIndex) => {
              if (attribute.name === attr.name && attributeIndex === attrIndex) {
                if (proIndex === processData.value.processes.length - 1 && subIndex == process.subProcessArray.length - 1) {
                  attrDeclare += `${attr.value}];\n`;
                } else {
                  attrDeclare += `${attr.value}, `;
                }
              }
            })
          }
        })
      })
      attrString += attrDeclare;
    })
    let attrDefine = '';
    attributes.value.forEach((attribute) => {
      attrDefine += `array[Property] of ${attribute.type}: ${attribute.name};\n`;
      attrDefine += `${attribute.type}: max${attribute.name} = sum(${attribute.name});\n`
      attrDefine += `var 0..max${attribute.name}: Total${attribute.name} ::output = sum(p in Property)(chosen[p]*${attribute.name}[p]);\n`
    })
    modelString += attrDefine;
    dataString += attrString;
  }

  dataString += cardTemplate;


  // Gateway constraints and data
  if (gateways.value.length > 0) {
    generateGWConstraint();
    modelString += GWConstraintString;
    dataString += gwDataString.value;
  }

  // console.log('Model String:', modelString);
  // console.log('Data String:', dataString);
};


const solveModel = async (completeModel, solutionList) => {
  // const model = new MiniZinc.Model();
  const model = new Model()
  model.addString(completeModel);
  console.log('Complete Model:', completeModel);

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
      solutionList.value = []; // clear the previous results

      // parse the solutions
      solve.on('solution', solution => {
        // console.log('Solution:', solution.output.json);
        solutionList.value.push(solution.output.json);
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

// listen to the choices change
watch(
  choices,
  () => {
    if (initialized) {
      addConstraint();
      console.log('watch');
    }
  },
  { deep: true }
);

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

  let completeModel = modelString + dataString;

  if (choices.value.length > 0) {
    completeModel += choiceConstraint + choiceData.value;
  }

  try {
    await solveModel(completeModel, solutions);
    checkResultStatus();
  } catch (error) {
    console.error('Error during adding constraint:', error);
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

// update the last choice
const updateLastChoice = async (option, property) => {
  lastChoice.value.option = option;
  lastChoice.value.property = property;
}

// promption message for no solution
const noSolution = async () => {
  await updateLastChoice(lastChoice.value.option, lastChoice.value.property);
  if (choices.value[lastChoice.value.option].length > processData.value.processes[lastChoice.value.option].choiceNum) {
    messageApi.info(`You can only choose ${processData.value.processes[lastChoice.value.option].choiceNum} properties in option${lastChoice.value.option + 1}.`);
  } else {
    let dependencyAlert = '';
    let depListAlert = '';
    messageApi.info('This property cannot coexist with your previous selection. Please try others.');
    if (processData.value.processes[lastChoice.value.option].properties[lastChoice.value.property].depLists.length > 0){
      depListAlert = 'For this property, you can choose:\n';
      processData.value.processes[lastChoice.value.option].properties[lastChoice.value.property].depLists.forEach(depList => {
        depListAlert += `Dependency List: ${depList.name}: `;
        depList.dependencies.forEach((dep) => {
          depListAlert += `Option${dep.option}(${dep.propertyText}) `;
        })
        if (depList !== processData.value.processes[lastChoice.value.option].properties[lastChoice.value.property].depLists.slice(-1)[0]) {
          depListAlert += ';\n';
        }
      })
      messageApi.info(dependencyAlert + depListAlert);
      // console.log(dependencyAlert + depListAlert);
    }
  }
  choices.value[lastChoice.value.option].splice(-1, 1);
}




//////////////////////////////Page Control////////////////////////////////////

// character and number transformer
const transformer = (number) => {
  return String.fromCharCode(65 + number );
}

// Page visibility
const setTotalPage = () => {
  totalpage.value = [
    processData.value.processes.length || 0,
    processData.value.processes[processData.value.processes.length - 1].subProcessArray.length || 0
  ];
}

// Function to expand or collapse the process
const expand = (index) => {
  processData.value.processes[index].show = !processData.value.processes[index].show;
}

// Function to select a process
const selectProcess = (index) => {
  console.log(currentProcess.value);
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  console.log(lastProcess.value);
  selectedProcess.value = processData.value.processes[index];
  selectedSubProcess.value = null;
  currentProcess.value[0] = index;
  currentProcess.value[1] = -1;
  console.log(currentProcess.value);
}

// Function to select a subprocess
const selectSubProcess = (index, subIndex) => {
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  console.log(lastProcess.value);
  selectedProcess.value = processData.value.processes[index];
  selectedSubProcess.value = processData.value.processes[index].subProcessArray[subIndex];
  currentProcess.value[0] = index;
  currentProcess.value[1] = subIndex;
}

const newTempt = () => {
  const template = {
    id: attributeTemplates.value.length + 1,
    name: '',
    description: '',
    show: false,
    attrInfo: []
  }
  attributes.value.forEach(attr => {
    const newAttribute = {
      attrName: attr.name,
      rangeValue: [1, 5],
      rangeDesc: '',
      rangeExplan: ''
    }
    template.attrInfo.push(newAttribute);
  })
  newAttrTempt.value = template;
  DiaVisible.value = true;
}

const clearDialog = () => {
  newAttrTempt.value.name = '';
  newAttrTempt.value.description = '';
  newAttrTempt.value.attrInfo.forEach(attr => {
    attr.rangeValue = [1, 5];
    attr.rangeDesc = '';
    attr.rangeExplan = '';
  })
}

const saveAttrTempt = () => {
  attributeTemplates.value.push(newAttrTempt.value);
  newAttrTempt.value = null;
  DiaVisible.value = false;
  localStorage.setItem('attributeTemplates', JSON.stringify(attributeTemplates.value));
}

// Function to go to the previous page
const previousPage = () => {
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  if (currentProcess.value[1] >= 0) {
    currentProcess.value[1] -= 1;
    if (currentProcess.value[1] >= 0) {
      selectedSubProcess.value = processData.value.processes[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
    } else {
      selectedSubProcess.value = null;
    }
  } else if (currentProcess.value[0] > 0) {
    currentProcess.value[0] -= 1;
    if (processData.value.processes[currentProcess.value[0]].subProcessArray.length > 0) {
      currentProcess.value[1] = processData.value.processes[currentProcess.value[0]].subProcessArray.length - 1;
      selectedSubProcess.value = processData.value.processes[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
    } else {
      currentProcess.value[1] = -1;
      selectedSubProcess.value = null;
    }
  }
}

// Function to go to the next page
const nextPage = () => {
  lastProcess.value = [...currentProcess.value.map((x) => x)];
  if (currentProcess.value[1] < processData.value.processes[currentProcess.value[0]].subProcessArray.length - 1) {
    currentProcess.value[1] += 1;
    selectedSubProcess.value = processData.value.processes[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
  } else if (currentProcess.value[0] < processData.value.processes.length - 1) {
    currentProcess.value[0] += 1;
    currentProcess.value[1] = -1;
    selectedProcess.value = processData.value.processes[currentProcess.value[0]];
    selectedSubProcess.value = processData.value.processes[currentProcess.value[0]].subProcessArray[currentProcess.value[1]];
  }
}

// Function to save the model to a JSON file
// const saveProcess = async() => {
//   const data = {
//     process: {
//       type: processData.value.type,
//       processes: processData.value.processes
//     },
//     gateways: gateways.value,
//     events: events.value,
//     processAttr: attributes.value,
//     attributesTemplate: attributeTemplates.value
//   }
//   const dataString = JSON.stringify(data, null, 2);
//   const blob = new Blob([dataString], { type: 'application/json' });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'proStructure.json';
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);

//   URL.revokeObjectURL(url);
//   console.log('Data saved successfully:');
// }



// Function to import a model from a JSON file
// const importProcess = async(file) => {
//   if (file) {
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       try {
//         const importedData = JSON.parse(e.target.result);

//         // Check if the imported data has the required properties
//         if (importedData) {
//           // load the imported data into the data variables
//           processData.value = importedData.process;
//           attributes.value = importedData.processAttr;
//           gateways.value = importedData.gateways;
//           events.value = importedData.events;
//           attributeTemplates.value = importedData.attributeTemplate;

//           console.log('Data imported successfully:', importedData);

//           if (processData.value.processes.length > 0) {
//             selectedProcess.value = processData.value.processes[0];
//             lastProcess.value[0] = 0;
//             currentProcess.value[0] = 0;
//             totalpage.value = [
//               processData.value.processes.length || 0,
//               processData.value.processes[processData.value.processes.length - 1].subProcessArray.length || 0
//             ];
//           } else {
//             totalpage.value = [0, 0];
//           }
//         } else {
//           console.error('JSON file does not contain the required data.');
//         }
//       } catch (error) {
//         console.error('Import error:', error);
//       }
//     };

//     reader.readAsText(file);

//     // console.log(processData.value);
//     modelString = BasicModelString;
//     dataString = '';
//     attrString = '';
//     gwDataString.value = '';
//     dsReplenish();
//     let completeModel = modelString + dataString;
//     solveModel(completeModel, solutions);
//     choiceArrayCreate();
//     setProcessSolution();
//   }
// };

// Watch for changes in the processData and update the total page
watch(processData.value.processes, (newVal) => {
  if (newVal.length > 0) {
    totalpage.value = [
      newVal.length,
      newVal[newVal.length - 1]?.subProcessArray?.length || 0 // avoid undefined error
    ];
  } else {
    totalpage.value = [0, 0]; // avoid undefined error
  }
}, { deep: true });

onMounted( async() => {
  await init({
    workerURL: 'https://cdn.jsdelivr.net/npm/minizinc/dist/minizinc-worker.js',
    wasmURL: 'https://cdn.jsdelivr.net/npm/minizinc/dist/minizinc.wasm',
    dataURL: 'https://cdn.jsdelivr.net/npm/minizinc/dist/minizinc.data'
  })

  const typeStorage = JSON.parse(localStorage.getItem('type'));
  if (typeStorage) {
    processData.value.type = typeStorage;
  };
  const processDataStorage = JSON.parse(localStorage.getItem('processData'));
  if (processDataStorage) {
    processData.value = processDataStorage.process;
    attributes.value = processDataStorage.processAttr;
    gateways.value = processDataStorage.gateways;
    events.value = processDataStorage.events;
    attributeTemplates.value = processDataStorage.attributeTemplates;
    if (processData.value.processes.length > 0) {
      selectedProcess.value = processData.value.processes[0];
      lastProcess.value[0] = 0;
      currentProcess.value[0] = 0;
      totalpage.value = [
        processData.value.processes.length || 0,
        processData.value.processes[processData.value.processes.length - 1].subProcessArray.length || 0
      ];
    } else {
      totalpage.value = [0, 0];
    }
  }

  setTotalPage();

  dsReplenish();
  choiceArrayCreate();
  setProcessSolution();

  initialized = true;
})

</script>

<style scoped>
.playbook-container {
  padding-left: 40px;
  padding-right: 40px;
}

.left-bar {
  width: 30%;
  max-height: 85vh;
  min-height: 50vh;
  overflow-y: auto;
  position: sticky;
  top: 0;
  background-color: #f1f1f1;
  border-radius: 10px;
}

.processDetial {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1px 16px;
  height: 100%;
}

 .page-container {
  display: flex;
  height: 100%;
  align-items: flex-start;
  position: relative;
}

.floating-button {
  position: fixed;
  right: 14px;
  transform: translateY(-50%);
  z-index: 9999;
  background-color: #eaeaea;
  color: black;
  padding: 12px 16px;
  border: none;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.template-area {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 30px;
  background-color: #f1f1f1;
}

.template-card {
  border: 1px solid #ddd;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  background-color: #f5f5f5;
}

.template-card.selected {
  border: 2px solid #1677ff;
  background-color: #e6f4ff;
}

.section {
  margin-bottom: 20px;
  background-color: #b0b0b026;
}

.section-area {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  max-width: 800px;
  min-width: 90vh;
  margin-bottom: 30px;
  background-color: #f1f1f1;
}

.section-description {
  width: 100%;
  max-width: 800px;
}

.quill-card {
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  max-width: 800px;
}

.section-title {
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.slider-space {
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: 5px;
  margin-right: 5px;
}

.slider-value{
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}

:deep(.costom-slider .p-slider-range) {
  background: #000000 !important;
}

:deep(.costom-slider .p-slider-handle) {
  background: #000000 !important;
  border-color: #2d2d2d !important;
}

:deep(.costom-slider) {
  background: #a2a2a2;
}

.props-container {
  display: flex;
  flex-wrap: wrap; /* if there is too much content, allow line change */
  gap: 1rem; /* set line gap */
}

.prop {
  display: block; /* make each item in a line */
  margin-right: 1rem; /* set spacing to keep it neat */
  padding: 0.5rem; /* optional: set internal padding */
  border: 1px solid #ccc; /* optional: add border to each item */
  border-radius: 4px; /* optional: rounded border */
}

ul {
  margin: 0;
}

.drop-down-button {
  height: 24px;
  width: 28px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}
</style>
