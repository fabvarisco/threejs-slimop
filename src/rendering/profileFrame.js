// Explicit test/debug measurement; never used in the gameplay loop.
export function profileFrame(renderer, scene, camera, roots) {
  const categories = {};
  const callbacks = [];
  for (const [category, objects] of Object.entries(roots)) {
    categories[category] = { meshes: 0, colorCalls: 0, shadowCalls: 0 };
    for (const object of objects) object.traverse((mesh) => {
      if (!mesh.isMesh) return;
      categories[category].meshes += 1;
      const render = mesh.onBeforeRender;
      const shadow = mesh.onBeforeShadow;
      callbacks.push(() => { mesh.onBeforeRender = render; mesh.onBeforeShadow = shadow; });
      mesh.onBeforeRender = function (...args) {
        categories[category].colorCalls += 1;
        render.apply(this, args);
      };
      mesh.onBeforeShadow = function (...args) {
        categories[category].shadowCalls += 1;
        shadow.apply(this, args);
      };
    });
  }
  const autoReset = renderer.info.autoReset;
  try {
    renderer.info.autoReset = false;
    renderer.info.reset();
    const start = performance.now();
    renderer.render(scene, camera);
    return {
      calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      submissionMs: performance.now() - start,
      categories
    };
  } finally {
    renderer.info.autoReset = autoReset;
    callbacks.forEach((restore) => restore());
  }
}
