import { test, expect } from '@playwright/test';

test('CITY, absorption feedback, responsive HUD and restart', async ({ page }, testInfo) => {
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
  await expect(page.locator('#city-progress')).toHaveAttribute('aria-valuenow', '0');
  await page.evaluate(() => window.__SLIMOP_TEST__.consumeForFeedback('person', 1, true));
  const rival = await page.evaluate(() => window.__SLIMOP_TEST__.feedback());
  expect(rival.city.percentage).toBeGreaterThan(0);
  expect(rival.score).toBe(0);
  expect(rival.groups).toBe(0);
  await page.evaluate(() => {
    window.savedRankRow = document.querySelector('#rank-list > div');
    window.__SLIMOP_TEST__.consumeForFeedback('prop', 1);
  });
  const pickup = await page.evaluate(() => window.__SLIMOP_TEST__.feedback());
  expect(pickup.score).toBeGreaterThan(0);
  await expect(page.locator('#score-value')).toHaveText(`${pickup.score} pts`);
  expect(await page.evaluate(() => window.savedRankRow !== null && document.querySelector('#rank-list > div') === window.savedRankRow)).toBe(true);
  await expect(page.locator('.absorb-feedback:not([hidden])')).toHaveCount(1);
  await expect(page.locator('.absorb-feedback:not([hidden]) span')).toHaveText(`+${pickup.score}`);
  expect(await page.locator('#city-meter').evaluate((node) => parseFloat(node.style.width))).toBeCloseTo(pickup.city.percentage);
  await page.evaluate(() => window.__SLIMOP_TEST__.advanceFeedback(0.1));
  await page.screenshot({ path: testInfo.outputPath('hud-absorption.png'), timeout: 60_000 });
  const hud = await page.locator('.top-left').boundingBox();
  expect(hud.height).toBeLessThan(120);
  expect(hud.x).toBeGreaterThanOrEqual(0);
  expect(hud.x + hud.width).toBeLessThanOrEqual(page.viewportSize().width);
  await page.evaluate(() => window.__SLIMOP_TEST__.consumeForFeedback('prop', 100));
  const burst = await page.evaluate(() => window.__SLIMOP_TEST__.feedback());
  expect(burst.effects).toBeLessThanOrEqual(24);
  expect(burst.groups).toBeLessThanOrEqual(6);
  await expect(page.locator('.absorb-feedback')).toHaveCount(6);
  await page.evaluate(() => window.__SLIMOP_TEST__.advanceFeedback(1));
  const expired = await page.evaluate(() => window.__SLIMOP_TEST__.feedback());
  expect(expired.effects).toBe(0);
  expect(expired.groups).toBe(0);
  await page.evaluate(() => window.__SLIMOP_TEST__.expire());
  await page.locator('#state-action').click();
  const reset = await page.evaluate(() => window.__SLIMOP_TEST__.feedback());
  expect(reset.score).toBe(0);
  expect(reset.city.percentage).toBe(0);
  expect(reset.groups).toBe(0);
  expect(errors).toEqual([]);
});
