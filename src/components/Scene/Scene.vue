<template>
  <section>
    <div id="scene" ref="sceneRef" style="width: 100vw; height: 100vh"></div>
    <div id="axes" ref="axesRef"></div>
  </section>
</template>

<script>
import * as THREE from "three";
import { mapState } from "vuex";
import { toRaw } from "vue";
import { traversePrint } from "@/utils/traverse.js";
import * as loaders from "@/loaders";

import updateDisplay, { addAxesScene } from "./Display.js";
import updateControls from "./Controls.js";
import updateEncoding from "./Encoding.js";
import updateLighting from "./Lighting.js";
import updateAnimation, { setClips, playClips, playAnimations } from "./Animation";

export default {
  name: "Scene",
  props: {
    remoteFileUrl: {
      type: String,
      default: "",
    },
    remoteFileType: {
      type: String,
      default: "",
    },
  },

  computed: {
    ...mapState(["fileURL", "fileType", "sceneState"]),
  },
  data() {
    return {
      defaultCamera: null,
      scene: null,
      renderer: null,
      controls: null,

      content: null,

      // Texture roughness values
      pmremGenerator: null,

      // Lighting
      lights: [],

      // Animation
      clips: null,
      mixer: null,
      animControls: [],
      clock: null,

      // Skeleton
      skeletonHelpers: [],

      // Grid
      gridHelper: null,

      // Axes
      axesHelper: null,
      axesRenderer: null,
      axesCamera: null,
      axesCorner: null,
      axesScene: null,
    };
  },

  methods: {
    reset() {
      this.$refs.sceneRef.innerHTML = "";
      this.$refs.axesRef.innerHTML = "";

      // Viewer resets
      this.clock = new THREE.Clock();
      this.lights = [];
      this.gridHelper = null;
      this.axesHelper = null;
      this.content = null;
    },

    init() {
      const el = this.$refs.sceneRef;

      // Scene
      this.scene = new THREE.Scene();

      const light = new THREE.AmbientLight( 0x404040 ); // soft white light
      this.scene.add( light );

      // Camera
      // const fov = options.preset === Preset.ASSET_GENERATOR ? (0.8 * 180) / Math.PI : 60
      this.defaultCamera = new THREE.PerspectiveCamera(
        60, // fov
        el.clientWidth / el.clientHeight,
        0.01,
        1000
      );

      this.scene.add(toRaw(this.defaultCamera));

      // Change Background Color
      //this.scene.background = new THREE.Color(0x000000);

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.physicallyCorrectLights = true;
      this.renderer.outputEncoding = this.sceneState.outputEncoding;
      this.renderer.setClearColor(0xcccccc);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(el.clientWidth, el.clientHeight);
      this.renderer.shadowMap.enabled = true;

      this.pmremGenerator = new THREE.PMREMGenerator(toRaw(this.renderer));
      this.pmremGenerator.compileEquirectangularShader();

      // Controls
      this.updateControls();
      this.controls.screenSpacePanning = true; // camera pans in screen space
      this.controls.autoRotate = this.sceneState.cameraAutoplay;
      this.controls.autoRotateSpeed = -3;

      el.appendChild(toRaw(this.renderer.domElement));

      this.addAxesScene();

      // Resize resolution workaround
      // this.onWindowResize.bind(null, el),
      window.addEventListener("resize", this.onWindowResize, false);
    },

    animate() {
      requestAnimationFrame(this.animate);

      const delta = this.clock.getDelta();
      if (this.mixer) this.mixer.update(delta);

      this.render(delta);
    },

    render(delta) {
      this.renderer.render(toRaw(this.scene), toRaw(this.defaultCamera));

      // required if controls.enableDamping or controls.autoRotate are set to true
      if (this.controls.enabled) this.controls.update(delta);

      // Adds axisScene
      if (this.sceneState.axes) {
        this.axesCamera.position.copy(this.defaultCamera.position);
        this.axesCamera.lookAt(this.axesScene.position);
        this.axesRenderer.render(toRaw(this.axesScene), toRaw(this.axesCamera));
      }
    },

    onWindowResize() {
      // Main scene resize
      const mainEl = this.$refs.sceneRef;
      this.defaultCamera.aspect = mainEl.clientWidth / mainEl.clientHeight;
      this.defaultCamera.updateProjectionMatrix();
      this.renderer.setSize(mainEl.clientWidth, mainEl.clientHeight);

      // Controls
      if (this.sceneState.fpsControls) {
        this.controls.handleResize();
      }
    },

    /**
     * object = Scene object
     */
    setContent(object, clips) {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      // this.controls.reset()

      object.position.x += object.position.x - center.x;
      object.position.y += object.position.y - center.y;
      object.position.z += object.position.z - center.z;

      // this.controls.maxDistance = size * 10

      this.defaultCamera.near = size / 1000; // 100
      this.defaultCamera.far = size * 1000; // 100
      this.defaultCamera.updateProjectionMatrix();

      this.defaultCamera.position.copy(center);
      this.defaultCamera.position.x += size / 2.0;
      this.defaultCamera.position.y += size / 5.0;
      this.defaultCamera.position.z += size / 2.0;
      this.defaultCamera.lookAt(center);
      // }

      // this.setCamera()

      // AxesHelper
      this.axesCamera.position.copy(this.defaultCamera.position);
      this.axesCamera.lookAt(this.axesScene.position);
      this.axesCamera.near = size / 100;
      this.axesCamera.far = size * 100;
      this.axesCamera.updateProjectionMatrix();
      this.axesCorner.scale.set(size, size, size);

      // this.controls.saveState()
      // object.scale = new THREE.Vector3(100, 100, 100)

      this.scene.add(object);
      this.content = object;

      this.$store.commit("SET", { disableLighting: false });

      this.content.traverse((node) => {
        if (node.isMesh) {
          node.material.depthWrite = !node.material.transparent;
        } else if (node.isLight) {
          this.$store.commit("SET", { disableLighting: true });
        }
      });

      this.updateLighting();
      this.updateEncoding();
      this.updateDisplay();
      this.updateAnimation();

      this.setClips(clips);
      this.resetGUI();

      window.content = toRaw(this.content);
      console.info("THREE.Scene exported as `window.content`");
      // console.dir(this.content)
      traversePrint(toRaw(this.content));
    },

    setClips(clips) {
      setClips(this.$data, clips);
    },

    playClips() {
      playClips(this.$data);
    },

    resetGUI() {
      this.animControls.forEach((ctrl) => ctrl.remove());
      this.animControls.length = 0;

      // Animations playout
      if (this.clips.length) {
        // Play the animations
        playAnimations(this.$data);
      }
    },
    updateAnimation() {
      updateAnimation(this.$data, this.sceneState);
    },
    loadModel() {
      let loaderPromise;

      switch (this.fileType) {
        case "gltf":
          loaderPromise = loaders.loadGLTF(this);
          break;
        case "glb":
          loaderPromise = loaders.loadGLTF(this);
          break;
        case "fbx":
          loaderPromise = loaders.loadFBX(this);
          break;
        case "obj":
          loaderPromise = loaders.loadOBJ(this);
          break;
        case "dae":
          loaderPromise = loaders.loadDAE(this);
          break;
        case "stl":
          loaderPromise = loaders.loadSTL(this);
          break;

        default:
          console.error("Unable to load the model");
          break;
      }

      return loaderPromise;
    },

    addAxesScene() {
      addAxesScene(this.$data, this.$refs.axesRef);
    },

    updateDisplay() {
      updateDisplay(this.$data, this.sceneState);
    },

    updateCamera() {
      this.controls.autoRotate = this.sceneState.cameraAutoplay;
    },

    updateControls() {
      updateControls(this.$data, this.sceneState);
    },

    updateEncoding() {
      updateEncoding(this.$data, this.sceneState);
    },
    updateLighting() {
      updateLighting(this.$data, this.sceneState);
    },
  },

  mounted() {
    // Save fileData to global VueX storage
    this.$store.dispatch("saveFileData", {
      fileURL: this.remoteFileUrl,
      fileType: this.remoteFileType,
    });

    // Initiate the scene
    this.reset();
    this.init();
    this.animate();

    // Same as viewer.load().catch().then()
    this.loadModel()
      // On Error handler (should be same as in Viewer's onError)
      .catch((error) => {
        console.log("in error");
        let message = (error || {}).message || error.toString();
        window.alert(message);
        console.error(error);
      })
      // Then Handler
      .then((object) => {
        console.log(object);

        // Cleanup
        console.log("in cleanup");
        if (typeof this.rootFile === "object") URL.revokeObjectURL(this.fileURL);
      });
  },
};
</script>
