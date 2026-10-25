import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APOCALYPSE_CONFIG,
  getApocalypseWave,
  playApocalypseSiren,
  playImpactThud,
  SlimeApocalypseController
} from '../src/gameplay/slimeApocalypse.js';

test('getApocalypseWave correctly classifies waves across the final 30 seconds', () => {
  assert.equal(getApocalypseWave(35), 0);
  assert.equal(getApocalypseWave(30), 1);
  assert.equal(getApocalypseWave(25), 1);
  assert.equal(getApocalypseWave(21.1), 1);
  assert.equal(getApocalypseWave(20.9), 2);
  assert.equal(getApocalypseWave(15), 2);
  assert.equal(getApocalypseWave(10.1), 2);
  assert.equal(getApocalypseWave(9.9), 3);
  assert.equal(getApocalypseWave(1), 3);
  assert.equal(getApocalypseWave(0), 0);
  assert.equal(getApocalypseWave(-1), 0);
});

test('audio synthesis functions safely handle headless/node environment without crashing', () => {
  assert.doesNotThrow(() => playApocalypseSiren(false));
  assert.doesNotThrow(() => playApocalypseSiren(true));
  assert.doesNotThrow(() => playImpactThud(50, false));
  assert.doesNotThrow(() => playImpactThud(100, true));
});

test('SlimeApocalypseController initializes, tracks hazard zones, and resets cleanly', () => {
  const dummyGame = {
    assets: { props: [], cars: [], houses: [], buildings: [] },
    slimes: [],
    levelGroup: { add() {}, remove() {} },
    worldSize: 162,
    cloneAndFit: () => ({ position: { set() {} }, rotation: { set() {} }, scale: { clone() { return { x: 1, y: 1, z: 1 }; } }, userData: {} }),
    addItem() {}
  };

  const controller = new SlimeApocalypseController(dummyGame);
  assert.equal(controller.active, false);
  assert.equal(controller.triggered, false);

  // Trigger at 30 seconds
  controller.update(0.016, 90.0);
  assert.equal(controller.active, true);
  assert.equal(controller.triggered, true);
  assert.equal(controller.wave, 1);

  // Check wave 2 at 105s (15s remaining)
  controller.update(0.016, 105.0);
  assert.equal(controller.wave, 2);

  // Check wave 3 at 115s (5s remaining)
  controller.update(0.016, 115.0);
  assert.equal(controller.wave, 3);

  // Hazard zones method returns array
  const hazards = controller.getHazardZones();
  assert.ok(Array.isArray(hazards));

  // Reset clears state
  controller.reset();
  assert.equal(controller.active, false);
  assert.equal(controller.triggered, false);
  assert.equal(controller.wave, 0);
  assert.equal(controller.projectiles.length, 0);
});
