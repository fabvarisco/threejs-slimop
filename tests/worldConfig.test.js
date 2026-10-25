import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_CONFIG, MAP_PROFILES, getWorldSettings, getWorldLimit, auditWorldBounds } from '../src/world/worldConfig.js';

test('world expansion is 2.0 per side without scaling population budgets by area', () => {
  for (const profile of MAP_PROFILES) {
    const settings = getWorldSettings(profile, 1);
    assert.equal(settings.worldSize / (profile.worldSize + 5), 2.0);
    assert.ok(settings.roadSpacing > profile.roadSpacing);
    assert.equal(settings.roadWidth, profile.roadWidth);
  }
  assert.equal(WORLD_CONFIG.maxStructures, 160);
  assert.equal(WORLD_CONFIG.maxDecor, 200);
});

test('world limits account for slime size and bounds audit rejects invalid spawns', () => {
  assert.equal(getWorldLimit(120, 2), 62.3);
  assert.equal(getWorldLimit(120, 100), 0);
  assert.equal(auditWorldBounds([{ position: { x: 0, z: 0 } }], 120).valid, true);
  assert.equal(auditWorldBounds([{ position: { x: 65, z: 0 } }], 120).valid, false);
  assert.equal(auditWorldBounds([{ position: { x: NaN, z: 0 } }], 120).valid, false);
});
