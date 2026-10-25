import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ENTITY_CATALOG,
  calculateItemScore,
  createEntityStats,
  validateEntityCatalog
} from '../src/entityCatalog.js';

test('entity catalog covers every launch consumption tier', () => {
  const validation = validateEntityCatalog();
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
  assert.deepEqual(
    [...new Set(Object.values(ENTITY_CATALOG).map((entry) => entry.tier))],
    ['small', 'vehicle', 'house', 'building', 'tower']
  );
});

test('entity stats normalize dynamic sizes inside their tier', () => {
  const smallestVehicle = createEntityStats('vehicle', -1);
  const largestVehicle = createEntityStats('vehicle', 2);
  assert.equal(smallestVehicle.type, 'vehicle');
  assert.equal(smallestVehicle.tier, 'vehicle');
  assert.ok(largestVehicle.requiredRadius > smallestVehicle.requiredRadius);
});

test('entity scores use catalog rules instead of duplicated spawn logic', () => {
  assert.equal(calculateItemScore({ catalogId: 'person', mass: 1 }), 10);
  assert.equal(calculateItemScore({ catalogId: 'tower', mass: 10 }), 320);
});
