export function createLotPositions(block, count, rng) {
  const range = (min, max) => min + rng() * (max - min);
  if (['parking', 'yard'].includes(block.layout)) {
    return Array.from({ length: Math.min(count, 2) }, (_, index) => ({
      x: block.x + (count === 1 ? 1 : index === 0 ? -1 : 1) * block.width * 0.24,
      z: block.z + block.depth * 0.19
    }));
  }
  if (block.layout === 'row' && count > 1) {
    const alongX = block.width >= block.depth;
    const side = rng() < 0.5 ? -1 : 1;
    return Array.from({ length: count }, (_, index) => ({
      x: block.x + (alongX ? (index / (count - 1) - 0.5) * block.width * 0.6 : side * block.width * 0.18),
      z: block.z + (alongX ? side * block.depth * 0.18 : (index / (count - 1) - 0.5) * block.depth * 0.6)
    }));
  }
  if (count <= 1) return [{
    x: block.x + range(-block.width * 0.08, block.width * 0.08),
    z: block.z + range(-block.depth * 0.08, block.depth * 0.08)
  }];
  if (count === 2) {
    const xOffset = block.width * range(0.18, 0.24);
    const zOffset = block.depth * range(0.15, 0.22);
    const flip = rng() > 0.5 ? 1 : -1;
    return [
      { x: block.x - xOffset, z: block.z - zOffset * flip },
      { x: block.x + xOffset, z: block.z + zOffset * flip }
    ];
  }
  return [
    { x: block.x - block.width * 0.22, z: block.z - block.depth * 0.2 },
    { x: block.x + block.width * 0.22, z: block.z - block.depth * 0.2 },
    { x: block.x, z: block.z + block.depth * 0.2 }
  ].slice(0, count);
}

export function findRoadSpawn(xRoads, zRoads, desired, occupied, footprints, radius = 1.6) {
  let best = null;
  let bestDistance = Infinity;
  for (const x of xRoads) for (const z of zRoads) {
    if (occupied.some((other) => Math.hypot(x - other.x, z - other.z) < radius * 2 + 1.5)) continue;
    if (footprints.some((other) => Math.hypot(x - other.x, z - other.z) < radius + other.radius + 0.3)) continue;
    const distance = (desired.x - x) ** 2 + (desired.z - z) ** 2;
    if (distance < bestDistance) { best = { x, z }; bestDistance = distance; }
  }
  if (!best) throw new Error('No safe road intersection available for slime spawn');
  return best;
}
