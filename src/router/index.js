import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import FileUploadView from '@/views/FileUploadView.vue'
import ProGenerateView from '@/views/ProGenerateView.vue'
import ProcessView from '@/views/MinizincIntegration/APIProcessView.vue'
import NodeProcessView from '@/views/MinizincIntegration/NodeProcess.vue'
import PGView from '@/views/PGView.vue'
import ProDeclareView from '@/views/NodeNet/ProDeclareView.vue'
import ProTestView from '@/views/NodeNet/ProTestView.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
