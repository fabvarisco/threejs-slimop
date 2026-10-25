import { defineConfig, devices } from '@playwright/test';

const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 120_000,
  workers: 1,
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 60_000
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions: chromiumExecutable ? { executablePath: chromiumExecutable } : undefined,
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } }
    },
    {
      name: 'crazygames-iframe',
      use: { ...devices['Desktop Chrome'], viewport: { width: 907, height: 510 } }
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], viewport: { width: 412, height: 915 } }
    },
    {
      name: 'mobile-landscape',
      use: { ...devices['Pixel 7'], viewport: { width: 800, height: 450 } }
    }
  ]
});
