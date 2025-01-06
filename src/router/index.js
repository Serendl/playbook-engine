import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import FileUploadView from '@/views/FileUploadView.vue'
import ProGenerateView from '@/views/ProGenerateView.vue'
import ProcessView from '@/views/MinizincIntegration/APIProcessView.vue'
import NodeProcessView from '@/views/MinizincIntegration/NodeProcess.vue'
import PGView from '@/views/PGView.vue'
import ProDeclareView from '@/views/NodeNet/ProDeclareView.vue'
import ProTestView from '@/views/NodeNet/ProTestView.vue'
import ProDefineView from '@/views/Configuration/ProDefineView.vue'
import ProDefineView1 from '@/views/Configuration/ProDefineView1.vue'
import ProTest1View from '@/views/Configuration/ProTest1View.vue'
import ProTest2View from '@/views/Configuration/ProTest2View.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
