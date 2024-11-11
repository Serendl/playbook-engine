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
      <router-link to="/FileUpload" class="btn btn-primary my-2"
        >Uplod JSON File
      </router-link>
      <!-- <div class="bg-light shadow-sm mx-auto" style="width: 80%; height: 300px; border-radius: 21px 21px 0 0;"></div> -->
    </div>
    <div class="bg-light me-md-3 pt-3 px-3 pt-md-5 px-md-5 text-center overflow-hidden col-md-6">
      <div class="my-3 p-3">
        <h2 class="display-5">Create Your Process</h2>
        <p class="lead">And an even wittier subheading.</p>
      </div>
      <router-link to="/ProGenerate" class="btn btn-primary my-2"
        >Customize Process
      </router-link>
      <!-- <div class="bg-dark shadow-sm mx-auto" style="width: 80%; height: 300px; border-radius: 21px 21px 0 0;"></div> -->
    </div>
  </div>

</template>


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
