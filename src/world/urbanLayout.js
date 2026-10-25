const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function createStreetAxis(rng, half, spacing) {
  const roads = [0];
  const minGap = Math.max(9.6, spacing * 0.78);
  for (const sign of [-1, 1]) {
    let distance = 0;
    let index = Math.floor(rng() * 4);
    while (true) {
      const factor = [0.84, 1.24, 0.96, 1.35][index++ % 4];
      distance += clamp(spacing * factor * (0.96 + rng() * 0.08), minGap, 19.2);
      if (distance > half - minGap * 0.55) break;
      roads.push(Number((distance * sign).toFixed(2)));
    }
  }
  return roads.sort((a, b) => a - b);
}

export function describeStreets(coordinates, baseWidth, avenueCoordinate) {
  return coordinates.map((coordinate, index) => {
    const kind = coordinate === avenueCoordinate ? 'avenue' : coordinate === 0 || index % 3 === 0 ? 'primary' : 'secondary';
    const width = baseWidth * (kind === 'avenue' ? 1.45 : kind === 'secondary' ? 0.84 : 1);
    return { coordinate, kind, width };
  });
}

export function streetIntervals(streets, half, padding = 0.2) {
  const intervals = [];
  let start = -half;
  for (const street of streets) {
    const end = street.coordinate - street.width / 2 - padding;
    if (end > start) intervals.push([start, end]);
    start = street.coordinate + street.width / 2 + padding;
  }
  if (start < half) intervals.push([start, half]);
  return intervals;
}

export function createUrbanBlocks(streets, worldSize, spacing, center, rng) {
  const blocks = [];
  for (let xi = 0; xi < streets.x.length - 1; xi += 1) {
    for (let zi = 0; zi < streets.z.length - 1; zi += 1) {
      const minX = streets.x[xi].coordinate + streets.x[xi].width / 2;
      const maxX = streets.x[xi + 1].coordinate - streets.x[xi + 1].width / 2;
      const minZ = streets.z[zi].coordinate + streets.z[zi].width / 2;
      const maxZ = streets.z[zi + 1].coordinate - streets.z[zi + 1].width / 2;
      const width = maxX - minX;
      const depth = maxZ - minZ;
      if (Math.min(width, depth) < 4.4) continue;
      const x = (minX + maxX) / 2;
      const z = (minZ + maxZ) / 2;
      blocks.push({ id: `${xi}:${zi}`, x, z, minX, maxX, minZ, maxZ, width, depth,
        nearStart: Math.hypot(x, z) < spacing * 2.15,
        avenue: [streets.x[xi], streets.x[xi + 1], streets.z[zi], streets.z[zi + 1]].some((street) => street.kind === 'avenue') });
    }
  }
  const corners = [-1, 1].flatMap((x) => [-1, 1].map((z) => ({ x: x * worldSize * 0.32, z: z * worldSize * 0.32 })));
  corners.sort((a, b) => Math.hypot(b.x - center.x, b.z - center.z) - Math.hypot(a.x - center.x, a.z - center.z));
  const industrialCenter = corners[0];
  const outerIndustrial = blocks.filter((block) => Math.min(block.width, block.depth) > 8.5 &&
    Math.hypot(block.x - center.x, block.z - center.z) > worldSize * 0.26 && Math.hypot(block.x, block.z) > worldSize * 0.22);
  const largeIndustrial = outerIndustrial.filter((block) => Math.min(block.width, block.depth) > 10.5);
  const industrialAnchor = [...(largeIndustrial.length ? largeIndustrial : outerIndustrial)].sort((a, b) =>
    Math.hypot(a.x - industrialCenter.x, a.z - industrialCenter.z) - Math.hypot(b.x - industrialCenter.x, b.z - industrialCenter.z))[0] ?? blocks[0];
  const downtownCandidates = blocks.filter((block) => Math.min(block.width, block.depth) > 7.5);
  const downtownAnchor = [...(downtownCandidates.length ? downtownCandidates : blocks)].sort((a, b) =>
    Math.hypot(a.x - center.x, a.z - center.z) - Math.hypot(b.x - center.x, b.z - center.z))[0];
  for (const block of blocks) {
    const industrial = block === industrialAnchor || Math.hypot(block.x - industrialAnchor.x, block.z - industrialAnchor.z) < worldSize * 0.17;
    const downtown = block === downtownAnchor || Math.hypot(block.x - downtownAnchor.x, block.z - downtownAnchor.z) < worldSize * 0.115;
    block.district = block === downtownAnchor ? 'downtown' : industrial ? 'industrial' : downtown ? 'downtown' : block.avenue || rng() < 0.23 ? 'commercial' : 'residential';
  }
  if (!blocks.some((block) => block.district === 'industrial')) {
    [...blocks].sort((a, b) => Math.hypot(a.x - industrialCenter.x, a.z - industrialCenter.z) - Math.hypot(b.x - industrialCenter.x, b.z - industrialCenter.z))[0].district = 'industrial';
  }
  const parkCandidates = blocks.filter((block) => ['residential', 'commercial'].includes(block.district));
  const parks = [];
  for (const target of [{ x: -worldSize * 0.27, z: worldSize * 0.08 }, { x: worldSize * 0.12, z: -worldSize * 0.28 }]) {
    const candidate = [...parkCandidates].filter((block) => !parks.includes(block)).sort((a, b) =>
      Math.hypot(a.x - target.x, a.z - target.z) - Math.hypot(b.x - target.x, b.z - target.z))[0];
    if (candidate) { candidate.district = 'park'; parks.push(candidate); }
  }
  for (const district of ['residential', 'commercial']) {
    if (!blocks.some((block) => block.district === district)) {
      const candidate = blocks.find((block) => !['industrial', 'downtown', 'park'].includes(block.district));
      if (candidate) candidate.district = district;
    }
  }
  for (const block of blocks) {
    block.downtown = block.district === 'downtown';
    block.residential = block.district === 'residential';
    block.layout = block.district === 'industrial' ? 'yard' :
      block.district === 'park' ? 'park' : block.district === 'commercial' && block.depth > 8.5 && rng() < 0.65 ? 'parking' :
        rng() < 0.5 ? 'row' : 'court';
    block.reservedAreas = [];
    block.parkingSpots = [];
    if (['parking', 'yard'].includes(block.layout) && block.depth > 8.5) {
      block.reservedAreas.push({ minX: block.minX + 0.7, maxX: block.maxX - 0.7, minZ: block.minZ + 0.7, maxZ: block.minZ + 3.5 });
      const count = Math.min(3, Math.floor((block.width - 2.4) / 2.8));
      for (let index = 0; index < count; index += 1) {
        block.parkingSpots.push({ x: block.x + (index - (count - 1) / 2) * 2.8, z: block.minZ + 2.1 });
      }
    }
    if (block.layout === 'yard') {
      block.reservedAreas.push({ minX: block.x - 1.3, maxX: block.x + 1.3, minZ: block.minZ + 0.7, maxZ: block.maxZ - 0.7 });
      if (block.depth > 8.5) block.parkingSpots = [-1, 1].map((side) => ({ x: block.x + side * block.width * 0.28, z: block.minZ + 2.1 }));
    }
  }
  return blocks;
}

export function allocateDecor(blocks, budget) {
  const quotas = new Map(blocks.map((block) => [block.id, 0]));
  for (let count = 0; count < budget && blocks.length; count += 1) {
    let selected = blocks[0];
    let best = -Infinity;
    for (const block of blocks) {
      const weight = ({ park: 5, industrial: 3, commercial: 3, residential: 2, downtown: 2 }[block.district]) + Number(block.nearStart) * 2;
      const score = quotas.get(block.id) < 2 ? 100 - quotas.get(block.id) : weight / (quotas.get(block.id) + 1);
      if (score > best) { selected = block; best = score; }
    }
    quotas.set(selected.id, quotas.get(selected.id) + 1);
  }
  return quotas;
}

export function circleOverlapsRect(x, z, radius, rect) {
  return (x - clamp(x, rect.minX, rect.maxX)) ** 2 + (z - clamp(z, rect.minZ, rect.maxZ)) ** 2 < radius ** 2;
}

export function decorKind(district, index) {
  if (district === 'industrial') return index % 3 === 2 ? 'cone' : 'crate';
  if (district === 'park') return index % 4 === 3 ? 'parasol' : 'tree';
  if (district === 'residential') return index % 3 === 0 ? 'tree' : 'cone';
  return index % 3 === 0 ? 'parasol' : 'cone';
}

export function decorCandidate(block, index) {
  const side = Math.floor(index / 3) % 4;
  const offset = (index % 3 - 1) * 1.45;
  if (side === 0) return { x: block.x + offset, z: block.minZ + 0.65 };
  if (side === 1) return { x: block.maxX - 0.65, z: block.z + offset };
  if (side === 2) return { x: block.x + offset, z: block.maxZ - 0.65 };
  return { x: block.minX + 0.65, z: block.z + offset };
}
