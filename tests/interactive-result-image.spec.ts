import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { classifyAll } from './support/experience';
import { answerInteractiveByTitle, decisionRecord, interactivePreviewPath, type InteractiveDecision } from './support/interactive';
import { shareRegion } from './support/result-share';
import { allText, drawnImage, expectFullyLegible, expectRowsDrawn, recordImageText } from './support/result-image';

// The preview's samples: six evenings between a photo zine of one's own (A, 自主) and a friend's interview practice (B, 照顧身邊的人),
// and four weekends that open on a current plan, between a new town (A, 探索刺激) and the familiar route (B, 安全穩定).
const evenings = '六個晚上，留給誰？';
const weekends = '四個週末，照原本排的走嗎？';

const ownColumn = (page: Page, heading: string) => page.getByRole('heading', { name: heading, exact: true }).locator('..');
const countColumn = (page: Page) => ownColumn(page, '情境中優先保留的');
const statedColumn = (page: Page) => ownColumn(page, '你最重視的');
const decidedLine = (page: Page) => page.getByRole('region', { name: '你的前三名' }).locator('.decided-count');

// Twenty-four characters, the longest custom value the first screen accepts.
const longCustom = '每天留一段完全不被打擾的時間好好想清楚自己要什麼';

/**
 * Opens the interactive preview with these custom values, puts every value in「這就是我」in list order, then answers the listed
 * questions by title; every other question in the round is 目前無法決定, so only the listed ones count.
 */
async function reachInteractiveShare(page: Page, decisions: Readonly<Record<string, InteractiveDecision>>, customWords: readonly string[] = []) {
  await page.goto(interactivePreviewPath);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const word of customWords) {
    await page.getByRole('textbox', { name: '自訂價值' }).fill(word);
    await page.getByRole('button', { name: '新增價值' }).click();
  }
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerInteractiveByTitle(page, decisions, '目前無法決定');
  return shareRegion(page);
}

test('互動結果圖畫出兩幕前三名、並列者的「N 次／3 題」和明確決策題數，長名稱與並列都不溢出', async ({ page }) => {
  await recordImageText(page);
  const share = await reachInteractiveShare(page, { [evenings]: { allocate: [2, 4] }, [weekends]: { allocate: [0, 4] } }, [longCustom, '早睡']);
  await expect(countColumn(page).getByRole('listitem')).toHaveText(['並列第 1安全穩定、照顧身邊的人1 次／3 題']);
  const group = share.getByRole('group', { name: '也分享自訂價值' });
  for (const word of [longCustom, '早睡']) await group.getByRole('checkbox', { name: word, exact: true }).check();

  const drawn = await drawnImage(page);
  const text = allText(drawn);
  expect(text).toContain('優先保留');
  await expectRowsDrawn(countColumn(page), drawn);
  await expectRowsDrawn(statedColumn(page), drawn);
  expect(text).toContain((await decidedLine(page).textContent())!);
  expect(text).toContain(longCustom + '早睡');
  expect(text).not.toMatch(/偏向|選了|%|％/);
  expectFullyLegible(drawn);
});

test('沒有方向明確的決策時，互動結果圖寫出說明，不畫空的第二幕排名', async ({ page }) => {
  await recordImageText(page);
  await reachInteractiveShare(page, {});
  await expect(decidedLine(page)).toHaveText(/^明確決策 0 \/ \d+ 題$/);
  const drawn = await drawnImage(page);
  const text = allText(drawn);
  expect(text).toContain('這次沒有方向明確的決策，不產生第二幕排名');
  expect(text).toContain((await decidedLine(page).textContent())!);
  // Only the first act's three positions are drawn; the second column has no position or count.
  expect(drawn.filter(item => /^(並列)?第 \d+$/.test(item.text)).map(item => item.left < 540)).toEqual([true, true, true]);
  expect(text).not.toMatch(/次／3 題/);
  expectFullyLegible(drawn);
});

test('互動結果可以下載結果圖，系統分享帶的連結就是格式版本 3 的結果連結', async ({ page }) => {
  await page.addInitScript(() => {
    const calls: unknown[] = [];
    Object.assign(window, { shareCalls: calls });
    Object.defineProperty(Navigator.prototype, 'canShare', { configurable: true, writable: true, value: () => true });
    Object.defineProperty(Navigator.prototype, 'share', { configurable: true, writable: true, value: async (data: ShareData) => {
      const bitmap = await createImageBitmap(data.files![0]);
      calls.push({ url: data.url, type: data.files![0].type, width: bitmap.width, height: bitmap.height });
    } });
  });
  const share = await reachInteractiveShare(page, { [evenings]: { allocate: [4, 2] } });
  const link = await share.getByRole('textbox', { name: '結果連結' }).inputValue();
  expect(new URL(link).hash).toMatch(/^#r=3\./);
  for (const name of ['分享結果', '下載結果圖']) await expect(share.getByRole('button', { name })).toHaveAttribute('aria-disabled', 'false');

  const downloading = page.waitForEvent('download');
  await share.getByRole('button', { name: '下載結果圖' }).click();
  expect((await downloading).suggestedFilename()).toBe('northstar-result.png');

  await share.getByRole('button', { name: '分享結果' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { shareCalls: unknown[] }).shareCalls)).toEqual([{ url: link, type: 'image/png', width: 1080, height: 1350 }]);
  await expect(share.getByRole('status')).toHaveText('');
});

test('結果圖和結果連結都不含逐題決策和反思筆記', async ({ page }) => {
  await recordImageText(page);
  const share = await reachInteractiveShare(page, { [evenings]: { allocate: [4, 2] }, [weekends]: '維持初始安排' });
  const records: string[] = [];
  for (const title of [evenings, weekends]) records.push((await (await decisionRecord(page, title)).locator('.evidence-quote').textContent())!);
  expect(records).toEqual([expect.stringContaining('4 晚'), expect.stringContaining('維持原本安排')]);

  const note = '朋友那邊其實更急';
  const reflection = page.getByRole('region', { name: '回想一題（可略過）' });
  const picker = reflection.getByLabel('選一題有感的情境');
  const option = await picker.getByRole('option').filter({ hasText: evenings }).textContent();
  await picker.selectOption({ label: option! });
  await reflection.getByLabel('反思筆記（可不填）').fill(note);

  const link = decodeURIComponent(await share.getByRole('textbox', { name: '結果連結' }).inputValue());
  const text = allText(await drawnImage(page));
  for (const secret of [note, ...records, evenings, weekends]) {
    expect(link, secret).not.toContain(secret);
    expect(text, secret).not.toContain(secret);
  }
});
