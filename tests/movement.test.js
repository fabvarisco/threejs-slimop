import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { advanceMovement, cameraRelativeDirection, keyboardAxes } from '../src/gameplay/movement.js';

for (const cameraPosition of [[0, 20, 20], [20, 24, 20], [-20, 24, 5]]) {
  test(`keyboard directions project correctly for camera ${cameraPosition}`, () => {
    const camera = new PerspectiveCamera(52, 1.5, 0.5, 350);
    camera.position.set(...cameraPosition);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld(true);
    const origin = new Vector3().project(camera);
    for (const [key, xSign, ySign] of [
      ['w', 0, 1], ['arrowup', 0, 1], ['s', 0, -1], ['arrowdown', 0, -1],
      ['a', -1, 0], ['arrowleft', -1, 0], ['d', 1, 0], ['arrowright', 1, 0]
    ]) {
      const axes = keyboardAxes(new Set([key]));
      const direction = cameraRelativeDirection(camera, axes.x, axes.y, new Vector3());
      const projected = direction.clone().project(camera).sub(origin);
      assert.equal(direction.y, 0);
      assert.ok(Math.abs(direction.length() - 1) < 1e-8);
      if (xSign) assert.ok(projected.x * xSign > 0, key);
      else assert.ok(Math.abs(projected.x) < 1e-8, key);
      if (ySign) assert.ok(projected.y * ySign > 0, key);
      else assert.ok(Math.abs(projected.y) < 1e-8, key);
    }
  });
}

test('diagonals are normalized, aliases do not double inputs, opposing keys cancel', () => {
  const camera = new PerspectiveCamera();
  camera.position.set(0, 20, 20);
  camera.lookAt(0, 0, 0);
  for (const keys of [['w', 'd'], ['w', 'a'], ['s', 'd'], ['s', 'a']]) {
    const axes = keyboardAxes(new Set(keys));
    assert.ok(Math.abs(cameraRelativeDirection(camera, axes.x, axes.y, new Vector3()).length() - 1) < 1e-8);
  }
  assert.deepEqual(keyboardAxes(new Set(['w', 'arrowup'])), { x: 0, y: -1 });
  assert.deepEqual(keyboardAxes(new Set(['w', 's', 'a', 'd'])), { x: 0, y: 0 });
  assert.deepEqual(keyboardAxes(new Set()), { x: 0, y: 0 });
});

test('movement distance is independent of frame subdivision and release stops movement', () => {
  const results = [];
  for (const fps of [15, 30, 60, 120]) {
    const position = new Vector3();
    const velocity = new Vector3();
    for (let frame = 0; frame < fps; frame += 1) advanceMovement(position, velocity, new Vector3(1, 0, 0), 9.5, 1 / fps);
    results.push(position.x);
    const before = position.clone();
    advanceMovement(position, velocity, new Vector3(), 9.5, 1 / fps);
    assert.deepEqual(position, before);
    assert.equal(velocity.length(), 0);
  }
  assert.ok(Math.max(...results) - Math.min(...results) < 1e-8);
});
