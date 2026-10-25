import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  calculatePlayerRank,
  createHudState,
  detectNearbyThreat,
  updateHudState,
  getCityProgress
} from '../src/ui/hudController.js';

test('calculatePlayerRank returns correct 1-based placement', () => {
  const p1 = { id: 'p', isPlayer: true, mass: 500, score: 100, alive: true };
  const r1 = { id: 'r1', isPlayer: false, mass: 200, score: 200, alive: true };
  const r2 = { id: 'r2', isPlayer: false, mass: 50, score: 50, alive: true };

  assert.equal(calculatePlayerRank(p1, [r1, p1, r2]), 2);
  p1.score = 300;
  assert.equal(calculatePlayerRank(p1, [r1, p1, r2]), 1);
});

test('CITY exposes fractional consumption without changing the mass-based rule', () => {
  assert.equal(getCityProgress(5000, 5000).label, '0%');
  const firstPickup = getCityProgress(5000, 4999);
  assert.ok(firstPickup.percentage > 0 && firstPickup.percentage < 0.1);
  assert.equal(firstPickup.label, '<0.1%');
  assert.equal(getCityProgress(1000, 995).label, '0.5%');
  assert.equal(getCityProgress(1000, 500).label, '50.0%');
  assert.equal(getCityProgress(1000, 0.01).label, '99.9%');
  assert.equal(getCityProgress(1000, 0).label, '100%');
  assert.equal(getCityProgress(1000, 1e-10).label, '100%');
  assert.equal(getCityProgress(0, 0).label, '0%');
  assert.equal(getCityProgress(NaN, 5).label, '0%');
  assert.equal(getCityProgress(100, 200).label, '0%');
});

test('a growth burst announces the highest category crossed and does not repeat', () => {
  const state = createHudState();
  updateHudState(state, 1.2, 0, 0);
  assert.equal(updateHudState(state, 3.6, 1, 0).bannerText, 'Towers unlocked!');
  updateHudState(state, 3.6, 5, 4);
  assert.equal(updateHudState(state, 3.6, 6, 0).bannerText, '');
});

test('detectNearbyThreat identifies larger rival in danger radius', () => {
  const player = {
    alive: true,
    radius: 1.0,
    mesh: { position: new THREE.Vector3(0, 0, 0) }
  };
  const threat = {
    alive: true,
    radius: 2.0,
    mesh: { position: new THREE.Vector3(5, 0, 0) }
  };
  const friend = {
    alive: true,
    radius: 0.5,
    mesh: { position: new THREE.Vector3(2, 0, 0) }
  };

  const alert = detectNearbyThreat(player, [friend, threat], 10);
  assert.ok(alert);
  assert.equal(alert.threat, threat);
  assert.equal(alert.distance, 5);
});

test('updateHudState flags countdown urgency in configured final seconds', () => {
  const hudState = createHudState();
  const normal = updateHudState(hudState, 1.0, 10);
  assert.equal(normal.isUrgent, false);

  const urgent = updateHudState(hudState, 1.0, 110);
  assert.equal(urgent.isUrgent, true);
});

test('unlock banner names the category just unlocked and expires using elapsed time', () => {
  const state = createHudState();
  updateHudState(state, 1.2, 0, 0);
  const unlocked = updateHudState(state, 1.8, 1, 0);
  assert.equal(unlocked.bannerText, 'Vehicles unlocked!');
  assert.equal(updateHudState(state, 1.8, 5, 4).bannerText, '');
  assert.equal(createHudState().currentBannerText, '');
});
