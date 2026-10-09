import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  // One stateful journey: run serially in a single worker.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // Generous because the Agent OTP and reset link are entered by hand (see utils/manualInput.ts).
  timeout: 420_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://dmoneyportal.roadtocareer.net',
    viewport: { width: 1366, height: 768 },
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } }],
});
