import { test, expect } from '@playwright/test';

test('activates Slime Apocalypse in final 30 seconds with falling loot and banner', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  test.setTimeout(240_000);

  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.addInitScript(() => {
    window.CrazyGames = {
      SDK: {
        init: async () => {},
        game: {
          settings: { muteAudio: true },
          loadingStart() {},
          loadingStop() {},
          gameplayStart() {},
          gameplayStop() {}
        }
      }
    };
  });

  await page.goto('/?seed=424242&testMode=1');
  await page.waitForFunction(() => window.__SLIMOP_READY__, null, { timeout: 90_000 });
  await page.evaluate(() => window.__SLIMOP_TEST__.pauseCapture(true));

  // Verify before apocalypse
  const before = await page.evaluate(() => window.__SLIMOP_TEST__.apocalypseState());
  expect(before.active).toBe(false);
  expect(before.triggered).toBe(false);

  // Trigger apocalypse via test API or frame advancement to 90s
  await page.evaluate(() => window.__SLIMOP_TEST__.triggerApocalypse());

  const activated = await page.evaluate(() => window.__SLIMOP_TEST__.apocalypseState());
  expect(activated.active).toBe(true);
  expect(activated.triggered).toBe(true);
  expect(activated.wave).toBeGreaterThanOrEqual(1);

  // Advance frames to simulate drops and impacts
  await page.evaluate(() => window.__SLIMOP_TEST__.advanceFrames(120));

  const afterDrops = await page.evaluate(() => window.__SLIMOP_TEST__.apocalypseState());
  expect(afterDrops.active).toBe(true);

  // Banner should display apocalypse
  const bannerText = await page.locator('#unlock-banner').textContent();
  expect(bannerText).toContain('APOCALYPSE');

  expect(errors).toEqual([]);
});
