/**
 * Prints an object, traversing through its nodes
 * @param {Object} node traversible node
 */
const traversePrint = (node) => {
  console.group(" <" + node.type + "> " + node.name);
  node.children.forEach((child) => traversePrint(child));
  console.groupEnd();
};

/**
 * Traverses through an object's materials applying specified callback
 * @param {Object} object traversible object
 * @param {Function} callback applied to each node of the object
 */
const traverseMaterials = (object, callback) => {
  object.traverse((node) => {
    if (!node.isMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach(callback);
  });
};

export { traversePrint, traverseMaterials };
