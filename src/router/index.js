import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import FileUploadView from '@/views/FileUploadView.vue'
import ProGenerateView from '@/views/ProGenerateView.vue'
import ProcessView from '@/views/ProcessView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
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
    path: '/Process',
    name: 'Process',
    component: ProcessView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
