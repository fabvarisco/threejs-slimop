import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYER_BASE_SPEED,
  RIVAL_SPEED_FACTOR,
  SLIME_CONSUME_RATIO,
  canConsumeSlime,
  getSlimeSpeed
} from '../src/mechanics.js';

test('player movement speed stays constant at every radius', () => {
  assert.equal(getSlimeSpeed(0.8, true), PLAYER_BASE_SPEED);
  assert.equal(getSlimeSpeed(2.5, true), PLAYER_BASE_SPEED);
  assert.equal(getSlimeSpeed(5, true), PLAYER_BASE_SPEED);
});

test('rivals keep a constant relative speed at every radius', () => {
  const expected = PLAYER_BASE_SPEED * RIVAL_SPEED_FACTOR;
  assert.equal(getSlimeSpeed(0.8, false), expected);
  assert.equal(getSlimeSpeed(5, false), expected);
});

test('slime consumption allows eating with a slight size advantage', () => {
  assert.equal(SLIME_CONSUME_RATIO, 1.05);
  assert.equal(canConsumeSlime(1.005, 1), false);
  assert.equal(canConsumeSlime(1.01, 1), false);
  assert.equal(canConsumeSlime(1.05, 1), true);
});
