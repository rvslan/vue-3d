import { AmbientLight, DirectionalLight } from "three";

/**
 * Creates lighting to then add to the Scene (default: Ambient and Directional)
 * with values taken from sceneState
 * @param {Array<THREE.Light>} lights Scene's lights
 * @param {Object} sceneState global scene state managed by VueX
 */
const createLighting = (lights, sceneState) => {
  // const lightHemi = new THREE.HemisphereLight();

  const lightAmbient = new AmbientLight(sceneState.ambientColor, sceneState.ambientIntensity);
  lightAmbient.name = "ambient_light";

  const lightDirectional = new DirectionalLight(sceneState.directColor, sceneState.directIntensity);
  lightDirectional.position.set(0.5, 0, 0.866); // appx. 60 degrees
  lightDirectional.name = "directional_light";

  return [lightAmbient, lightDirectional];
};

/**
 * Applies sceneState's lighting values to ambient and directonal lights
 * @param {Array<THREE.Light>} lights Scene's lights
 * @param {Object} sceneState global scene state managed by VueX
 */
const applyLighting = (lights, sceneState) => {
  lights[0].color.setHex(sceneState.ambientColor); // ambient
  lights[0].intensity = sceneState.ambientIntensity;
  lights[1].color.setHex(sceneState.directColor); // directional
  lights[1].intensity = sceneState.directIntensity;
};

/**
 * Removes all of Scene's lights
 * @param {Array<THREE.Light>} lights Scene's lights
 */
const removeLighting = (lights) => {
  lights.forEach((light) => light.parent.remove(light));
  lights.length = 0;
};

/**
 * Updates animation-related data, is called in Scene when notified by GUI
 * @param {Object} data object passed from Scene
 * @param {Object} sceneState global scene state managed by VueX
 */
const updateLighting = (data, sceneState) => {
  const lights = data.lights;

  // Lighting control
  if (!sceneState.disableLighting && !lights.length) {
    const createdLights = createLighting(lights, sceneState);
    data.defaultCamera.add(...createdLights);
    lights.push(...createdLights);
  } else if (sceneState.disableLighting && lights.length) {
    removeLighting(lights);
  }

  // Exposure
  data.renderer.toneMappingExposure = sceneState.exposure;

  // Default lighting
  if (lights.length === 2) {
    applyLighting(lights, sceneState);
  }
};

export default updateLighting;
