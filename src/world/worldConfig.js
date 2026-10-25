export const WORLD_CONFIG = Object.freeze({
  sizeScale: 2.0,
  streetSpacingScale: 1.35,
  phaseSizeStep: 5,
  minimumStreetSpacing: 8.65,
  edgePadding: 4,
  trafficPadding: 2.5,
  groundPadding: 20,
  maxStructures: 160,
  maxDecor: 200,
  maxTowers: 4
});

export const MAP_PROFILES = Object.freeze([
  Object.freeze({ name: 'centro compacto', worldSize: 76, roadSpacing: 9.75, roadJitter: 0.11,
    roadWidth: 3.1, downtownRadius: 0.2, parkChance: 0.05, commercialBias: 0.15, avenueBias: 0.3 }),
  Object.freeze({ name: 'bairro verde', worldSize: 78, roadSpacing: 9.9, roadJitter: 0.13,
    roadWidth: 3.0, downtownRadius: 0.15, parkChance: 0.09, commercialBias: 0.09, avenueBias: 0.22 }),
  Object.freeze({ name: 'corredores comerciais', worldSize: 80, roadSpacing: 9.6, roadJitter: 0.12,
    roadWidth: 3.25, downtownRadius: 0.17, parkChance: 0.06, commercialBias: 0.13, avenueBias: 0.35 })
]);

export function getWorldSettings(profile, phase = 1) {
  return {
    worldSize: (profile.worldSize + phase * WORLD_CONFIG.phaseSizeStep) * WORLD_CONFIG.sizeScale,
    roadSpacing: Math.max(WORLD_CONFIG.minimumStreetSpacing, profile.roadSpacing - phase * 0.04) * WORLD_CONFIG.streetSpacingScale,
    roadWidth: profile.roadWidth
  };
}

export function getWorldLimit(worldSize, radius = 0) {
  return Math.max(0, worldSize / 2 + WORLD_CONFIG.edgePadding - radius * 0.85);
}

export function auditWorldBounds(items, worldSize) {
  const limit = getWorldLimit(worldSize);
  const invalid = items.filter((item) => {
    const position = item.position ?? item.mesh?.position;
    return !position || !Number.isFinite(position.x) || !Number.isFinite(position.z) ||
      Math.abs(position.x) > limit || Math.abs(position.z) > limit;
  });
  return { valid: invalid.length === 0, outOfBounds: invalid.length, limit };
}
