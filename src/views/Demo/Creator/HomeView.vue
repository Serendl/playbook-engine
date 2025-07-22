<template>

  <div class="w-100 my-md-6 ps-md-6 home-background d-flex justify-content-center align-items-center" style="min-height: 100vh;">
    <div class="me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center overflow-hidden col-md-12">
      <div class="p-3">
        <h2 class="display-3" style="color: white; font-style: italic; font-weight: bold;">
          Welcome to Playbook Engine
        </h2>
        <p class="lead" style="color: white;">
          Design your process with clarity and control.
        </p>
      </div>
      <button @click="customProcess()" class="btn btn-outline-light mb-3"
        >Customize Process
      </button>
      <div class="mt-3 mb-5 justify-content-center row">
        <p class="text-white col-md-6" style="font-style: italic;">
          Use our intuitive engine to build and optimize your business process step by step. Click the button below to get started with customization.
        </p>
      </div>
    </div>
  </div>


</template>

<script setup>
import { ref } from 'vue';
import router from '@/router';

const dialogVisible = ref(false);

const customProcess = () => {
  router.push('/proBPMN');
  dialogVisible.value = false;
}

</script>


<style scoped>
.home-background {
  background-image: url('@/assets/home_background.jpg');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
}

h1 {
  font-size: 2em;
  color: #333;
}

p {
  font-size: 1.2em;
  color: #666;
}
</style>
