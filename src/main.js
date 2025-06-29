import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css';

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Noir from './presets/Noir.js';
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import ToastService from 'primevue/toastservice';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Slider from 'primevue/slider';

import AppState from './plugins/appState.js';

// Quill
// import { QuillEditor } from '@vueup/vue-quill'
// import '@vueup/vue-quill/dist/vue-quill.snow.css'

import Quill from 'quill';
import 'quill/dist/quill.snow.css';

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
app.use(AppState);
app.use(ConfirmationService);
app.use(ToastService);
app.use(DialogService);

app.use(Antd);

app.component('DialogComp', Dialog);
app.component('ButtonComp', Button);
app.component('InputText', InputText);
app.component('SliderComp', Slider);

// app.component('QuillEditor', QuillEditor);
app.component('QuillEditor', Quill);


app.mount('#app')
