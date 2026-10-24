import { defineConfig } from '@playwright/test';

// Each checkout gets its own default port from its path, so parallel worktrees never reuse each other's dev server (reuseExistingServer below).
const pathHash = [...process.cwd()].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4100 + pathHash % 800);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  // CI retries once so an intermittent failure is reported as flaky; traces keep the evidence either way.
  retries: process.env.CI ? 1 : 0,
  // More local workers time out the long end-to-end flows on 30s; CI keeps Playwright's default.
  workers: process.env.CI ? undefined : 2,
  use: { baseURL, trace: 'retain-on-failure', channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : undefined) },
  webServer: { command: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${port} --strictPort`, url: baseURL, reuseExistingServer: !process.env.CI },
});
