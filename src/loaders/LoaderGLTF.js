import { LoaderUtils, LoadingManager } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { onProgress } from "@/utils/onProgress.js";

export default function loadGLTF(context) {
  // e.g. in dev mode it is always http://localhost:8080/
  const baseURL = LoaderUtils.extractUrlBase(context.fileURL);

  return new Promise((resolve, reject) => {
    const manager = new LoadingManager();

    // Intercept and override relative URLs.
    manager.setURLModifier((url, path) => {
      const normalizedURL = context.rootPath + url.replace(baseURL, "").replace(/^(\.?\/)/, "");

      if (context.fileMap.has(normalizedURL)) {
        const blob = context.fileMap.get(normalizedURL);
        const blobURL = URL.createObjectURL(blob);
        blobURLs.push(blobURL);
        return blobURL;
      }

      // console.log('in scene.load manager URL Modifier, returning:');
      // console.dir((path || '') + url)
      return (path || "") + url;
    });

    // TODO: need to determine which constructor to use here
    // using information caught by Viewer regarding type
    // e.g., loader = determineLoader(type, manager = default)
    const loader = new GLTFLoader(manager);
    loader.setCrossOrigin("anonymous");

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    // const dracoLoader = new DRACOLoader()
    // dracoLoader.setDecoderPath('assets/draco/') // TODO: change
    // loader.setDRACOLoader(dracoLoader)

    const blobURLs = [];

    loader.load(
      context.fileURL,
      // called when the resource is loaded
      (object) => {
        const scene = object.scene || object.scenes[0];
        const clips = object.animations || [];
        // object.animations // Array<THREE.AnimationClip>
        // object.scene // THREE.Scene
        // object.scenes // Array<THREE.Scene>
        // object.cameras // Array<THREE.Camera>
        // object.asset // Object

        context.setContent(scene, clips);

        blobURLs.forEach(URL.revokeObjectURL);

        // See: https://github.com/google/draco/issues/349
        // DRACOLoader.releaseDecoderModule();

        resolve(object);
      },
      onProgress,
      reject
    );
  });
}
