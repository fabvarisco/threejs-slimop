import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { BOT_PERSONALITIES, evaluateBotUtility, getBotPersonality, updateBotDecision } from '../src/ai/utilityAi.js';

test('bot personalities have distinct tuning attributes', () => {
  assert.ok(BOT_PERSONALITIES.aggressor.aggression > BOT_PERSONALITIES.cautious.aggression);
  assert.ok(BOT_PERSONALITIES.cautious.caution > BOT_PERSONALITIES.aggressor.caution);
  assert.ok(BOT_PERSONALITIES.collector.efficiency > BOT_PERSONALITIES.aggressor.efficiency);
  assert.ok(BOT_PERSONALITIES.explorer.curiosity > BOT_PERSONALITIES.cautious.curiosity);
});

test('getBotPersonality cycles through valid personalities', () => {
  const p0 = getBotPersonality(0);
  const p1 = getBotPersonality(1);
  assert.notEqual(p0.name, p1.name);
  assert.equal(getBotPersonality('aggressor').name, 'Aggressor');
});

test('bot flees from an immediate larger threat', () => {
  const bot = {
    radius: 1.0,
    mesh: { position: new THREE.Vector3(0, 0, 0) },
    ai: { personality: BOT_PERSONALITIES.cautious }
  };
  const threat = {
    alive: true,
    radius: 2.0,
    mesh: { position: new THREE.Vector3(3, 0, 0) }
  };

  const decision = evaluateBotUtility(bot, {
    slimes: [threat],
    items: [],
    canEatItem: () => true
  });

  assert.equal(decision.intent, 'flee');
  assert.ok(decision.direction.x < 0, 'Should move away from threat on positive X');
});

test('aggressor hunts catchable smaller prey over wandering', () => {
  const bot = {
    radius: 2.5,
    mesh: { position: new THREE.Vector3(0, 0, 0) },
    ai: { personality: BOT_PERSONALITIES.aggressor }
  };
  const prey = {
    alive: true,
    radius: 1.0,
    mesh: { position: new THREE.Vector3(4, 0, 0) }
  };

  const decision = evaluateBotUtility(bot, {
    slimes: [prey],
    items: [],
    canEatItem: () => true
  });

  assert.equal(decision.intent, 'hunt');
  assert.ok(decision.direction.x > 0, 'Should move towards prey on positive X');
});

test('collector prioritizes reachable food when safe', () => {
  const bot = {
    radius: 1.0,
    mesh: { position: new THREE.Vector3(0, 0, 0) },
    ai: { personality: BOT_PERSONALITIES.collector }
  };
  const item = {
    active: true,
    mass: 5,
    position: new THREE.Vector3(0, 0, 4)
  };

  const decision = evaluateBotUtility(bot, {
    slimes: [],
    items: [item],
    canEatItem: () => true
  });

  assert.equal(decision.intent, 'collect');
  assert.ok(decision.direction.z > 0, 'Should move towards item on positive Z');
});

test('reaction delay limits evaluations and protected player cannot be hunted', () => {
  const bot = { radius: 3, mesh: { position: new THREE.Vector3() },
    ai: { personality: BOT_PERSONALITIES.aggressor, currentIntent: 'explore' } };
  const player = { alive: true, isPlayer: true, radius: 1,
    mesh: { position: new THREE.Vector3(1, 0, 0) } };
  const context = { slimes: [player], items: [], protectPlayer: true, canEatItem: () => true };
  for (let frame = 0; frame < 10; frame += 1) updateBotDecision(bot, context, 0.01);
  assert.equal(bot.ai.evaluations ?? 0, 0);
  updateBotDecision(bot, context, 0.2);
  assert.equal(bot.ai.evaluations, 1);
  assert.equal(bot.ai.currentIntent, 'explore');
  for (let frame = 0; frame < 10; frame += 1) updateBotDecision(bot, context, 0.01);
  assert.equal(bot.ai.evaluations, 1);
});

test('late match increases hunting utility without changing consumption rules', () => {
  const bot = { radius: 3, mesh: { position: new THREE.Vector3() }, ai: { personality: BOT_PERSONALITIES.aggressor } };
  const prey = { alive: true, radius: 1, mesh: { position: new THREE.Vector3(5, 0, 0) } };
  const context = { slimes: [prey], items: [] };
  assert.ok(evaluateBotUtility(bot, { ...context, matchTimeLeft: 5 }).utilities.hunt >
    evaluateBotUtility(bot, { ...context, matchTimeLeft: 120 }).utilities.hunt);
});

test('a valid collection target is retained during commitment and danger can interrupt it', () => {
  const bot = { radius: 1, mesh: { position: new THREE.Vector3() },
    ai: { personality: BOT_PERSONALITIES.collector, currentIntent: 'explore' } };
  const first = { active: true, mass: 5, position: new THREE.Vector3(3, 0, 0) };
  const second = { active: true, mass: 50, position: new THREE.Vector3(4, 0, 0) };
  const context = { items: [first], slimes: [], canEatItem: () => true };
  updateBotDecision(bot, context, 0.3);
  assert.equal(bot.ai.target, first);
  updateBotDecision(bot, { ...context, items: [first, second] }, 0.3);
  assert.equal(bot.ai.target, first);
  const threat = { alive: true, radius: 3, mesh: { position: new THREE.Vector3(0.1, 0, 0) } };
  updateBotDecision(bot, { ...context, slimes: [threat] }, 0.3);
  assert.equal(bot.ai.currentIntent, 'flee');
  assert.equal(bot.ai.target, threat);
});
