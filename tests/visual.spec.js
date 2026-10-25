import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const events = [];
    window.__CRAZYGAMES_EVENTS__ = events;
    window.CrazyGames = {
      SDK: {
        init: async () => events.push('init'),
        game: {
          settings: { muteAudio: true },
          addSettingsChangeListener: () => {},
          loadingStart: () => events.push('loadingStart'),
          loadingStop: () => events.push('loadingStop'),
          gameplayStart: () => events.push('gameplayStart'),
          gameplayStop: () => events.push('gameplayStop'),
          setGameContext: (context) => events.push({ context })
        }
      }
    };
  });
});

test('renders the isometric slime city scene', async ({ page }, testInfo) => {
  // Includes cold GLB/shader loading, a high-DPI capture and real input/movement.
  test.setTimeout(240_000);
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  await page.goto('/?seed=424242&testMode=1');
  await page.waitForFunction(() => window.__SLIMOP_READY__ === true, null, {
    timeout: 90_000
  });
  await page.evaluate(() => window.__SLIMOP_TEST__.pauseCapture(true));

  await expect(page.locator('#center-state')).toHaveClass(/hidden/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  const sdkEvents = await page.evaluate(() => window.__CRAZYGAMES_EVENTS__);
  expect(sdkEvents.slice(0, 4)).toEqual(['init', 'loadingStart', 'loadingStop', 'gameplayStart']);
  expect(sdkEvents[4]).toEqual({ context: expect.objectContaining({ phase: '1' }) });

  const cityBefore = await page.evaluate(() => window.__SLIMOP_DEBUG__);
  expect(cityBefore.worldSize).toBeGreaterThanOrEqual(160);
  expect(cityBefore.worldSize).toBeLessThanOrEqual(175);
  expect(cityBefore.worldBoundsAudit.valid).toBe(true);
  expect(cityBefore.mapSeed).toEqual(expect.any(Number));
  expect(cityBefore.mapProfile).toEqual(expect.any(String));
  expect(cityBefore.assetCounts.buildings).toBeGreaterThan(15);
  expect(cityBefore.assetCounts.houses).toBeGreaterThan(10);
  expect(cityBefore.assetCounts.people).toBe(6);
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
  expect(cityBefore.movingItems).toBeGreaterThan(205);
  expect(cityBefore.people).toBeGreaterThanOrEqual(180);
  expect(cityBefore.vehicles).toBeGreaterThanOrEqual(34);
  expect(cityBefore.vehicles).toBeLessThan(50);
  expect(cityBefore.props).toBeGreaterThanOrEqual(100);
  expect(cityBefore.props).toBeLessThanOrEqual(200);
  expect(cityBefore.structures).toBeLessThanOrEqual(160);
  expect(cityBefore.houses).toBeGreaterThan(10);
  expect(cityBefore.structures).toBeGreaterThan(32);
  expect(cityBefore.cityBlocks).toBeGreaterThan(30);
  expect(cityBefore.trafficFacingScore).toBeGreaterThan(0.95);
  expect(cityBefore.eatableTypes).toEqual(expect.arrayContaining(['person', 'prop']));
  expect(cityBefore.lockedTypes).toEqual(expect.arrayContaining(['vehicle', 'building']));
  expect(cityBefore.progressionAudit.remaining).toBe(0);
  expect(cityBefore.progressionValidation.valid).toBe(true);
  await expect(page.locator('#unlock-value')).toContainText('Vehicles:');
  expect(cityBefore.progressionAudit.unlockedTypes).toEqual(
    expect.arrayContaining(['person', 'prop', 'vehicle', 'house', 'building'])
  );

  const canvas = page.locator('#game-canvas');
  await expect(canvas).toBeVisible();
  await page.evaluate(() => window.__SLIMOP_TEST__.pauseCapture(true));
  await canvas.screenshot({
    path: testInfo.outputPath(`slimop-${testInfo.project.name}.png`)
  });
  // Step the real simulation separately from GPU throughput in headless browsers.
  await page.evaluate(() => window.__SLIMOP_TEST__.advanceFrames(60));
  const cityAfter = await page.evaluate(() => window.__SLIMOP_DEBUG__);
  const trafficMoved = Math.hypot(
    cityAfter.trafficSample.x - cityBefore.trafficSample.x,
    cityAfter.trafficSample.z - cityBefore.trafficSample.z
  );
  const pedestrianTravel = cityAfter.pedestrianTravel - cityBefore.pedestrianTravel;
  expect(trafficMoved).toBeGreaterThan(0.6);
  expect(pedestrianTravel).toBeGreaterThan(20);

  const playerBefore = await page.evaluate(() => window.__SLIMOP_TEST__.snapshot().player);
  await page.keyboard.down('d');
  await page.evaluate(() => window.__SLIMOP_TEST__.advanceFrames(30));
  await page.keyboard.up('d');
  const state = await page.evaluate(() => window.__SLIMOP_TEST__.snapshot());
  expect(Math.hypot(state.player.x - playerBefore.x, state.player.z - playerBefore.z)).toBeGreaterThan(0.5);
  expect(state.player.y).toBeCloseTo(0.035);
  expect(state.performance.drawCalls).toBeGreaterThan(0);
  await testInfo.attach('performance', { body: JSON.stringify(state.performance), contentType: 'application/json' });


  const walkthrough = await page.evaluate(() => window.__SLIMOP_TEST__.walkConsumptionProgression());
  expect(walkthrough.consumedTiers).toEqual(['small', 'vehicle', 'house', 'building', 'tower']);
  expect(walkthrough.remaining).toBe(0);
  expect(walkthrough.phaseComplete).toBe(true);
  await expect(page.locator('#state-title')).toHaveText('City cleared!');
  await page.waitForTimeout(500);
  expect(runtimeErrors).toEqual([]);
});

test('restarts timed matches and enforces protected slime combat', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?seed=424242&testMode=1');
  await page.waitForFunction(() => window.__SLIMOP_READY__, null, { timeout: 90_000 });
  await page.evaluate(() => window.__SLIMOP_TEST__.pauseCapture(true));
  for (let round = 0; round < 2; round += 1) {
    await page.evaluate(() => window.__SLIMOP_TEST__.expire());
    await expect(page.locator('#state-title')).toHaveText('Time!');
    await expect(page.locator('#state-detail')).toContainText('points');
    await page.locator('#state-action').click();
    const state = await page.evaluate(() => window.__SLIMOP_TEST__.snapshot());
    expect(state.finished).toBe(false);
    expect(state.running).toBe(true);
    expect(state.elapsed).toBeLessThan(2);
    expect(state.player.score).toBe(0);
    expect(state.hud.currentBannerText).toBe('');
  }
  const protectedCombat = await page.evaluate(() => window.__SLIMOP_TEST__.combat(2, true));
  expect(protectedCombat.rivalAlive).toBe(true);
  const belowThreshold = await page.evaluate(() => window.__SLIMOP_TEST__.combat(1.04));
  expect(belowThreshold.rivalAlive).toBe(true);
  const edible = await page.evaluate(() => window.__SLIMOP_TEST__.combat(1.06));
  expect(edible.rivalAlive).toBe(false);
  expect(edible.score).toBeGreaterThan(0);
  await page.evaluate(() => window.__SLIMOP_TEST__.startPhase(1));
  const eaten = await page.evaluate(() => window.__SLIMOP_TEST__.combat(0.5));
  expect(eaten.playerAlive).toBe(false);
  await expect(page.locator('#state-title')).toHaveText('Eaten!');
  await expect(page.locator('#state-detail')).toContainText('points');
  await page.locator('#state-action').click();
  expect((await page.evaluate(() => window.__SLIMOP_TEST__.snapshot())).finished).toBe(false);
  expect(errors).toEqual([]);
});

test('keeps generated phases solvable with competing rivals', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'crazygames-iframe');
  await page.goto('/?seed=8675309&testMode=1');
  await page.waitForFunction(() => window.__SLIMOP_READY__ === true, null, { timeout: 90_000 });

  for (const phase of [1, 2, 3, 5]) {
    const result = await page.evaluate((value) => window.__SLIMOP_TEST__.startPhase(value), phase);
    expect(result.validation.valid).toBe(true);
    expect(result.towers).toBeGreaterThan(0);
    expect(result.tierCounts.small).toBeGreaterThan(0);
    expect(result.tierCounts.vehicle).toBeGreaterThan(0);
    expect(result.tierCounts.house).toBeGreaterThan(0);
    expect(result.tierCounts.building).toBeGreaterThan(0);
  }
});
