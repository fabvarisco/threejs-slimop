export const PLAYER_BASE_SPEED = 9.5;
export const RIVAL_SPEED_FACTOR = 0.84;
export const SLIME_CONSUME_RATIO = 1.05;
export const CITY_DENSITY_MULTIPLIER = 1.4;

export function getSlimeSpeed(_radius, isPlayer) {
  return PLAYER_BASE_SPEED * (isPlayer ? 1 : RIVAL_SPEED_FACTOR);
}

export function canConsumeSlime(predatorRadius, preyRadius) {
  return predatorRadius >= preyRadius * SLIME_CONSUME_RATIO;
}

export function scalePopulation(value) {
  return Math.round(value * CITY_DENSITY_MULTIPLIER);
}
