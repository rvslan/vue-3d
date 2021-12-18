import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { onProgress } from "@/utils/onProgress.js";

export default function loadOBJ(context) {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.setCrossOrigin("anonymous");

    const blobURLs = [];

    loader.load(
      context.fileURL,
      // called when the resource is loaded
      (object) => {
        context.setContent(object, []);

        blobURLs.forEach(URL.revokeObjectURL);

        resolve(object);
      },
      onProgress,
      reject
    );
  });
}
