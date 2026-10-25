import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSUMPTION_TIERS,
  calculateProgressionAudit,
  getTierRequirement,
  getUnlockState,
  radiusFromMass,
  validateCompetitiveProgression
} from '../src/progression.js';

test('consumption tiers have ordered non-overlapping requirements', () => {
  const ordered = ['small', 'vehicle', 'house', 'building', 'tower'];
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = CONSUMPTION_TIERS[ordered[index - 1]];
    const current = CONSUMPTION_TIERS[ordered[index]];
    assert.ok(previous.maxRadius < current.minRadius);
  }
});

test('requirements stay inside the tier range', () => {
  for (const [tier, config] of Object.entries(CONSUMPTION_TIERS)) {
    assert.equal(getTierRequirement(tier, 0), config.minRadius);
    assert.equal(getTierRequirement(tier, 1), config.maxRadius);
  }
});

test('unlock state advances from vehicles through towers', () => {
  assert.equal(getUnlockState(radiusFromMass(5)).tier, 'vehicle');
  assert.equal(getUnlockState(1.8).tier, 'house');
  assert.equal(getUnlockState(2.3).tier, 'building');
  assert.equal(getUnlockState(2.9).tier, 'tower');
  assert.equal(getUnlockState(3.6), null);
});

test('progression audit consumes every ordered tier', () => {
  const items = [
    ...Array.from({ length: 80 }, () => ({ type: 'person', tier: 'small', mass: 1 })),
    ...Array.from({ length: 8 }, () => ({ type: 'vehicle', tier: 'vehicle', mass: 15 })),
    ...Array.from({ length: 5 }, () => ({ type: 'house', tier: 'house', mass: 25 })),
    ...Array.from({ length: 4 }, () => ({ type: 'building', tier: 'building', mass: 45 })),
    { type: 'building', tier: 'tower', mass: 100 }
  ].map((item) => ({ ...item, requiredRadius: getTierRequirement(item.tier, 0.5) }));

  const audit = calculateProgressionAudit(items, 5);
  assert.equal(audit.remaining, 0);
  assert.deepEqual(audit.unlockedTiers, ['small', 'vehicle', 'house', 'building', 'tower']);
});

test('competitive validation rejects an exhausted early-game pool', () => {
  const items = Array.from({ length: 8 }, () => ({
    type: 'person',
    tier: 'small',
    mass: 1,
    requiredRadius: getTierRequirement('small', 0.5)
  }));
  const result = validateCompetitiveProgression(items, [5, 6, 7, 8]);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'insufficient-early-mass');
});

