import { expect, test } from '@playwright/test';

test('renders the isometric slime city scene', async ({ page }, testInfo) => {
  await page.goto('/?seed=424242');
  await page.waitForFunction(() => window.__SLIMOP_READY__ === true, null, {
    timeout: 45_000
  });

  await expect(page.locator('#center-state')).toHaveClass(/hidden/);

  const cityBefore = await page.evaluate(() => window.__SLIMOP_DEBUG__);
  expect(cityBefore.mapSeed).toEqual(expect.any(Number));
  expect(cityBefore.mapProfile).toEqual(expect.any(String));
  expect(cityBefore.assetCounts.buildings).toBeGreaterThan(15);
  expect(cityBefore.assetCounts.houses).toBeGreaterThan(10);
  expect(cityBefore.assetCounts.people).toBeGreaterThan(10);
  expect(cityBefore.assetCounts.props).toBeGreaterThan(5);
  expect(cityBefore.roadCounts.x).toBeGreaterThan(5);
  expect(cityBefore.roadCounts.z).toBeGreaterThan(5);
  expect(cityBefore.trafficRoutes).toBeGreaterThan(20);
  expect(cityBefore.sidewalkRoutes).toBeGreaterThan(90);
  expect(cityBefore.structureOverlaps).toBe(0);
  expect(cityBefore.towers).toBeLessThan(5);
  expect(cityBefore.emptyNearStartBlocks).toBe(0);
  expect(Object.values(cityBefore.districts).reduce((sum, count) => sum + count, 0)).toBe(cityBefore.cityBlocks);
  expect(Object.values(cityBefore.districts).filter((count) => count > 0).length).toBeGreaterThan(1);
  expect(cityBefore.movingItems).toBeGreaterThan(70);
  expect(cityBefore.people).toBeGreaterThan(100);
  expect(cityBefore.vehicles).toBeGreaterThan(20);
  expect(cityBefore.vehicles).toBeLessThan(40);
  expect(cityBefore.houses).toBeGreaterThan(10);
  expect(cityBefore.structures).toBeGreaterThan(32);
  expect(cityBefore.cityBlocks).toBeGreaterThan(30);
  expect(cityBefore.trafficFacingScore).toBeGreaterThan(0.95);
  expect(cityBefore.eatableTypes).toEqual(expect.arrayContaining(['person', 'prop']));
  expect(cityBefore.lockedTypes).toEqual(expect.arrayContaining(['vehicle', 'building']));

  const canvas = page.locator('#game-canvas');
  await expect(canvas).toBeVisible();
  await canvas.screenshot({
    path: testInfo.outputPath(`slimop-${testInfo.project.name}.png`)
  });

  await page.waitForTimeout(700);
  const cityAfter = await page.evaluate(() => window.__SLIMOP_DEBUG__);
  const trafficMoved = Math.hypot(
    cityAfter.trafficSample.x - cityBefore.trafficSample.x,
    cityAfter.trafficSample.z - cityBefore.trafficSample.z
  );
  const pedestrianTravel = cityAfter.pedestrianTravel - cityBefore.pedestrianTravel;
  expect(trafficMoved).toBeGreaterThan(0.6);
  expect(pedestrianTravel).toBeGreaterThan(20);

  const sample = await page.evaluate(() => {
    const canvas = document.querySelector('#game-canvas');
    const probe = document.createElement('canvas');
    probe.width = 96;
    probe.height = 96;
    const ctx = probe.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(canvas, 0, 0, probe.width, probe.height);
    const pixels = ctx.getImageData(0, 0, probe.width, probe.height).data;
    let visiblePixels = 0;
    let colorSpread = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      if (r + g + b > 80) visiblePixels += 1;
      colorSpread += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
    }

    return { visiblePixels, colorSpread };
  });

  expect(sample.visiblePixels).toBeGreaterThan(5_000);
  expect(sample.colorSpread).toBeGreaterThan(160_000);
});
