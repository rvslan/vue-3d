import { traverseMaterials } from "../../utils/traverse";

// TODO: Separate output and texture encodings for optimization
// by detecting change in traverseMaterials for material maps

/**
 * Updates encoding-related data, is called in Scene when notified by GUI
 * @param {Object} data object passed from Scene
 * @param {Object} sceneState global scene state managed by VueX
 */
const updateEnconding = (data, sceneState) => {
  const outEncEnum = Number(sceneState.outputEncoding);
  const textEncEnum = Number(sceneState.textureEncoding);

  data.renderer.outputEncoding = outEncEnum;
  traverseMaterials(data.content, (material) => {
    if (material.map) material.map.encoding = textEncEnum;
    if (material.emissiveMap) material.emissiveMap.encoding = textEncEnum;
    // if (material.map || material.emissiveMap) material.needsUpdate = true
    material.needsUpdate = true;
  });
};

export default updateEnconding;
