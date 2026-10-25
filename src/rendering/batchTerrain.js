import { Mesh } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Only direct, static opaque planes. Consumable entities and transparent sorting
// must remain independent. Bake local transforms, preserving parent coordinates.
export function batchTerrain(root) {
  const buckets = new Map();
  for (const mesh of root.children) {
    if (!mesh.isMesh || mesh.geometry.type !== 'PlaneGeometry' ||
      Array.isArray(mesh.material) || mesh.material.transparent || !mesh.visible) continue;
    const key = `${mesh.material.uuid}:${mesh.castShadow}:${mesh.receiveShadow}:${mesh.renderOrder}:${mesh.layers.mask}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(mesh);
  }
  let sourceMeshes = 0;
  let batchMeshes = 0;
  for (const meshes of buckets.values()) {
    if (meshes.length < 2) continue;
    const geometries = meshes.map((mesh) => {
      mesh.updateMatrix();
      return mesh.geometry.clone().applyMatrix4(mesh.matrix);
    });
    const geometry = mergeGeometries(geometries);
    geometries.forEach((entry) => entry.dispose());
    if (!geometry) continue;
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
    const first = meshes[0];
    const batch = new Mesh(geometry, first.material);
    batch.name = 'Static terrain batch';
    batch.castShadow = first.castShadow;
    batch.receiveShadow = first.receiveShadow;
    batch.renderOrder = first.renderOrder;
    batch.layers.mask = first.layers.mask;
    for (const mesh of meshes) {
      root.remove(mesh);
      mesh.geometry.dispose();
    }
    root.add(batch);
    sourceMeshes += meshes.length;
    batchMeshes += 1;
  }
  return { sourceMeshes, batchMeshes, removedMeshes: sourceMeshes - batchMeshes };
}
