<template>
  <div>
    <header class="d-flex flex-wrap justify-content-center py-3 border-bottom">
      <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
        <svg class="bi me-2" width="40" height="32"><use xlink:href="#bootstrap"></use></svg>
        <span class="fs-4">Playbook Engine</span>
      </a>

      <!-- <ul class="nav nav-pills me-4">
        <li class="nav-item"><button @click="saveProcess()" class="btn btn-primary me-3">Save</button></li>
        <li class="nav-item">
          <button @click="triggerFileUpload()" class="btn btn-primary">Import</button>
          <input type="file" ref="fileInput" @change="importProcess" accept=".json" style="display: none;" />
        </li>
      </ul> -->
    </header>
  </div>
</template>
