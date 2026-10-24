import { chromium } from '@playwright/test';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

// Run `node scripts/generate-link-preview.mjs` on Windows with Edge and
// Microsoft JhengHei installed. The checked-in PNG is served as a static asset.
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL ?? 'msedge' });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(new URL('./link-preview.html', import.meta.url).href);
  // This callback runs in the browser page, where document is defined.
  // eslint-disable-next-line no-undef
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: fileURLToPath(new URL('../public/link-preview.png', import.meta.url)) });
} finally {
  await browser.close();
}
