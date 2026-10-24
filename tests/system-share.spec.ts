import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { answerRemainingScenarios, classifyAndRankValues } from './support/experience';
import { callPage, controlImageFonts } from './support/result-image';

type ShareEnvironment = 'supported' | 'no-share' | 'no-can-share' | 'files-unsupported';
type ShareCall = { title?: string; text?: string; url?: string; files: number; name?: string; type?: string; signature?: number[]; width?: number; height?: number; activated: boolean };

/**
 * Replaces the browser's native Web Share API before the page loads. `navigator.share` records what it was given
 * (decoding the file itself) and settles as the test decides: resolve, reject with a DOMException name, or stay pending.
 */
async function fakeShare(page: Page, environment: ShareEnvironment) {
  await page.addInitScript(environment => {
    const calls: unknown[] = [];
    let outcome = 'resolve'; let settle = () => {};
    Object.assign(window, {
      shareCalls: calls,
      shareOutcome: (value: string) => { outcome = value; },
      settleShare: () => settle(),
    });
    const proto = Navigator.prototype as unknown as Record<string, unknown>;
    delete proto.share; delete proto.canShare;
    if (environment === 'no-share') return;
    Object.defineProperty(proto, 'share', { configurable: true, writable: true, value: async (data: ShareData) => {
      const file = data.files?.[0];
      const call: Record<string, unknown> = { title: data.title, text: data.text, url: data.url, files: data.files?.length ?? 0, name: file?.name, type: file?.type, activated: navigator.userActivation.isActive };
      calls.push(call);
      if (file) {
        call.signature = [...new Uint8Array(await file.slice(0, 8).arrayBuffer())];
        const bitmap = await createImageBitmap(file);
        call.width = bitmap.width; call.height = bitmap.height;
      }
      if (outcome === 'hold') await new Promise<void>(resolve => { settle = resolve; });
      else if (outcome !== 'resolve') throw new DOMException('share did not complete', outcome);
    } });
    if (environment === 'no-can-share') return;
    Object.defineProperty(proto, 'canShare', { configurable: true, writable: true, value: (data: ShareData) => environment === 'supported' || !data.files?.length });
  }, environment);
}
const shareCalls = (page: Page) => page.evaluate(() => (window as unknown as { shareCalls: ShareCall[] }).shareCalls);

async function reachShare(page: Page) {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerRemainingScenarios(page);
  return page.getByRole('region', { name: '分享結果' });
}

test('分享結果把 1080 × 1350 PNG、標題、內文和結果連結交給系統分享選單，焦點留在按鈕上', async ({ page }) => {
  await fakeShare(page, 'supported');
  const share = await reachShare(page);
  const button = share.getByRole('button', { name: '分享結果' });
  await expect(button).toHaveAttribute('aria-disabled', 'false');
  await button.click();
  await expect.poll(() => shareCalls(page)).toHaveLength(1);
  await expect.poll(async () => (await shareCalls(page))[0].height).toBe(1350);
  const [call] = await shareCalls(page);
  expect(call).toMatchObject({
    title: '北極星 · 我的選擇',
    text: '這是我在北極星的兩份前三名。',
    url: await share.getByRole('textbox', { name: '結果連結' }).inputValue(),
    files: 1, type: 'image/png', width: 1080, height: 1350, activated: true,
    signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  });
  await expect(button).toBeFocused();
  await expect(share.getByRole('status')).toHaveText('');
});

const fallback = '這個瀏覽器無法直接分享圖片。請先下載結果圖，再複製結果連結一起貼出。';

for (const environment of ['no-share', 'no-can-share', 'files-unsupported'] as const) {
  test(`無法帶圖片分享（${environment}）時顯示退回提示，下載和複製照常可用`, async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await fakeShare(page, environment);
    const share = await reachShare(page);
    const button = share.getByRole('button', { name: '分享結果' });
    await expect(button).toHaveAttribute('aria-disabled', 'false');
    await button.click();
    await expect(share.getByRole('status')).toHaveText(fallback);
    expect(await shareCalls(page)).toHaveLength(0);
    await expect(button).toBeFocused();

    const downloading = page.waitForEvent('download');
    await share.getByRole('button', { name: '下載結果圖' }).click();
    expect((await downloading).suggestedFilename()).toMatch(/\.png$/);
    await share.getByRole('button', { name: '複製結果連結' }).click();
    await expect(share.getByRole('status')).toHaveText('已複製結果連結。');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await share.getByRole('textbox', { name: '結果連結' }).inputValue());
  });
}

const shareOutcome = (page: Page, outcome: 'resolve' | 'hold' | 'AbortError' | 'NotAllowedError') =>
  page.evaluate(outcome => (window as unknown as { shareOutcome: (value: string) => void }).shareOutcome(outcome), outcome);

test('使用者取消系統分享時不顯示訊息，先前的回饋也清掉，焦點不移走', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await fakeShare(page, 'supported');
  const share = await reachShare(page);
  await share.getByRole('button', { name: '複製結果連結' }).click();
  await expect(share.getByRole('status')).toHaveText('已複製結果連結。');
  await shareOutcome(page, 'AbortError');
  const button = share.getByRole('button', { name: '分享結果' });
  await button.click();
  await expect.poll(() => shareCalls(page)).toHaveLength(1);
  await expect.poll(async () => (await shareCalls(page))[0].height).toBe(1350);
  await expect(share.getByRole('status')).toHaveText('');
  await expect(button).toBeFocused();
});

test('系統分享因其他原因失敗時顯示退回提示，再按一次可以分享', async ({ page }) => {
  await fakeShare(page, 'supported');
  const share = await reachShare(page);
  const button = share.getByRole('button', { name: '分享結果' });
  await shareOutcome(page, 'NotAllowedError');
  await button.click();
  await expect(share.getByRole('status')).toHaveText(fallback);
  await shareOutcome(page, 'resolve');
  await button.click();
  await expect.poll(() => shareCalls(page)).toHaveLength(2);
  await expect(share.getByRole('status')).toHaveText('');
});

test('系統分享選單還開著時再按，不會重複開啟', async ({ page }) => {
  await fakeShare(page, 'supported');
  const share = await reachShare(page);
  const button = share.getByRole('button', { name: '分享結果' });
  await shareOutcome(page, 'hold');
  await button.click();
  await expect.poll(() => shareCalls(page)).toHaveLength(1);
  await button.click();
  await page.evaluate(() => (window as unknown as { settleShare: () => void }).settleShare());
  await shareOutcome(page, 'resolve');
  await button.click();
  await expect.poll(() => shareCalls(page)).toHaveLength(2);
  await expect(share.getByRole('status')).toHaveText('');
});

test('結果圖準備中按分享結果只顯示準備句，不開啟系統分享選單', async ({ page }) => {
  await fakeShare(page, 'supported');
  await controlImageFonts(page);
  await page.addInitScript(() => (window as unknown as { holdImageFonts: () => void }).holdImageFonts());
  const share = await reachShare(page);
  const button = share.getByRole('button', { name: '分享結果' });
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await button.focus();
  await button.press('Enter');
  await expect(share.getByRole('status')).toHaveText('正在準備結果圖……');
  expect(await shareCalls(page)).toHaveLength(0);

  await callPage(page, 'releaseImageFonts');
  await expect(button).toHaveAttribute('aria-disabled', 'false');
  expect(await shareCalls(page)).toHaveLength(0);
  await button.press('Enter');
  await expect.poll(() => shareCalls(page)).toHaveLength(1);
});

test('結果圖產生失敗時按分享結果只重新產生，準備好之後再按才分享', async ({ page }) => {
  await fakeShare(page, 'supported');
  await controlImageFonts(page);
  await page.addInitScript(() => (window as unknown as { failImageFonts: (value: boolean) => void }).failImageFonts(true));
  const share = await reachShare(page);
  const button = share.getByRole('button', { name: '分享結果' });
  await expect(share.getByRole('status')).toHaveText('結果圖沒有產生成功，請再試一次。結果連結仍然可以複製。');
  await expect(button).toHaveAttribute('aria-disabled', 'true');

  await callPage(page, 'failImageFonts', false);
  await button.press('Enter');
  await expect(share.getByRole('status')).toHaveText('正在準備結果圖……');
  await expect(button).toHaveAttribute('aria-disabled', 'false');
  await expect(share.getByRole('img')).toBeVisible();
  expect(await shareCalls(page)).toHaveLength(0);
  await button.click();
  await expect.poll(() => shareCalls(page)).toHaveLength(1);
});
