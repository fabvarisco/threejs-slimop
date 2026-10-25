import { test, expect } from '@playwright/test';

test('profiles fixed-seed rendering', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  test.setTimeout(240_000);
  await page.addInitScript(() => {
    window.CrazyGames = { SDK: { init: async () => {}, game: {
      settings: { muteAudio: true }, loadingStart() {}, loadingStop() {},
      gameplayStart() {}, gameplayStop() {}
    } } };
  });
  await page.goto('/?seed=424242&testMode=1&unbatchedTerrain=1');
  await page.waitForFunction(() => window.__SLIMOP_READY__, null, { timeout: 90_000 });
  await page.evaluate(() => window.__SLIMOP_TEST__.pauseCapture(true));
  const profile = await page.evaluate(() => window.__SLIMOP_TEST__.profile());
  console.log('RENDER_PROFILE_BEFORE', JSON.stringify(profile));
  expect(profile.calls).toBeGreaterThan(0);
  await testInfo.attach('render-profile', { body: JSON.stringify(profile), contentType: 'application/json' });
  await page.locator('#game-canvas').screenshot({ path: testInfo.outputPath('before.png') });
  const batch = await page.evaluate(() => window.__SLIMOP_TEST__.batchTerrain());
  const after = await page.evaluate(() => window.__SLIMOP_TEST__.profile());
  console.log('RENDER_PROFILE_AFTER', JSON.stringify({ ...after, batch }));
  expect(batch.removedMeshes).toBeGreaterThan(100);
  expect(after.calls).toBeLessThan(profile.calls * 0.9);
  expect(after.categories.slimes).toEqual(profile.categories.slimes);
  for (const category of ['person', 'vehicle', 'building', 'house', 'prop']) {
    expect(after.categories[category]).toEqual(profile.categories[category]);
  }
  await testInfo.attach('render-profile-after', { body: JSON.stringify(after), contentType: 'application/json' });
  await page.locator('#game-canvas').screenshot({ path: testInfo.outputPath('after.png') });
});
