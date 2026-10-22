import { defineConfig } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4175);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  // CI retries once so an intermittent failure is reported as flaky; traces keep the evidence either way.
  retries: process.env.CI ? 1 : 0,
  use: { baseURL, trace: 'retain-on-failure', channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : undefined) },
  webServer: { command: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${port} --strictPort`, url: baseURL, reuseExistingServer: !process.env.CI },
});
