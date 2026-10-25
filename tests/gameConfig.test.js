import test from 'node:test';
import assert from 'node:assert/strict';
import { MATCH_CONFIG, getMatchTimeLeft, isMatchTimeExpired } from '../src/gameConfig.js';

test('classic match lasts exactly two minutes', () => {
  assert.equal(MATCH_CONFIG.durationSeconds, 120);
  assert.equal(getMatchTimeLeft(0), 120);
  assert.equal(getMatchTimeLeft(35.5), 84.5);
  assert.equal(getMatchTimeLeft(121), 0);
});

test('match expires only at the configured duration', () => {
  assert.equal(isMatchTimeExpired(119.99), false);
  assert.equal(isMatchTimeExpired(120), true);
});
