import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Demo/Creator/HomeView.vue'
import FileUploadView from '@/views/FileUploadView.vue'
import ProGenerateView from '@/views/ProGenerateView.vue'
import ProcessView from '@/views/MinizincIntegration/APIProcessView.vue'
import NodeProcessView from '@/views/MinizincIntegration/NodeProcess.vue'
import PGView from '@/views/PGView.vue'
import ProDeclareView from '@/views/NodeNet/ProDeclareView.vue'
import ProTestView from '@/views/NodeNet/ProTestView.vue'
import ProDefineView from '@/views/Configuration/version1/ProDefineView.vue'
import ProDefineView1 from '@/views/Configuration/version2/ProDefineView1.vue'
import ProDefineView2 from '@/views/Configuration/version3/ProDefineView2.vue'
import ProTest1View from '@/views/Configuration/version1/ProTest1View.vue'
import ProTest2View from '@/views/Configuration/version2/ProTest2View.vue'
import ProTest3View from '@/views/Configuration/version3/ProTest3View.vue'
import ProDefineView3 from '@/views/Configuration/version4/ProDefineView3.vue'
import ProTest4View from '@/views/Configuration/version4/ProTest4View.vue'
import ProCreator from '@/views/Demo/Creator/ProCreatorView.vue'
import ProBPMNView from '@/views/Demo/Creator/ProBPMNView.vue'
import PlaybookView from '@/views/Demo/playbook/PlaybookView.vue'
import DefineAttrView from '@/views/Demo/Creator/DefineAttrView.vue'
import ConfiguratorView from '@/views/Demo/ConfiguratorView.vue'
import DefineGatewayView from '@/views/Demo/Creator/DefineGatewayView.vue'
import AttrTemplateView from '@/views/Demo/Creator/AttrTemplateView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/proDeclare',
    name: 'proDeclare',
    component: ProDeclareView
  },
  {
    path: '/file-upload',
    name: 'file-upload',
    component: FileUploadView
  },
  {
    path: '/pro-generate',
    name: 'proGenerate',
    component: ProGenerateView
  },
  {
    path: '/pg-view',
    name: 'pg-view',
    component: PGView,
  },
  {
    path: '/process',
    name: 'process',
    component: ProcessView
  },
  {
    path: '/node-process',
    name: 'node-process',
    component: NodeProcessView
  },
  {
    path: '/pro-test',
    name: 'pro-test',
    component: ProTestView
  },
  {
    path: '/pro-test1',
    name: 'pro-test1',
    component: ProTest1View
  },
  {
    path: '/pro-test2',
    name: 'pro-test2',
    component: ProTest2View
  },
  {
    path: '/pro-define',
    name: 'pro-define',
    component: ProDefineView
  },
  {
    path: '/pro-define1',
    name: 'pro-define1',
    component: ProDefineView1
  },
  {
    path: '/pro-define2',
    name: 'pro-define2',
    component: ProDefineView2
  },
  {
    path: '/pro-test3',
    name: 'pro-test3',
    component: ProTest3View
  },
  {
    path: '/pro-define3',
    name: 'pro-define3',
    component: ProDefineView3
  },
  {
    path: '/pro-test4',
    name: 'pro-test4',
    component: ProTest4View
  },
  {
    path: '/pro-creator',
    name: 'pro-creator',
    component: ProCreator
  },
  {
    path: '/pro-bpmn',
    name: 'pro-bpmn',
    component: ProBPMNView
  },
  {
    path: '/playbook',
    name: 'playbook',
    component: PlaybookView
  },
  {
    path: '/define-attr',
    name: 'define-attr',
    component: DefineAttrView
  },
  {
    path: '/configurator-playbook',
    name: 'configurator-playbook',
    component: ConfiguratorView
  },
  {
    path: '/define-gateway',
    name: 'define-gateway',
    component: DefineGatewayView
  },
  {
    path: '/attr-template',
    name: 'attr-template',
    component: AttrTemplateView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
