import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  createSlimeFeelState,
  triggerAbsorbPulse,
  updateEatEffectItem,
  updateSlimeFeel,
  getAbsorptionProfile
} from '../src/gameplay/slimeFeel.js';

test('triggerAbsorbPulse increases feel pulse and wobble', () => {
  const slime = { feel: createSlimeFeelState() };
  triggerAbsorbPulse(slime, 1.0);
  assert.equal(slime.feel.pulse, 1.0);
  assert.equal(slime.feel.absorbCount, 1);
  assert.ok(slime.feel.wobble > 1.0);
});

test('absorption profiles give heavy targets more time and less lift without excessive pulses', () => {
  const types = [{ type: 'prop', mass: 1 }, { type: 'vehicle', mass: 15 },
    { type: 'house', mass: 25 }, { type: 'building', mass: 50 }, { type: 'building', tier: 'tower', mass: 100 }];
  const profiles = types.map(getAbsorptionProfile);
  for (let index = 1; index < profiles.length; index += 1) {
    assert.ok(profiles[index].duration > profiles[index - 1].duration);
    assert.ok(profiles[index].pulse >= profiles[index - 1].pulse);
  }
  assert.ok(profiles.at(-1).lift < profiles[1].lift);
  for (const profile of profiles) {
    assert.ok(profile.duration < 1 && profile.pulse <= 1.8);
    const effect = { ...profile, mesh: new THREE.Object3D(), age: 0,
      target: { mesh: { position: new THREE.Vector3(3, 0.035, 3) }, radius: 3 },
      start: new THREE.Vector3(), baseScale: new THREE.Vector3(1, 1, 1) };
    assert.equal(updateEatEffectItem(effect, profile.duration / 2), false);
    assert.ok(effect.mesh.scale.x > 0 && effect.mesh.scale.x < 1);
    assert.ok(Number.isFinite(effect.mesh.position.y));
    assert.equal(updateEatEffectItem(effect, profile.duration), true);
  }
});

test('updateSlimeFeel dampens pulse over time', () => {
  const body = new THREE.Object3D();
  const slime = {
    feel: createSlimeFeelState(),
    velocity: new THREE.Vector3(2, 0, 0),
    mesh: { userData: { body } }
  };
  triggerAbsorbPulse(slime, 1.0);
  const initialPulse = slime.feel.pulse;

  updateSlimeFeel(slime, 0.1);
  assert.ok(slime.feel.pulse < initialPulse, 'Pulse should decay with dt');
  assert.ok(body.scale.y > 0, 'Body scale Y must remain positive');
});

test('updateEatEffectItem scales down and terminates at duration', () => {
  const mesh = new THREE.Object3D();
  const effect = {
    mesh,
    target: { mesh: { position: new THREE.Vector3(10, 0, 10) } },
    start: new THREE.Vector3(0, 0, 0),
    baseScale: new THREE.Vector3(1, 1, 1),
    spin: 1.0,
    age: 0,
    duration: 0.3
  };

  const finishedBefore = updateEatEffectItem(effect, 0.1);
  assert.equal(finishedBefore, false);
  assert.ok(mesh.scale.x < 1.0);

  const finishedAfter = updateEatEffectItem(effect, 0.25);
  assert.equal(finishedAfter, true);
});
