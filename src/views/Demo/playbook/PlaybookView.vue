<template>
  <PlaybookHeadBar
    @importProcess="importProcess"
    @saveProcess="saveProcess"
  />
  <div>
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


</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import PlaybookHeadBar from '@/components/PlaybookHeadBar.vue';
import PlaybookStructure from './PlaybookStructureView.vue';
import PlaybookDetailView from './PlaybookDetailView.vue';
import ProEmptyView from '../Creator/ProEmptyView.vue';
import GWConstraint from '@/model/Gateconstraint.txt?raw';
import BasicModelString from '@/model/BasicModelString.txt?raw';
import ChoiceConstraint from '@/model/ChoiceConstraint.txt?raw';
import * as MiniZinc from 'minizinc';
import { message } from 'ant-design-vue';
const [messageApi, contextHolder] = message.useMessage();
// import router from '@/router';

const processData = ref({
  type: '',
  processes: []
})

const attributes = ref([]);
const gateways = ref([]);
const events = ref([]);


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
// processes
const processes = ref([]);

// array to store the choices
const choices = ref([]);

// option solution
const processSolution = ref([]);

// solutions from Minizinc
const solutions = ref([]);

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

// set the processes
const setProcesses = () => {

}

// set the option solution
const setProcessSolution = async () => {
  const optionLength = processData.value.processes.length;
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
  gateways.value.forEach((gateway, index) => {
    gateway.outgoingDetails.forEach((outProcess, outIndex) => {
      outProcess.subProcessArray.forEach((outSub, outSubIndex) => {
        // gateDependencies part
        const gd = `(p: Option${outProcess.index + 1}(${outSubIndex + 1}), req: [Option${outProcess.selectedPro.index + 1}(${outProcess.selectedOption})])`;
        gateDependencies += gd;
        if ( index === gateways.value.length - 1 && outIndex === gateway.outgoingDetails.length - 1 && outSubIndex === outProcess.subProcessArray.length - 1) {
          gateDependencies += ']; \n';
        } else {
          gateDependencies += ',\n ';
        }
      })
      // gateOutgoings part
      const go = `(g: Gate(${index + 1}), props: Option${outProcess.index + 1}(1..${outProcess.subProcessArray.length}))`;
      gateOutgoings += go;
      if ( index === gateways.value.length - 1 && outIndex === gateway.outgoingDetails.length - 1) {
        gateOutgoings += '];';
      } else {
        gateOutgoings += ',\n ';
      }
    })
  })

  gwDataString.value += gateDependencies;
  gwDataString.value += gateOutgoings;
  console.log('gwData:', gwDataString.value);
  // localStorage.setItem('GWConstraint', JSON.stringify(GWConstraint.value));
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
          const grouped = new Map();
          depList.dependencies.forEach((listDep) => {
            const { process, subPro} = listDep;
            if (!grouped.has(process)) {
              grouped.set(process, []);
            }
            grouped.get(process).push(subPro);
          });
          grouped.forEach((mapsubPros, mapprocess) => {
            mapsubPros.forEach((mapsubPro, subProIndex) => {
              if (subProIndex != mapsubPros.length - 1) {
                depDeclare += `Option${mapprocess}(${mapsubPro}), `;
              } else {
                depDeclare += `Option${mapprocess}(${mapsubPro})])`;
              }
            })
          })
          if (proIndex == processData.value.processes.length - 1 && subIndex == process.subProcessArray.length - 1 && depListIndex == subPro.depListArray.length - 1) {
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
  if (processData.value.type === 'Configurator Playbook') {
    generateGWConstraint();
    modelString += GWConstraintString;
    dataString += gwDataString.value;
  }

  // console.log('Model String:', modelString);
  // console.log('Data String:', dataString);
};


const solveModel = async () => {
  const model = new MiniZinc.Model();
  model.addString(modelString);
  model.addString(dataString);
  if (choices.value.length > 0) {
    model.addString(choiceConstraint);
    model.addString(choiceData.value);
  }

  console.log('Model String:', modelString);
  console.log('Data String:', dataString);

  // let complete = modelString.value + completeData.value + customDataString.value + customConstraintString.value;
  // sessionStorage.setItem('completeModel', complete);

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
  if (choices.value[lastChoice.value.option].length > processes.value[lastChoice.value.option].choiceNum) {
    messageApi.info(`You can only choose ${processes.value[lastChoice.value.option].choiceNum} properties in option${lastChoice.value.option + 1}.`);
    // console.log(`You can only choose ${processes.value[lastChoice.value.option].choiceNum} properties in option${lastChoice.value.option + 1}.`);
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
      // console.log(dependencyAlert + depListAlert);
    }
  }
  choices.value[lastChoice.value.option].splice(-1, 1);
}


//////////////////////////////Page Control////////////////////////////////////

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
const saveProcess = async() => {
  const data = {
    process: {
      type: processData.value.type,
      processes: processData.value.processes
    },
    gateways: gateways.value,
    events: events.value,
    processAttr: attributes.value
  }
  const dataString = JSON.stringify(data, null, 2);
  const blob = new Blob([dataString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'proStructure.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
  console.log('Data saved successfully:');
}



// Function to import a model from a JSON file
const importProcess = async(file) => {
  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Check if the imported data has the required properties
        if (importedData) {
          // load the imported data into the data variables
          processData.value = importedData.process;
          attributes.value = importedData.processAttr;
          gateways.value = importedData.gateways;
          events.value = importedData.events;

          console.log('Data imported successfully:', importedData);

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
        } else {
          console.error('JSON file does not contain the required data.');
        }
      } catch (error) {
        console.error('Import error:', error);
      }
    };

    reader.readAsText(file);

    // console.log(processData.value);
    modelString = BasicModelString;
    dataString = '';
    attrString = '';
    gwDataString.value = '';
    dsReplenish();
    solveModel();
    choiceArrayCreate();
    setProcessSolution();
  }
};

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

onMounted(async() => {
  await nextTick();
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

  dsReplenish();
  try {
    await solveModel();
  } catch (error) {
    console.error('Error during solving:', error);
  }
  choiceArrayCreate();
  setProcessSolution();

  initialized = true;
})

</script>

<style scoped>
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
  /* padding: 20px; */
  overflow-y: auto;
  /* width: 80%; */
  /* margin-left: 30%; */
  padding: 1px 16px;
  height: 100%;
  /* padding-top: 20px; */
}

 .page-container {
  display: flex;
  height: 100%;
  align-items: flex-start;
  position: relative;
}
</style>
