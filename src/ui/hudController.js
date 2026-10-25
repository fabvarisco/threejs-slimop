import { MATCH_CONFIG, getMatchTimeLeft } from '../gameConfig.js';
import { canConsumeSlime } from '../mechanics.js';
import { CONSUMPTION_TIERS, getUnlockState } from '../progression.js';

const UNLOCK_TIERS = ['vehicle', 'house', 'building', 'tower'];

export function getCityProgress(totalMass, remainingMass) {
  const remaining = remainingMass >= 0 && remainingMass <= totalMass * 1e-9 ? 0 : remainingMass;
  const fraction = Number.isFinite(totalMass) && totalMass > 0 && Number.isFinite(remaining)
    ? Math.min(1, Math.max(0, (totalMass - remaining) / totalMass)) : 0;
  const percentage = fraction * 100;
  const label = fraction === 0 ? '0%' : fraction === 1 ? '100%' :
    percentage < 0.1 ? '<0.1%' : `${Math.min(99.9, Number(percentage.toFixed(1))).toFixed(1)}%`;
  return { fraction, percentage, label };
}

export function setText(element, text) {
  if (element && element.textContent !== text) element.textContent = text;
}

const leaderboardRows = new WeakMap();
export function renderLeaderboard(container, ranked) {
  let rows = leaderboardRows.get(container);
  if (!rows || rows.length !== ranked.length) {
    rows = ranked.map(() => {
      const row = document.createElement('div');
      row.className = 'rank-row';
      row.append(document.createElement('span'), document.createElement('strong'), document.createElement('span'));
      return row;
    });
    container.replaceChildren(...rows);
    leaderboardRows.set(container, rows);
  }
  ranked.forEach((slime, index) => {
    const row = rows[index];
    setText(row.children[0], String(index + 1));
    setText(row.children[1], slime.name);
    setText(row.children[2], String(Math.floor(slime.score)));
    row.classList.toggle('is-player', slime.isPlayer);
  });
}

export function rankSlimes(slimes = []) {
  return [...slimes].sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || String(a.id).localeCompare(String(b.id)));
}

export function calculatePlayerRank(player, slimes = []) {
  if (!player) return 1;
  const activeSlimes = rankSlimes(slimes);
  const index = activeSlimes.findIndex((s) => s.id === player.id || s.isPlayer);
  return index >= 0 ? index + 1 : 1;
}

export function detectNearbyThreat(player, slimes = [], dangerRadius = 14) {
  if (!player || !player.alive) return null;
  const dangerRadiusSq = dangerRadius * dangerRadius;
  let closestThreat = null;
  let closestDistSq = Infinity;

  for (const other of slimes) {
    if (other === player || !other.alive) continue;
    if (!canConsumeSlime(other.radius, player.radius)) continue;

    const dx = other.mesh.position.x - player.mesh.position.x;
    const dz = other.mesh.position.z - player.mesh.position.z;
    const distSq = dx * dx + dz * dz;

    if (distSq < dangerRadiusSq && distSq < closestDistSq) {
      closestThreat = other;
      closestDistSq = distSq;
    }
  }

  if (!closestThreat) return null;
  const dist = Math.sqrt(closestDistSq);
  return {
    threat: closestThreat,
    distance: dist,
    dx: closestThreat.mesh.position.x - player.mesh.position.x,
    dz: closestThreat.mesh.position.z - player.mesh.position.z
  };
}

export function createHudState() {
  return {
    lastTierLabel: null,
    previousRadius: null,
    unlockBannerTimer: 0,
    currentBannerText: ''
  };
}

export function updateHudState(hudState, playerRadius, elapsed, dt = 0.016) {
  const timeLeft = getMatchTimeLeft(elapsed);
  const isUrgent = timeLeft <= MATCH_CONFIG.countdownWarningSeconds && timeLeft > 0;
  const unlock = getUnlockState(playerRadius);

  if (hudState.previousRadius !== null && playerRadius > hudState.previousRadius) {
    let latest = null;
    for (const tier of UNLOCK_TIERS) {
      const config = CONSUMPTION_TIERS[tier];
      if (hudState.previousRadius < config.minRadius && playerRadius >= config.minRadius) latest = config;
    }
    if (latest) {
      hudState.currentBannerText = `${latest.label} unlocked!`;
      hudState.unlockBannerTimer = MATCH_CONFIG.unlockBannerSeconds;
    }
  }
  hudState.previousRadius = playerRadius;
  hudState.lastTierLabel = unlock?.label ?? null;

  if (hudState.unlockBannerTimer > 0) {
    hudState.unlockBannerTimer = Math.max(0, hudState.unlockBannerTimer - dt);
    if (hudState.unlockBannerTimer === 0) {
      hudState.currentBannerText = '';
    }
  }

  return {
    timeLeft,
    isUrgent,
    unlock,
    bannerText: hudState.currentBannerText
  };
}
