import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { MeshPhongMaterial, VertexColors, Mesh, Box3, Vector3, sRGBEncoding } from "three";
import { onProgress } from "@/utils/onProgress.js";

export default function loadSTL(context) {
  console.log("Loading STL file...");
  return new Promise((resolve, reject) => {
    const loader = new STLLoader();
    loader.setCrossOrigin("anonymous");

    const blobURLs = [];

    let material = new MeshPhongMaterial({
      color: 0xaaaaaa,
      specular: 0x111111,
      shininess: 200,
    });

    loader.load(
      context.fileURL,
      // called when the resource is loaded
      (geometry) => {
        /**
         * IMPORTANT
         * STL Loader needs to be handled directly, instead of using setContent
         * which means the scene has to be manually reset, resize, adjust etc.
         */

        if (geometry.hasColors) {
          material = new MeshPhongMaterial({
            opacity: geometry.alpha,
            vertexColors: VertexColors,
          });
        }

        const object = new Mesh(geometry, material);
        object.castShadow = true;
        object.receiveShadow = true;

        // console.log('OBJECT')
        // console.log(object)

        const box = new Box3().setFromObject(object);
        const size = box.getSize(new Vector3()).length();
        const center = box.getCenter(new Vector3());

        object.position.x += object.position.x - center.x;
        object.position.y += object.position.y - center.y;
        object.position.z += object.position.z - center.z;

        context.defaultCamera.near = size / 1000; // 100
        context.defaultCamera.far = size * 1000; // 100
        context.defaultCamera.updateProjectionMatrix();
        context.defaultCamera.position.copy(center);
        context.defaultCamera.position.x += size / 2.0;
        context.defaultCamera.position.y += size / 5.0;
        context.defaultCamera.position.z += size / 2.0;
        context.defaultCamera.lookAt(center);

        context.updateLighting();

        context.scene.add(object);

        context.renderer.outputEncoding = sRGBEncoding;
        //context.renderer.gammaInput = true;
        //context.renderer.gammaOutput = true;

        // TODO: disable unnecessary folders from here if possible

        blobURLs.forEach(URL.revokeObjectURL);

        resolve(object);
      },
      onProgress,
      reject
    );
  });
}
