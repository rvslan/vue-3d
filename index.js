import Scene from "./src/components/Scene/Scene.vue";

Scene.install = function(Vue) {
  Vue.component(Scene.name, Scene);
};

export default Scene;