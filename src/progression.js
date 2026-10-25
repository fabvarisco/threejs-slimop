export const MASS_GAIN_FACTOR = 0.74;

export const CONSUMPTION_TIERS = Object.freeze({
  small: Object.freeze({ label: 'Small objects', minRadius: 0.78, maxRadius: 0.98 }),
  vehicle: Object.freeze({ label: 'Vehicles', minRadius: 1.55, maxRadius: 1.72 }),
  house: Object.freeze({ label: 'Houses', minRadius: 2.05, maxRadius: 2.24 }),
  building: Object.freeze({ label: 'Buildings', minRadius: 2.52, maxRadius: 2.82 }),
  tower: Object.freeze({ label: 'Towers', minRadius: 3.18, maxRadius: 3.46 })
});

const TIER_ORDER = Object.freeze(['small', 'vehicle', 'house', 'building', 'tower']);
const UNLOCK_ORDER = Object.freeze(['vehicle', 'house', 'building', 'tower']);

export function radiusFromMass(mass) {
  return 0.68 + Math.sqrt(Math.max(0, mass)) * 0.21;
}

export function massFromRadius(radius) {
  return Math.pow(Math.max(0, radius - 0.68) / 0.21, 2);
}

export function getTierRequirement(tier, sizeFactor = 0.5) {
  const config = CONSUMPTION_TIERS[tier];
  if (!config) throw new Error(`Unknown consumption tier: ${tier}`);
  const factor = Math.min(1, Math.max(0, sizeFactor));
  return config.minRadius + (config.maxRadius - config.minRadius) * factor;
}

export function getItemTier(item) {
  if (item.tier) return item.tier;
  if (item.type === 'person' || item.type === 'prop') return 'small';
  if (item.type === 'vehicle' || item.type === 'house') return item.type;
  if (item.type === 'building') return item.tower ? 'tower' : 'building';
  return null;
}

export function getUnlockState(radius) {
  for (const tier of UNLOCK_ORDER) {
    const target = CONSUMPTION_TIERS[tier];
    if (radius >= target.minRadius) continue;
    const previousTier = TIER_ORDER[TIER_ORDER.indexOf(tier) - 1];
    const startRadius = CONSUMPTION_TIERS[previousTier].minRadius;
    const progress = Math.min(1, Math.max(0, (radius - startRadius) / (target.minRadius - startRadius)));
    return {
      tier,
      label: target.label,
      requiredRadius: target.minRadius,
      progress
    };
  }
  return null;
}

export function calculateProgressionAudit(items, startingMass) {
  let mass = startingMass;
  let radius = radiusFromMass(mass);
  const remaining = items.map((item) => ({
    type: item.type,
    tier: getItemTier(item),
    mass: item.mass,
    requiredRadius: item.requiredRadius ?? getTierRequirement(getItemTier(item))
  }));
  const unlockedTypes = [];
  const unlockedTiers = [];
  let consumed = 0;

  while (remaining.length) {
    const accessible = remaining.filter((item) => radius >= item.requiredRadius);
    if (!accessible.length) break;

    for (const item of accessible) {
      remaining.splice(remaining.indexOf(item), 1);
      mass += item.mass * MASS_GAIN_FACTOR;
      consumed += 1;
      if (!unlockedTypes.includes(item.type)) unlockedTypes.push(item.type);
      if (item.tier && !unlockedTiers.includes(item.tier)) unlockedTiers.push(item.tier);
    }
    radius = radiusFromMass(mass);
  }

  unlockedTiers.sort((a, b) => TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b));
  return {
    consumed,
    remaining: remaining.length,
    finalMass: mass,
    finalRadius: radius,
    nextRequiredRadius: remaining.length ? Math.min(...remaining.map((item) => item.requiredRadius)) : null,
    blockedTypes: [...new Set(remaining.map((item) => item.type))],
    unlockedTypes,
    unlockedTiers
  };
}

export function validateCompetitiveProgression(items, startingMasses) {
  const masses = startingMasses.length ? startingMasses : [0];
  const earlyMass = items
    .filter((item) => getItemTier(item) === 'small')
    .reduce((sum, item) => sum + item.mass, 0);
  const vehicleMass = massFromRadius(CONSUMPTION_TIERS.vehicle.minRadius);
  const requiredEarlyMass = masses.reduce(
    (sum, mass) => sum + Math.max(0, vehicleMass - mass) / MASS_GAIN_FACTOR,
    0
  );

  if (earlyMass < requiredEarlyMass) {
    return { valid: false, reason: 'insufficient-early-mass', earlyMass, requiredEarlyMass };
  }

  const soloAudit = calculateProgressionAudit(items, Math.min(...masses));
  if (soloAudit.remaining > 0) {
    return { valid: false, reason: 'blocked-tier', earlyMass, requiredEarlyMass, soloAudit };
  }

  return { valid: true, reason: null, earlyMass, requiredEarlyMass, soloAudit };
}
