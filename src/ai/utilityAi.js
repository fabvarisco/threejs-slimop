import * as THREE from 'three';
import { canConsumeSlime } from '../mechanics.js';
import { MATCH_CONFIG } from '../gameConfig.js';

export const BOT_PERSONALITIES = {
  aggressor: {
    name: 'Aggressor',
    aggression: 1.6,
    caution: 0.8,
    efficiency: 1.0,
    curiosity: 0.8,
    perceptionRadius: 36,
    reactionDelay: 0.25
  },
  collector: {
    name: 'Collector',
    aggression: 0.6,
    caution: 1.0,
    efficiency: 1.6,
    curiosity: 0.9,
    perceptionRadius: 32,
    reactionDelay: 0.3
  },
  cautious: {
    name: 'Cautious',
    aggression: 0.4,
    caution: 1.8,
    efficiency: 1.1,
    curiosity: 0.7,
    perceptionRadius: 38,
    reactionDelay: 0.2
  },
  explorer: {
    name: 'Explorer',
    aggression: 0.9,
    caution: 1.1,
    efficiency: 1.1,
    curiosity: 1.5,
    perceptionRadius: 34,
    reactionDelay: 0.35
  }
};

const PERSONALITY_KEYS = Object.keys(BOT_PERSONALITIES);

export function getBotPersonality(indexOrKey) {
  if (typeof indexOrKey === 'string' && BOT_PERSONALITIES[indexOrKey]) {
    return BOT_PERSONALITIES[indexOrKey];
  }
  const key = PERSONALITY_KEYS[Math.abs(indexOrKey ?? 0) % PERSONALITY_KEYS.length];
  return BOT_PERSONALITIES[key];
}

export function updateBotDecision(bot, context, dt) {
  const ai = bot.ai;
  ai.decisionCooldown = Math.max(0, (ai.decisionCooldown ?? ai.personality.reactionDelay) - dt);
  ai.commitmentLeft = Math.max(0, (ai.commitmentLeft ?? 0) - dt);
  if (!ai.direction) ai.direction = new THREE.Vector3();
  if (ai.decisionCooldown > 0) return ai.direction;
  ai.decisionCooldown = ai.personality.reactionDelay;
  const decision = evaluateBotUtility(bot, context);
  ai.evaluations = (ai.evaluations ?? 0) + 1;
  const targetValid = ai.target && (ai.currentIntent === 'collect'
    ? ai.target.active && context.canEatItem(bot, ai.target)
    : ai.target.alive && !(context.protectPlayer && ai.target.isPlayer) &&
      (ai.currentIntent === 'hunt' ? canConsumeSlime(bot.radius, ai.target.radius) :
        canConsumeSlime(ai.target.radius, bot.radius)));
  if (decision.intent === 'flee' || ai.commitmentLeft <= 0 || !targetValid) {
    if (ai.currentIntent !== decision.intent) ai.intentChanges = (ai.intentChanges ?? 0) + 1;
    ai.currentIntent = decision.intent;
    ai.target = decision.target;
    ai.direction.copy(decision.direction);
    ai.utilities = decision.utilities;
    ai.commitmentLeft = MATCH_CONFIG.botIntentCommitmentSeconds;
  }
  if (ai.target) {
    const position = ai.target.position ?? ai.target.mesh.position;
    ai.direction.subVectors(position, bot.mesh.position).setY(0);
    if (ai.currentIntent === 'flee') ai.direction.negate();
    ai.direction.normalize();
  }
  return ai.direction;
}

export function evaluateBotUtility(bot, { slimes = [], items = [], canEatItem, matchTimeLeft = 120, worldSize = 120, protectPlayer = false, playerRadiusSq = 0 }) {
  const personality = bot.ai?.personality || BOT_PERSONALITIES.collector;
  const botPos = bot.mesh.position;
  const perceptionRadius = personality.perceptionRadius + bot.radius * 1.5;
  const perceptionRadiusSq = perceptionRadius * perceptionRadius;

  let nearestThreat = null;
  let nearestThreatDistSq = Infinity;

  let nearestPrey = null;
  let nearestPreyDistSq = Infinity;

  for (const other of slimes) {
    if (other === bot || !other.alive || (protectPlayer && other.isPlayer)) continue;
    const dx = other.mesh.position.x - botPos.x;
    const dz = other.mesh.position.z - botPos.z;
    const distSq = dx * dx + dz * dz;
    if (distSq > perceptionRadiusSq) continue;

    if (canConsumeSlime(other.radius, bot.radius)) {
      if (distSq < nearestThreatDistSq) {
        nearestThreat = other;
        nearestThreatDistSq = distSq;
      }
    } else if (canConsumeSlime(bot.radius, other.radius)) {
      if (distSq < nearestPreyDistSq) {
        nearestPrey = other;
        nearestPreyDistSq = distSq;
      }
    }
  }

  // 1. Flee evaluation
  let fleeUtility = 0;
  let fleeDir = null;
  if (nearestThreat) {
    const dist = Math.sqrt(nearestThreatDistSq);
    const dangerDist = 12 + bot.radius * 2;
    if (dist < dangerDist) {
      fleeUtility = ((dangerDist - dist) / dangerDist) * 10 * personality.caution;
      fleeDir = new THREE.Vector3(botPos.x - nearestThreat.mesh.position.x, 0, botPos.z - nearestThreat.mesh.position.z);
      if (fleeDir.lengthSq() > 0.0001) fleeDir.normalize();
    }
  }

  // 2. Hunt evaluation
  let huntUtility = 0;
  let huntDir = null;
  if (nearestPrey) {
    const dist = Math.sqrt(nearestPreyDistSq);
    const huntRadius = 14 + bot.radius * 2.2;
    if (dist < huntRadius) {
      const sizeAdvantage = (bot.radius - nearestPrey.radius) / (bot.radius || 1);
      const lateMatch = 1 + 0.5 * (1 - Math.min(1, Math.max(0, matchTimeLeft) / MATCH_CONFIG.durationSeconds));
      huntUtility = (1 - dist / huntRadius) * 5 * personality.aggression * (1 + sizeAdvantage) * lateMatch;
      huntDir = new THREE.Vector3(nearestPrey.mesh.position.x - botPos.x, 0, nearestPrey.mesh.position.z - botPos.z);
      if (huntDir.lengthSq() > 0.0001) huntDir.normalize();
    }
  }

  // 3. Collect evaluation
  let bestItem = null;
  let bestCollectScore = 0;
  let collectDir = null;
  const collectRadiusSq = Math.min(perceptionRadiusSq, 900); // 30 units max

  for (const item of items) {
    if (!item.active) continue;
    if (canEatItem && !canEatItem(bot, item)) continue;
    if (protectPlayer && (item.position.x * item.position.x + item.position.z * item.position.z <= playerRadiusSq)) continue;

    const dx = item.position.x - botPos.x;
    const dz = item.position.z - botPos.z;
    const distSq = dx * dx + dz * dz;
    if (distSq > collectRadiusSq) continue;

    const dist = Math.sqrt(distSq);
    const value = (item.mass || 1) * 2;
    const score = (value / (1 + dist * 0.12)) * personality.efficiency;
    if (score > bestCollectScore) {
      bestCollectScore = score;
      bestItem = item;
    }
  }

  let collectUtility = 0;
  if (bestItem) {
    collectUtility = Math.min(8, bestCollectScore);
    collectDir = new THREE.Vector3(bestItem.position.x - botPos.x, 0, bestItem.position.z - botPos.z);
    if (collectDir.lengthSq() > 0.0001) collectDir.normalize();
  }

  // 4. Explore evaluation
  let exploreUtility = 1.2 * personality.curiosity;
  let exploreDir = bot.ai?.wander ? bot.ai.wander.clone() : new THREE.Vector3(1, 0, 0);

  // Compare utilities
  const utilities = [
    { intent: 'flee', score: fleeUtility, dir: fleeDir, target: nearestThreat },
    { intent: 'hunt', score: huntUtility, dir: huntDir, target: nearestPrey },
    { intent: 'collect', score: collectUtility, dir: collectDir, target: bestItem },
    { intent: 'explore', score: exploreUtility, dir: exploreDir, target: null }
  ];

  utilities.sort((a, b) => b.score - a.score);
  const best = utilities[0];

  return {
    intent: best.intent,
    utility: best.score,
    direction: best.dir || exploreDir,
    target: best.target,
    utilities: {
      flee: fleeUtility,
      hunt: huntUtility,
      collect: collectUtility,
      explore: exploreUtility
    }
  };
}
