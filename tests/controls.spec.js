import { test, expect } from '@playwright/test';

test('camera-relative controls, release, combinations, pointer priority and restart', async ({ page }, testInfo) => {
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
  for (const [key, axis, sign] of [
    ['ArrowUp', 1, 1], ['w', 1, 1], ['ArrowDown', 1, -1], ['s', 1, -1],
    ['ArrowLeft', 0, -1], ['a', 0, -1], ['ArrowRight', 0, 1], ['d', 0, 1]
  ]) {
    await page.keyboard.down(key);
    const input = await page.evaluate(() => window.__SLIMOP_TEST__.controls());
    expect(input.projected[axis] * sign).toBeGreaterThan(0);
    const before = await page.evaluate(() => window.__SLIMOP_TEST__.snapshot().player);
    await page.evaluate(() => window.__SLIMOP_TEST__.advanceFrames(3));
    const after = await page.evaluate(() => window.__SLIMOP_TEST__.snapshot().player);
    expect((after.x - before.x) * input.direction[0] + (after.z - before.z) * input.direction[2]).toBeGreaterThan(0);
    await page.keyboard.up(key);
    const stopped = await page.evaluate(() => window.__SLIMOP_TEST__.snapshot().player);
    await page.evaluate(() => window.__SLIMOP_TEST__.advanceFrames(3));
    const released = await page.evaluate(() => window.__SLIMOP_TEST__.snapshot().player);
    expect(released.x).toBe(stopped.x);
    expect(released.z).toBe(stopped.z);
  }
  await page.keyboard.down('w');
  await page.keyboard.down('d');
  const diagonal = await page.evaluate(() => window.__SLIMOP_TEST__.controls());
  expect(Math.hypot(...diagonal.direction)).toBeCloseTo(1);
  expect(diagonal.projected[0]).toBeGreaterThan(0);
  expect(diagonal.projected[1]).toBeGreaterThan(0);
  await page.keyboard.up('d');
  await page.keyboard.down('s');
  expect((await page.evaluate(() => window.__SLIMOP_TEST__.controls())).direction).toEqual([0, 0, 0]);
  await page.keyboard.up('s');
  await page.mouse.move(700, 350);
  await page.mouse.down();
  await page.mouse.move(750, 350);
  const keyboardWins = await page.evaluate(() => window.__SLIMOP_TEST__.controls());
  expect(keyboardWins.projected[1]).toBeGreaterThan(0);
  expect(Math.abs(keyboardWins.projected[0])).toBeLessThan(1e-4);
  await page.mouse.up();
  await page.evaluate(() => window.__SLIMOP_TEST__.expire());
  await page.locator('#state-action').click();
  expect((await page.evaluate(() => window.__SLIMOP_TEST__.controls())).direction).toEqual([0, 0, 0]);
  await page.keyboard.up('w');
  const prevented = await page.evaluate(() => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
    window.dispatchEvent(event);
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
    return event.defaultPrevented;
  });
  expect(prevented).toBe(true);
  await page.keyboard.down('d');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  expect((await page.evaluate(() => window.__SLIMOP_TEST__.controls())).direction).toEqual([0, 0, 0]);
  await page.keyboard.up('d');
  expect(errors).toEqual([]);
});
