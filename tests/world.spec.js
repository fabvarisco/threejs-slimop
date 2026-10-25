import { test, expect } from '@playwright/test';

test('expanded world has bounded spawns, connected roads, controlled population and active bots', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  test.setTimeout(240_000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.CrazyGames = { SDK: { init: async () => {}, game: {
      settings: { muteAudio: true }, loadingStart() {}, loadingStop() {}, gameplayStart() {}, gameplayStop() {}
    } } };
  });
  await page.goto('/?seed=424242&testMode=1');
  await page.waitForFunction(() => window.__SLIMOP_READY__, null, { timeout: 90_000 });
  await page.evaluate(() => window.__SLIMOP_TEST__.pauseCapture(true));
  const world = await page.evaluate(() => window.__SLIMOP_TEST__.world());
  console.log('WORLD_METRICS', JSON.stringify(world));
  expect(world.worldSize).toBeGreaterThanOrEqual(160);
  expect(world.worldSize).toBeLessThanOrEqual(175);
  expect(world.bounds.valid).toBe(true);
  expect(world.validation.valid).toBe(true);
  expect(world.slimes).toHaveLength(5);
  for (const rival of world.slimes.slice(1)) {
    expect(world.roads.x).toContain(rival.x);
    expect(world.roads.z).toContain(rival.z);
  }
  expect(world.structures).toBeLessThanOrEqual(160);
  expect(world.decor).toBeLessThanOrEqual(200);
  expect(world.entities).toBeLessThan(740);
  const urban = await page.evaluate(() => window.__SLIMOP_TEST__.urban());
  console.log('URBAN_METRICS', JSON.stringify({ districts: urban.districts, industrialBuildings: urban.industrialBuildings,
    industrialTrucks: urban.industrialTrucks, parkedCars: urban.parkedCars, propsInBuildings: urban.propsInBuildings,
    overlappingProps: urban.overlappingProps, uncoveredBlocks: urban.blocks.filter((block) => block.props === 0).length }));
  expect(Object.values(urban.districts).every((count) => count > 0)).toBe(true);
  expect(urban.industrialBuildings).toBeGreaterThan(0);
  expect(urban.industrialTrucks).toBeGreaterThan(0);
  expect(urban.parkedCars).toBeGreaterThan(0);
  expect(urban.propsInBuildings).toBe(0);
  expect(urban.overlappingProps).toBe(0);
  expect(urban.blocks.every((block) => block.props > 0)).toBe(true);
  for (const streets of [urban.streets.x, urban.streets.z]) {
    expect(new Set(streets.map((street) => street.width)).size).toBeGreaterThan(1);
  }
  for (const roads of [world.roads.x, world.roads.z]) {
    expect(roads).toContain(0);
    for (let index = 1; index < roads.length; index += 1) {
      expect(roads[index]).toBeGreaterThan(roads[index - 1]);
      expect(roads[index] - roads[index - 1]).toBeLessThan(20);
    }
  }
  const bounds = await page.evaluate(() => window.__SLIMOP_TEST__.probeWorldLimits());
  for (const position of bounds.positions) {
    expect(Math.abs(position.x)).toBeCloseTo(bounds.limit);
    expect(Math.abs(position.z)).toBeCloseTo(bounds.limit);
  }
  await page.evaluate(() => window.__SLIMOP_TEST__.advanceFrames(200));
  const later = await page.evaluate(() => window.__SLIMOP_TEST__.world());
  expect(later.slimes.slice(1).some((bot, index) =>
    Math.hypot(bot.x - world.slimes[index + 1].x, bot.z - world.slimes[index + 1].z) > 0.5)).toBe(true);
  for (const bot of later.slimes) {
    expect(Math.abs(bot.x)).toBeLessThanOrEqual(later.bounds.limit);
    expect(Math.abs(bot.z)).toBeLessThanOrEqual(later.bounds.limit);
  }
  expect(await page.evaluate(() => window.__SLIMOP_TEST__.viewDistrict('industrial'))).toBe(true);
  await page.locator('#game-canvas').screenshot({ path: testInfo.outputPath('industrial.png') });
  expect(errors).toEqual([]);
});
