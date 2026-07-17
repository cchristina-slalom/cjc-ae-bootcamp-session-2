const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for E2E tests.
 * Uses Chromium only (per testing guidelines).
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.{js,ts}',
  timeout: 30000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `PORT=${process.env.BACKEND_PORT || 3030} npm run start:backend`,
      url: `http://localhost:${process.env.BACKEND_PORT || 3030}`,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: `PORT=${process.env.FRONTEND_PORT || 3000} npm run start:frontend`,
      url: `http://localhost:${process.env.FRONTEND_PORT || 3000}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
