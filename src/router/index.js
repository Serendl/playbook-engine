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
  // {
  //   path: '/',
  //   name: 'Home',
  //   component: HomeView
  // },
  {
    path: '/ProDeclare',
    name: 'ProDeclare',
    component: ProDeclareView
  },
  {
    path: '/FileUpload',
    name: 'FileUpload',
    component: FileUploadView
  },
  {
    path: '/ProGenerate',
    name: 'ProGenerate',
    component: ProGenerateView
  },
  {
    path: '/PGview',
    name: 'PGview',
    component: PGView,
  },
  {
    path: '/Process',
    name: 'Process',
    component: ProcessView
  },
  {
    path: '/nodeProcess',
    name: 'nodeProcess',
    component: NodeProcessView
  },
  {
    path: '/proTest',
    name: 'proTest',
    component: ProTestView
  },
  {
    path: '/proTest1',
    name: 'proTest1',
    component: ProTest1View
  },
  {
    path: '/proTest2',
    name: 'proTest2',
    component: ProTest2View
  },
  {
    path: '/proDefine',
    name: 'proDefine',
    component: ProDefineView
  },
  {
    path: '/proDefine1',
    name: 'proDefine1',
    component: ProDefineView1
  },
  {
    path: '/proDefine2',
    name: 'proDefine2',
    component: ProDefineView2
  },
  {
    path: '/proTest3',
    name: 'proTest3',
    component: ProTest3View
  },
  {
    path: '/proDefine3',
    name: 'proDefine3',
    component: ProDefineView3
  },
  {
    path: '/proTest4',
    name: 'proTest4',
    component: ProTest4View
  },
  {
    path: '/proCreator',
    name: 'proCreator',
    component: ProCreator
  },
  {
    path: '/proBPMN',
    name: 'proBPMN',
    component: ProBPMNView
  },
  {
    path: '/Playbook',
    name: 'Playbook',
    component: PlaybookView
  },
  {
    path: '/DefineAttr',
    name: 'DefineAttr',
    component: DefineAttrView
  },
  {
    path: '/ConfiguratorPlaybook',
    name: 'ConfiguratorPlaybook',
    component: ConfiguratorView
  },
  {
    path: '/DefineGateway',
    name: 'DefineGateway',
    component: DefineGatewayView
  },
  {
    path: '/AttrTemplate',
    name: 'AttrTemplate',
    component: AttrTemplateView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
