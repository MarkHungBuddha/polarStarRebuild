import { readFileSync } from 'node:fs';
import type { Download, Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { answerRemainingScenarios, classifyAll, classifyAndRankValues } from './support/experience';
import { callPage, controlImageFonts } from './support/result-image';

/** Width, height and top-left pixel of a downloaded file, read from the PNG bytes themselves. */
async function downloadedImage(page: Page, download: Download) {
  const bytes = readFileSync(await download.path());
  expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const corner = await page.evaluate(async base64 => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
    const canvas = new OffscreenCanvas(1, 1);
    const context = canvas.getContext('2d')!;
    context.drawImage(bitmap, 0, 0);
    return [...context.getImageData(0, 0, 1, 1).data].join(',');
  }, bytes.toString('base64'));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), corner };
}

async function reachResultWithCustomValues(page: Page, words: string[]) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const word of words) {
    await page.getByRole('textbox', { name: '自訂價值' }).fill(word);
    await page.getByRole('button', { name: '新增價值' }).click();
  }
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerRemainingScenarios(page);
  return page.getByRole('region', { name: '分享結果' });
}

test('下載的結果圖是 1080 × 1350 PNG，深色主題重新產生且背景色不同', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerRemainingScenarios(page);
  const share = page.getByRole('region', { name: '分享結果' });
  const button = share.getByRole('button', { name: '下載結果圖' });
  const preview = share.getByRole('img');
  await expect(button).toHaveAttribute('aria-disabled', 'false');
  await expect(preview).toBeVisible();
  const lightSource = await preview.getAttribute('src');
  let downloading = page.waitForEvent('download');
  await button.click();
  const light = await downloadedImage(page, await downloading);
  expect(light).toMatchObject({ width: 1080, height: 1350 });
  expect((await downloading).suggestedFilename()).toMatch(/\.png$/);

  await page.getByRole('button', { name: '深色', exact: true }).click();
  await expect(preview).not.toHaveAttribute('src', lightSource!);
  await expect(button).toHaveAttribute('aria-disabled', 'false');
  downloading = page.waitForEvent('download');
  await button.click();
  const dark = await downloadedImage(page, await downloading);
  expect(dark).toMatchObject({ width: 1080, height: 1350 });
  expect(dark.corner).not.toBe(light.corner);
  await expect(share.getByRole('status')).toHaveText('');
});

test('預覽的 alt 依勾選的自訂價值變化，超過 3 個只列前 3 個', async ({ page }) => {
  const share = await reachResultWithCustomValues(page, ['保有獨處的時間', '這就是我', '早睡', '散步']);
  const group = share.getByRole('group', { name: '也分享自訂價值' });
  const preview = share.getByRole('img');
  await expect(preview).toHaveAttribute('alt', '結果圖預覽：兩份前三名，內容同本頁上方。不含自訂價值。');
  await group.getByLabel('保有獨處的時間').check();
  await group.getByLabel('這就是我', { exact: true }).check();
  await expect(preview).toHaveAttribute('alt', '結果圖預覽：兩份前三名，內容同本頁上方。另含 2 個自訂價值：保有獨處的時間、這就是我。');
  await group.getByLabel('早睡').check();
  await group.getByLabel('散步').check();
  await expect(preview).toHaveAttribute('alt', '結果圖預覽：兩份前三名，內容同本頁上方。另含 4 個自訂價值：保有獨處的時間、這就是我、早睡，另有 1 個。');
  await expect(share.getByRole('status')).toHaveText('');
});

test('準備中按下載只顯示準備句，預覽是隱藏的同比例空白框；換回先前的勾選也要等新圖', async ({ page }) => {
  await controlImageFonts(page);
  await page.addInitScript(() => (window as unknown as { holdImageFonts: () => void }).holdImageFonts());
  const share = await reachResultWithCustomValues(page, ['保有獨處的時間']);
  const button = share.getByRole('button', { name: '下載結果圖' });
  const placeholder = share.locator('[aria-hidden="true"]');
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await expect(share.getByRole('img')).toHaveCount(0);
  const box = await placeholder.boundingBox();
  expect(box!.width / box!.height).toBeCloseTo(1080 / 1350, 2);
  let downloads = 0;
  page.on('download', () => { downloads += 1; });
  await button.focus();
  await button.press('Enter');
  await expect(share.getByRole('status')).toHaveText('正在準備結果圖……');
  expect(downloads).toBe(0);

  await callPage(page, 'releaseImageFonts');
  await expect(button).toHaveAttribute('aria-disabled', 'false');
  await expect(share.getByRole('img')).toBeVisible();
  await expect(share.getByRole('status')).toHaveText('');
  const checkbox = share.getByRole('group', { name: '也分享自訂價值' }).getByLabel('保有獨處的時間');
  await checkbox.check();
  await expect(share.getByRole('img')).toHaveAttribute('alt', /另含 1 個自訂價值/);
  await callPage(page, 'holdImageFonts');
  await checkbox.uncheck();
  await checkbox.check();
  await expect(share.getByRole('img')).toHaveCount(0);
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await callPage(page, 'releaseImageFonts');
  await expect(share.getByRole('img')).toHaveJSProperty('naturalWidth', 1080);
});

test('產生失敗時不顯示預覽，複製結果連結照常可用，再按下載會重新產生', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await controlImageFonts(page);
  await page.addInitScript(() => (window as unknown as { failImageFonts: (value: boolean) => void }).failImageFonts(true));
  const share = await reachResultWithCustomValues(page, []);
  const button = share.getByRole('button', { name: '下載結果圖' });
  await expect(share.getByRole('status')).toHaveText('結果圖沒有產生成功，請再試一次。結果連結仍然可以複製。');
  await expect(share.getByRole('img')).toHaveCount(0);
  await expect(share.locator('[aria-hidden="true"]')).toHaveCount(0);
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await share.getByRole('button', { name: '複製結果連結' }).click();
  await expect(share.getByRole('status')).toHaveText('已複製結果連結。');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await share.getByRole('textbox', { name: '結果連結' }).inputValue());

  await callPage(page, 'failImageFonts', false);
  await callPage(page, 'holdImageFonts');
  await button.press('Enter');
  await expect(share.getByRole('status')).toHaveText('正在準備結果圖……');
  await callPage(page, 'releaseImageFonts');
  await expect(button).toHaveAttribute('aria-disabled', 'false');
  await expect(share.getByRole('img')).toBeVisible();
  await expect(share.getByRole('status')).toHaveText('');
});

test('產生失敗後切換主題，新圖產生成功就悄悄清掉失敗句', async ({ page }) => {
  await controlImageFonts(page);
  await page.addInitScript(() => (window as unknown as { failImageFonts: (value: boolean) => void }).failImageFonts(true));
  const share = await reachResultWithCustomValues(page, []);
  await expect(share.getByRole('status')).toHaveText('結果圖沒有產生成功，請再試一次。結果連結仍然可以複製。');
  await callPage(page, 'failImageFonts', false);
  await page.getByRole('button', { name: '深色', exact: true }).click();
  await expect(share.getByRole('img')).toBeVisible();
  await expect(share.getByRole('status')).toHaveText('');
});
