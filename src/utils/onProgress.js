const onProgress = (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);

export { onProgress };
