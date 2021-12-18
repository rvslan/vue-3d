import { traverseMaterials } from "../../utils/traverse";
import {
  SkeletonHelper,
  GridHelper,
  AxesHelper,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
} from "three";

// material: MeshStandardMaterial (has opacity, color, etc)
// TODO: think of ways of controlling wireframes from GUI (e.g. Sketchfab)
const addWireframe = (content, sceneState) => {
  traverseMaterials(content, (material) => {
    // console.dir(material)
    material.wireframe = sceneState.wireframe;
  });
};

const addSkeleton = (content, scene, skeletonHelpers, sceneState) => {
  content.traverse((node) => {
    if (node.isMesh && node.skeleton && sceneState.skeleton) {
      const helper = new SkeletonHelper(node.skeleton.bones[0].parent);
      /* Due to limitations of the OpenGL Core Profile with
          the WebGL renderer on most platforms linewidth will always be 1
          regardless of the set value. */
      // helper.material.linewidth = 5 // still is 1

      scene.add(helper);
      skeletonHelpers.push(helper);
    }
  });
};

/**
 * Updates display-related data, is called in Scene when notified by GUI
 * @param {Object} data object passed from Scene
 * @param {Object} sceneState global scene state managed by VueX
 */
const updateDisplay = (data, sceneState) => {
  // Remove skeleton geometry if present
  if (data.skeletonHelpers.length) {
    data.skeletonHelpers.forEach((helper) => data.scene.remove(helper));
  }

  // Add all wireframe data to the viewer content
  addWireframe(data.content, sceneState);

  // Form the skeleton base and add it to the scene
  addSkeleton(data.content, data.scene, data.skeletonHelpers, sceneState);

  // IMPORTANT!!!
  // Boolean type coercian affects they way Axes Scene appears in the canvas initially
  // (if comparing directly with 'data.axesHelper', we get a black canvas at start)
  if (sceneState.axes !== Boolean(data.axesHelper)) {
    if (sceneState.axes) {
      // addAxesHelper()
      data.axesHelper = new AxesHelper();
      data.axesHelper.renderOrder = 999;
      data.axesHelper.onBeforeRender = (renderer) => renderer.clearDepth();
      data.scene.add(data.axesHelper);
    } else {
      // removeAxesHelper()
      data.scene.remove(data.axesHelper);
      data.axesHelper = null;
      data.axesRenderer.clear();
    }
  }

  if (sceneState.grid !== Boolean(data.gridHelper)) {
    if (sceneState.grid) {
      // addGridHelper()
      data.gridHelper = new GridHelper();
      data.scene.add(data.gridHelper);

      // TODO: (?) add following as an option to GUI
      // data.gridHelper.material.transparent = true
    } else {
      // removeGridHelper()
      data.scene.remove(data.gridHelper);
      data.gridHelper = null;
    }
  }
};

/**
 * Adds helper axes as a separate mini-scene
 * @param {Object} data object passed from Scene
 * @param {HTMLElement} axesElement DOM parent element of axes canvas
 */
const addAxesScene = (data, axesElement) => {
  const { clientWidth, clientHeight } = axesElement;

  data.axesScene = new Scene();
  data.axesCamera = new PerspectiveCamera(50, clientWidth / clientHeight, 0.1, 10);
  data.axesScene.add(data.axesCamera);

  data.axesRenderer = new WebGLRenderer({ alpha: true });
  data.axesRenderer.setPixelRatio(window.devicePixelRatio);
  data.axesRenderer.setSize(clientWidth, clientHeight);

  data.axesCamera.up = data.defaultCamera.up;

  data.axesCorner = new AxesHelper(5);
  data.axesScene.add(data.axesCorner);

  axesElement.appendChild(data.axesRenderer.domElement);
};

export default updateDisplay;

export { addAxesScene };
