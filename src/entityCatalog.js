import { CONSUMPTION_TIERS, getTierRequirement } from './progression.js';

export const ENTITY_CATALOG = Object.freeze({
  person: Object.freeze({ type: 'person', tier: 'small', label: 'Pedestrian', scoreFactor: 10 }),
  prop: Object.freeze({ type: 'prop', tier: 'small', label: 'Street object', scoreFactor: 10 }),
  vehicle: Object.freeze({ type: 'vehicle', tier: 'vehicle', label: 'Vehicle', scoreFactor: 14 }),
  house: Object.freeze({ type: 'house', tier: 'house', label: 'House', scoreFactor: 18 }),
  building: Object.freeze({ type: 'building', tier: 'building', label: 'Building', scoreFactor: 24 }),
  tower: Object.freeze({ type: 'building', tier: 'tower', label: 'Tower', scoreFactor: 32 })
});

export function getEntityDefinition(catalogId) {
  const definition = ENTITY_CATALOG[catalogId];
  if (!definition) throw new Error(`Unknown entity catalog id: ${catalogId}`);
  return definition;
}

export function createEntityStats(catalogId, sizeFactor = 0.5) {
  const definition = getEntityDefinition(catalogId);
  const normalizedSize = Math.min(1, Math.max(0, sizeFactor));
  return {
    catalogId,
    type: definition.type,
    tier: definition.tier,
    scoreFactor: definition.scoreFactor,
    requiredRadius: getTierRequirement(definition.tier, normalizedSize)
  };
}

export function calculateItemScore(item) {
  const definition = getEntityDefinition(item.catalogId ?? (item.tier === 'tower' ? 'tower' : item.type));
  return Math.max(1, Math.round(item.mass * definition.scoreFactor));
}

export function validateEntityCatalog() {
  const errors = [];
  const ids = Object.keys(ENTITY_CATALOG);

  for (const id of ids) {
    const definition = ENTITY_CATALOG[id];
    if (!definition.type) errors.push(`${id}: missing type`);
    if (!CONSUMPTION_TIERS[definition.tier]) errors.push(`${id}: unknown tier ${definition.tier}`);
    if (!Number.isFinite(definition.scoreFactor) || definition.scoreFactor <= 0) {
      errors.push(`${id}: invalid scoreFactor`);
    }
  }

  return { valid: errors.length === 0, errors, count: ids.length };
}
