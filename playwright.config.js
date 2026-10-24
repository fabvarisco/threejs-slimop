import { defineConfig, devices } from '@playwright/test';

const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  webServer: {
    command: 'npm run dev -- --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
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
      name: 'mobile',
      use: { ...devices['Pixel 7'], viewport: { width: 412, height: 915 } }
    }
  ]
});
