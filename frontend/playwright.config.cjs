const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
  },
  webServer: {
    // Start the frontend dev server if not running (run from frontend/ as cwd)
    command: 'npm run dev',
    cwd: './frontend',
    port: 5173,
    reuseExistingServer: true,
  },
});