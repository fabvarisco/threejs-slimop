import test from 'node:test';
import assert from 'node:assert/strict';
import { createLotPositions, findRoadSpawn } from '../src/world/placement.js';

test('all lot counts provide finite x/z coordinates inside their block', () => {
  const block = { x: 15, z: -20, width: 12, depth: 10 };
  for (const count of [1, 2, 3]) {
    for (const value of [0, 0.25, 0.5, 0.99]) {
      const positions = createLotPositions(block, count, () => value);
      assert.equal(positions.length, count);
      for (const position of positions) {
        assert.ok(Number.isFinite(position.x));
        assert.ok(Number.isFinite(position.z));
        assert.ok(Math.abs(position.x - block.x) < block.width / 2);
        assert.ok(Math.abs(position.z - block.z) < block.depth / 2);
      }
    }
  }
});

test('rival spawns choose a free intersection away from buildings and other slimes', () => {
  const spawn = findRoadSpawn([-10, 0, 10], [-10, 0, 10], { x: 1, z: 1 },
    [{ x: 0, z: 0 }], [{ x: 0, z: 10, radius: 2 }]);
  assert.notDeepEqual(spawn, { x: 0, z: 0 });
  assert.notDeepEqual(spawn, { x: 0, z: 10 });
  assert.ok([-10, 0, 10].includes(spawn.x));
  assert.ok([-10, 0, 10].includes(spawn.z));
});
