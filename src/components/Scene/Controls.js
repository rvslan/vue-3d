import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";

/**
 * Updates controls-related data, is called in Scene when notified by GUI
 * @param {Object} data object passed from Scene
 * @param {Object} sceneState global scene state managed by VueX
 */
const updateControls = (data, sceneState) => {
  if (data.controls) data.controls.dispose();

  if (sceneState.fpsControls) {
    data.controls = new FirstPersonControls(data.defaultCamera, data.renderer.domElement);
    data.controls.movementSpeed = 10;
    data.controls.lookSpeed = 0.1;
  } else {
    data.controls = new OrbitControls(data.defaultCamera, data.renderer.domElement);
  }
};

export default updateControls;
