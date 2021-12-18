<template>
  <div id="app">
    <Scene
      remote-file-type="stl"
      remote-file-url="https://ozeki.hu/attachments/116/Eiffel_tower_sample.STL"
    />
  </div>
</template>

<script>
import Scene from "./components/Scene/Scene.vue";

export default {
  name: "App",
  components: {
    Scene,
  },
};
</script>
