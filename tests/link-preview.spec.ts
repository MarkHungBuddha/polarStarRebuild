import { test, expect } from './support/fixtures';

test('shared links expose the homepage preview without running JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', '尋找你的北極星');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', '整理你重視的事物，透過具體情境中的取捨，回顧這一次的選擇。北極星是一份自編價值反思工具。');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://northstarmetric.org/link-preview.png');
  await context.close();
});

test('the advertised preview image loads as a 1200 by 630 PNG', async ({ page }) => {
  await page.goto('/');
  const imageUrl = await page.locator('meta[property="og:image"]').getAttribute('content');
  const path = new URL(imageUrl!).pathname;
  const response = await page.request.get(path);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('image/png');
  const size = await page.evaluate(async imagePath => {
    const image = new Image();
    image.src = imagePath;
    await image.decode();
    return [image.naturalWidth, image.naturalHeight];
  }, path);
  expect(size).toEqual([1200, 630]);
});
