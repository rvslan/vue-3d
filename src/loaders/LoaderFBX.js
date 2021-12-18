import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { onProgress } from "@/utils/onProgress.js";

export default function loadFBX(context) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.setCrossOrigin("anonymous");

    const blobURLs = [];

    loader.load(
      context.fileURL,
      (object) => {
        // const scene = object.scene || object.scenes[0]
        const clips = object.animations || [];

        context.setContent(object, clips);

        blobURLs.forEach(URL.revokeObjectURL);

        resolve(object);
      },
      // onProgress
      onProgress,
      // onError
      reject
    );
  });
}
