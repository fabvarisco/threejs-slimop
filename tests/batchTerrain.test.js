import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, Mesh, MeshStandardMaterial, PlaneGeometry, BoxGeometry, Vector3 } from 'three';
import { batchTerrain } from '../src/rendering/batchTerrain.js';

test('terrain batching preserves material, transforms, triangles and shadow flags', () => {
  const root = new Group();
  const material = new MeshStandardMaterial();
  for (const x of [-4, 4]) {
    const plane = new Mesh(new PlaneGeometry(2, 3), material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(x, 0.03, 0);
    plane.receiveShadow = true;
    root.add(plane);
  }
  const stats = batchTerrain(root);
  assert.deepEqual(stats, { sourceMeshes: 2, batchMeshes: 1, removedMeshes: 1 });
  const batch = root.children[0];
  assert.equal(batch.material, material);
  assert.equal(batch.geometry.index.count, 12);
  assert.equal(batch.receiveShadow, true);
  assert.equal(batch.castShadow, false);
  const size = batch.geometry.boundingBox.getSize(new Vector3());
  assert.ok(Math.abs(size.x - 10) < 1e-5);
  assert.ok(Math.abs(size.z - 3) < 1e-5);
  assert.ok(Math.abs(batch.geometry.boundingBox.min.y - 0.03) < 1e-5);
  assert.equal(batchTerrain(root).removedMeshes, 0);
});

test('transparent surfaces, nested entities and different materials remain separate', () => {
  const root = new Group();
  const transparent = new MeshStandardMaterial({ transparent: true, opacity: 0.5 });
  root.add(new Mesh(new PlaneGeometry(), transparent), new Mesh(new PlaneGeometry(), transparent));
  root.add(new Mesh(new PlaneGeometry(), new MeshStandardMaterial()));
  root.add(new Mesh(new PlaneGeometry(), new MeshStandardMaterial()));
  root.add(new Mesh(new BoxGeometry(), new MeshStandardMaterial()));
  const entity = new Group();
  entity.add(new Mesh(new PlaneGeometry(), transparent));
  root.add(entity);
  assert.equal(batchTerrain(root).removedMeshes, 0);
  assert.equal(root.children.length, 6);
});
