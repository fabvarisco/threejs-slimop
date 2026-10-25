import test from 'node:test';
import assert from 'node:assert/strict';
import { createStreetAxis, describeStreets, streetIntervals, createUrbanBlocks, allocateDecor, circleOverlapsRect, decorKind } from '../src/world/urbanLayout.js';

function random(seed) {
  let value = seed;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}

test('200 layouts retain connected axes, variable blocks, all districts and bounded decor quotas', () => {
  for (let seed = 1; seed <= 200; seed += 1) {
    const rng = random(seed);
    const x = createStreetAxis(rng, 61, 13.1);
    const z = createStreetAxis(rng, 61, 13.1);
    for (const axis of [x, z]) {
      assert.ok(axis.includes(0));
      for (let index = 1; index < axis.length; index += 1) {
        assert.ok(axis[index] - axis[index - 1] >= 9.59);
        assert.ok(axis[index] - axis[index - 1] <= 19.21);
      }
      assert.notDeepEqual(axis, axis.map((value) => -value).reverse());
    }
    const streets = { x: describeStreets(x, 3.1, x.at(-2)), z: describeStreets(z, 3.1, 0) };
    assert.equal(new Set(streets.x.map((street) => street.kind)).size, 3);
    const blocks = createUrbanBlocks(streets, 122, 13.1,
      { x: (seed % 3 - 1) * 25, z: (Math.floor(seed / 3) % 3 - 1) * 25 }, rng);
    assert.equal(new Set(blocks.map((block) => block.district)).size, 5, `seed ${seed}`);
    const widths = blocks.map((block) => block.width);
    assert.ok(Math.max(...widths) - Math.min(...widths) > 2);
    for (const block of blocks) {
      assert.ok(block.width >= 4.4 && block.depth >= 4.4);
      assert.ok(block.minX > -61 && block.maxX < 61 && block.minZ > -61 && block.maxZ < 61);
    }
    assert.ok(blocks.some((block) => block.district === 'industrial' && block.parkingSpots.length));
    const quotas = allocateDecor(blocks, 200);
    assert.equal([...quotas.values()].reduce((a, b) => a + b, 0), 200);
    assert.ok([...quotas.values()].every((count) => count >= 2));
  }
});

test('sidewalk intervals respect actual avenue and secondary widths', () => {
  const streets = [{ coordinate: -10, width: 5 }, { coordinate: 0, width: 2.5 }, { coordinate: 10, width: 3 }];
  const intervals = streetIntervals(streets, 25);
  assert.deepEqual(intervals[1], [-7.3, -1.45]);
  for (const [min, max] of intervals) assert.ok(min < max);
});

test('context selects industrial crates/cones and park trees without creating new asset types', () => {
  assert.equal(decorKind('industrial', 0), 'crate');
  assert.equal(decorKind('industrial', 2), 'cone');
  assert.equal(decorKind('park', 0), 'tree');
  const rect = { minX: 0, maxX: 2, minZ: 0, maxZ: 2 };
  assert.equal(circleOverlapsRect(1, 1, 0.65, rect), true);
  assert.equal(circleOverlapsRect(3, 1, 0.65, rect), false);
});
