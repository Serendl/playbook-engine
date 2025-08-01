<template>
  <div class="bpmn-container" style="border: 1px solid #ccc;">
    <div class="canvas" ref="canvas"></div>
    <div class="panel"></div>
    <div>
      <button @click="triggerFileUpload()" class="btn btn-primary mt-3 ms-2">Import XML</button>
      <input type="file" ref="fileInput" @change="loadDiagram" accept=".bpmn, .xml" style="display: none;" />
      <button @click="saveXMLDiagram()" class="btn btn-primary mt-3 ms-2">Save XML</button>
      <button @click="generateProcess()" class="btn btn-primary mt-3 ms-2">Generate Process</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import router from '@/router';

// BPMN
import 'bpmn-js/dist/assets/diagram-js.css' // Tool panel
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';

const canvas = ref(null)
let modeler = null;
const type = JSON.parse(localStorage.getItem('type')) || 'Text Playbook';

// original bpmn xml example
const bpmnXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_193vyns" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="18.3.1">
  <bpmn:process id="Process_1dy5s7e" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1p26f01" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1dy5s7e">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1p26f01">
        <dc:Bounds x="156" y="82" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`

onMounted(() => {
  modeler = new BpmnModeler({
    container: canvas.value,
    propertiesPanel: {
      parent: '.panel'
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule
    ]
  })

  modeler.importXML(bpmnXML).then(({ warnings }) => {
    if (warnings.length) {
      console.warn('BPMN import warnings:', warnings)
    } else {
      console.log('BPMN diagram rendered successfully!')
    }
  }).catch(err => {
    console.error('Error rendering BPMN:', err)
  })


})

// Function to save the current BPMN diagram as XML
function saveXMLDiagram() {
  modeler.saveXML({ format: true }).then(({ xml }) => {
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.bpmn'
    a.click()
    URL.revokeObjectURL(url)
  }).catch(err => {
    console.error('Save fail:', err)
  })
}

const fileInput = ref(null);

const triggerFileUpload = () => {
  fileInput.value.click();
};

// Function to import a model from a JSON file
function loadDiagram(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const xml = e.target.result
    try {
      await modeler.importXML(xml)
      console.log('BPMN load successfully!')
    } catch (err) {
      console.error('Load fail:', err)
    }
  }
  reader.readAsText(file)
}

function generateProcess() {
  const definitions = modeler.getDefinitions()
  const process = definitions.rootElements.find(el => el.$type === 'bpmn:Process')
  if (!process) {
    console.warn('Process not found in BPMN diagram')
    return
  }

  const elements = process.flowElements

  const nodeMap = {}
  const gatewayMap = {}
  const eventMap = {}
  let isLinear = true
  let index = 0;

  // initiatae the structure of node, event and gateway
  for (const el of elements) {
    if (el.$type === 'bpmn:SequenceFlow') continue

    if (el.$type === 'bpmn:ExclusiveGateway') {
      const gateWayBase = {
        id: el.id,
        type: el.$type,
        name: el.name || '',
        incoming: [],
        outgoing: [],
        incomingDetails: [],
        outgoingDetails: [],
        pathsMap: {}
      }
      gatewayMap[el.id] = gateWayBase
      isLinear = false;
    } else if(el.$type === 'bpmn:StartEvent' || el.$type === 'bpmn:EndEvent') {
      const seEventBase = {
        id: el.id,
        type: el.$type,
        name: el.name || '',
        incoming: [],
        outgoing: []
      }
      eventMap[el.id] = seEventBase
    } else {
      const base = {
        id: el.id,
        type: el.$type,
        name: el.name || '',
        incoming: [],
        outgoing: [],
        lowChoiceNum: 1,
        upChoiceNum: 1,
        subProcessArray: [],
        show: false,
        description: '',
        index: index++,
      }
      nodeMap[el.id] = base
    }
  }

  // incoming / outgoing dependencies
  for (const el of elements) {
    if (el.$type === 'bpmn:SequenceFlow') {
      const sourceId = el.sourceRef?.id
      const targetId = el.targetRef?.id

      if (sourceId) {
        if (nodeMap[sourceId]) nodeMap[sourceId].outgoing.push(targetId)
        else if (gatewayMap[sourceId]) gatewayMap[sourceId].outgoing.push(targetId)
        else if (eventMap[sourceId]) eventMap[sourceId].outgoing.push(targetId)
      }

      if (targetId) {
        if (nodeMap[targetId]) nodeMap[targetId].incoming.push(sourceId)
        else if (gatewayMap[targetId]) gatewayMap[targetId].incoming.push(sourceId)
        else if (eventMap[targetId]) eventMap[targetId].incoming.push(sourceId)
      }
    }
  }

  const idElementMap = { ...nodeMap, ...gatewayMap, ...eventMap }

  for (const gatewayId in gatewayMap) {
    const gateway = gatewayMap[gatewayId]
    const pathsMap = {}

    for (const outgoingId of gateway.outgoing) {
      const rawPaths = tracePathsFrom(outgoingId, idElementMap)

      const nodeIdSet = new Set()

      for (const path of rawPaths) {
        for (const id of path) {
          if (Object.prototype.hasOwnProperty.call(nodeMap, id)) {
            nodeIdSet.add(id)
          }
        }
      }

      pathsMap[outgoingId] = Array.from(nodeIdSet)
    }

    const allSets = Object.values(pathsMap).map(arr => new Set(arr));
    if (allSets.length > 0) {
      const commonIds = [...allSets[0]].filter(id =>
        allSets.every(set => set.has(id))
      );

      for (const key in pathsMap) {
        const filtered = new Set(pathsMap[key]);
        for (const id of commonIds) filtered.delete(id);
        pathsMap[key] = Array.from(filtered);
      }
    }

    gateway.pathsMap = pathsMap
  }



  const result = {
    process: {
      type: type,
      processes: Object.values(nodeMap),
    },
    gateways: Object.values(gatewayMap),
    events: Object.values(eventMap),
    processAttr: [],
    linear: isLinear,
    attributeTemplates: []
  }

  localStorage.setItem('processData', JSON.stringify(result))

  router.push('/proCreator')
}

// Function to trace all paths from a given node ID
function tracePathsFrom(id, idElementMap, visited = new Set()) {
  if (visited.has(id)) return []  // prevent cycles
  visited.add(id)

  const node = idElementMap[id]
  if (!node || !node.outgoing || node.outgoing.length === 0) return [[id]]

  const paths = []
  for (const nextId of node.outgoing) {
    const subPaths = tracePathsFrom(nextId, idElementMap, new Set(visited)) // deep copy of visited
    for (const sub of subPaths) {
      paths.push([id, ...sub])
    }
  }
  return paths
}


</script>

<style scoped>
.bpmn-container {
  position: absolute;
	background-color: #ffffff;
	width: 100%;
	height: 90%;
}

.canvas {
  width: 100%;
  height: 100%;
}

.panel{
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
}


</style>
