<template>
  <div class="home container">
    <h1>Welcome to Playbook Engine</h1>
    <p>Please choose the method you want to provide the processes.</p>
  </div>

  <div class="d-flex flex-equal w-100 my-md-6 ps-md-6">
    <div class="bg-dark me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center text-white overflow-hidden col-md-6">
      <div class="my-3 py-3">
        <h2 class="display-5">Upload JSON File</h2>
        <p class="lead">And an even wittier subheading.</p>
      </div>
      <button to="/FileUpload" class="btn btn-primary my-2"
        >Uplod JSON File
      </button>
      <div class="bg-light shadow-sm mx-auto" style="width: 80%; height: 300px; border-radius: 21px 21px 0 0;"></div>
    </div>
    <div class="bg-light me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center overflow-hidden col-md-6">
      <div class="my-3 p-3">
        <h2 class="display-5">Create Your Process</h2>
        <p class="lead">And an even wittier subheading.</p>
      </div>
      <button @click="openDialog()" class="btn btn-primary my-2"
        >Customize Process
      </button>
      <DialogComp v-model:visible="dialogVisible" modal header="Add Subprocess" :style="{ width: '25rem' }">
        <p style="font-size: 1.15em">Please Choose the Playbook Type:</p>
        <div class="id-name-row mt-3 mb-3" style="align-items: baseline;">
            <!-- <input v-model="subProName" id="subprocess name" class="flex-auto process-name-input form-control" autocomplete="off" /> -->
             <select v-model="type" class="form-select" aria-label="Default select example">
                <option v-for="item in typeList" :key="item" :value="item">{{ item }}</option>
            </select>
        </div>
        <div class="flex gap-2"  style="display: flex; justify-content: flex-end; max-width: 500px;">
            <button type="button" label="Cancel" class="btn btn-primary me-3" @click="{visible2 = false; clearDialog()}">Cancel</button>
            <button type="button" label="Save" class="btn btn-primary me-3" @click="{visible2 = false; customProcess(index)}">Customize Playbook</button>
        </div>
      </DialogComp>
      <div class="bg-dark shadow-sm mx-auto" style="width: 80%; height: 300px; border-radius: 21px 21px 0 0;"></div>
    </div>
  </div>

</template>

<script setup>
import { ref } from 'vue';
import router from '@/router';

const dialogVisible = ref(false);

const type = ref('Text Playbook');
const typeList = ref(['Text Playbook', 'Configurator Playbook']);

const openDialog = () => {
  dialogVisible.value = true;
}

const customProcess = () => {
  localStorage.setItem('type', JSON.stringify(type.value));
  router.push('/proBPMN');
  dialogVisible.value = false;
  type.value = 'Text Playbook';
}

const clearDialog = () => {
  type.value = 'Text Playbook';
}
</script>


<style scoped>
.home {
  text-align: center;
  margin-top: 50px;
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
