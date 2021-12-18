import { LoaderUtils, LoadingManager } from "three";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { onProgress } from "@/utils/onProgress.js";

export default function loadDAE(context) {
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

    const loader = new ColladaLoader(manager);
    loader.setCrossOrigin("anonymous");

    const blobURLs = [];

    loader.load(
      context.fileURL,
      // called when the resource is loaded
      (object) => {
        const scene = object.scene || object.scenes[0];
        const clips = object.animations || [];

        context.setContent(scene, clips);

        blobURLs.forEach(URL.revokeObjectURL);

        resolve(object);
      },
      onProgress,
      reject
    );
  });
}
