import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Noir from './presets/Noir.js';

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App)
app.use(router)

app.use(PrimeVue, {
  theme: {
      preset: Noir,
      options: {
          prefix: 'p',
          darkModeSelector: '.p-dark',
          cssLayer: false,
      }
  }
});

app.use(Antd);

app.mount('#app')
