import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { classifyAll } from './support/experience';
import { answerByTitle, scoreColumn, type Lean } from './support/preference';
import { shareRegion } from './support/result-share';
import { allText, drawnImage, expectFullyLegible, expectRowsDrawn, recordImageText } from './support/result-image';

const scoringRule = '計分：強烈偏向 2 分，稍微偏向 1 分，兩者相當 0 分，不是百分比。';
const sharerScores = '情境中的偏向分數';
const statedColumn = (page: Page) => page.getByRole('heading', { name: '你最重視的', exact: true }).locator('..');

/**
 * With the fixed randomness the run asks the first variant of each slot in slot order. Listed questions get their lean,
 * the rest 兩者相當. Custom values are added first; every value goes in「這就是我」and keeps list order.
 */
async function reachPreferenceShare(page: Page, leans: Record<string, Lean>, customWords: readonly string[] = []) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const word of customWords) {
    await page.getByRole('textbox', { name: '自訂價值' }).fill(word);
    await page.getByRole('button', { name: '新增價值' }).click();
  }
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerByTitle(page, leans);
  return shareRegion(page);
}

// 自主 4、探索刺激 3，其餘八個核心價值各 1 分：第 3 名八個並列，是第二幕最高的一欄。
const tallestScores: Record<string, Lean> = {
  '固定薪水，還是自己接案？': '強烈偏向 A', '這三週的晚上，留給哪件事？': '強烈偏向 A',
  '下週，照原計畫嗎？': '強烈偏向 A', '同一天，兩場活動。': '稍微偏向 A',
  '這份提案，用誰的方法？': '稍微偏向 B', '這次進修，往哪裡走？': '稍微偏向 B', '八週的進修，要不要報？': '稍微偏向 A',
  '原本留給自己的那一晚。': '稍微偏向 B', '成果發表，要多做一個版本嗎？': '稍微偏向 B', '這筆活動預算，誰來決定？': '稍微偏向 A',
  '今年的活動，誰說了算？': '稍微偏向 B', '一個下午的準備，先做哪件事？': '稍微偏向 A',
};
// 每個核心價值各被強烈偏向一次：十個價值並列第 1。
const allTied: Record<string, Lean> = {
  '固定薪水，還是自己接案？': '強烈偏向 A', '這份提案，用誰的方法？': '強烈偏向 B', '這三週的晚上，留給哪件事？': '強烈偏向 B',
  '下週，照原計畫嗎？': '強烈偏向 A', '同一天，兩場活動。': '強烈偏向 B', '這次進修，往哪裡走？': '強烈偏向 B',
  '八週的進修，要不要報？': '強烈偏向 A', '成果發表，要多做一個版本嗎？': '強烈偏向 B', '這筆活動預算，誰來決定？': '強烈偏向 A',
  '一個下午的準備，先做哪件事？': '強烈偏向 A',
};

test('新版結果圖畫出和本人結果相同的偏向分數與名次，說明 2／1／0 計分，不寫次數或百分比', async ({ page }) => {
  await recordImageText(page);
  const share = await reachPreferenceShare(page, tallestScores, ['保有獨處的時間', '這就是我', '早睡', '散步']);
  await expect(scoreColumn(page, sharerScores).getByRole('listitem')).toHaveText(['第 1自主4 分', '第 2探索刺激3 分', '並列第 3享受生活、成就、主導權、安全穩定、遵守規範、傳承、照顧身邊的人、普遍關懷各 1 分']);
  const group = share.getByRole('group', { name: '也分享自訂價值' });
  for (const word of ['保有獨處的時間', '這就是我', '早睡', '散步']) await group.getByRole('checkbox', { name: word, exact: true }).check();
  await expect(share.getByRole('img')).toHaveAttribute('alt', '結果圖預覽：兩份前三名，內容同本頁上方。另含 4 個自訂價值：保有獨處的時間、這就是我、早睡，另有 1 個。');

  const drawn = await drawnImage(page);
  const text = allText(drawn);
  expect(text).toContain('我在情境中的偏向分數');
  expect(text).toContain(scoringRule);
  await expectRowsDrawn(scoreColumn(page, sharerScores), drawn);
  await expectRowsDrawn(statedColumn(page), drawn);
  expect(text).not.toContain('另有 1 個並列');
  expect(text).not.toMatch(/選了|%|％/);
  expect(text).toContain('保有獨處的時間這就是我早睡另有 1 個自訂價值');
  expectFullyLegible(drawn);
});

test('新版結果圖完整畫出十個並列的價值', async ({ page }) => {
  await recordImageText(page);
  await reachPreferenceShare(page, allTied);
  await expect(scoreColumn(page, sharerScores).getByRole('listitem')).toHaveText(['並列第 1自主、探索刺激、享受生活、成就、主導權、安全穩定、遵守規範、傳承、照顧身邊的人、普遍關懷各 2 分']);
  const drawn = await drawnImage(page);
  await expectRowsDrawn(scoreColumn(page, sharerScores), drawn);
  expectFullyLegible(drawn);
});

test('新版結果全部零分時，結果圖寫沒有明確偏向並附計分說明', async ({ page }) => {
  await recordImageText(page);
  await reachPreferenceShare(page, {});
  await expect(scoreColumn(page, sharerScores).getByText('這次作答沒有明確偏向。', { exact: true })).toBeVisible();
  const drawn = await drawnImage(page);
  expect(allText(drawn)).toContain('這次作答沒有明確偏向');
  expect(allText(drawn)).not.toContain('這次作答沒有明確偏向。');
  expect(allText(drawn)).toContain(scoringRule);
  expect(allText(drawn)).not.toContain('這次沒有偏向一邊的答案');
  expectFullyLegible(drawn);
});

test('新版結果可以下載結果圖，也能把圖和結果連結交給系統分享', async ({ page }) => {
  await page.addInitScript(() => {
    const calls: unknown[] = [];
    Object.assign(window, { shareCalls: calls });
    Object.defineProperty(Navigator.prototype, 'canShare', { configurable: true, writable: true, value: () => true });
    Object.defineProperty(Navigator.prototype, 'share', { configurable: true, writable: true, value: async (data: ShareData) => {
      const bitmap = await createImageBitmap(data.files![0]);
      calls.push({ url: data.url, type: data.files![0].type, width: bitmap.width, height: bitmap.height });
    } });
  });
  const share = await reachPreferenceShare(page, tallestScores);
  const link = await share.getByRole('textbox', { name: '結果連結' }).inputValue();
  expect(new URL(link).hash).toMatch(/^#r=2\./);
  await expect(share.getByRole('img')).toHaveAttribute('alt', '結果圖預覽：兩份前三名，內容同本頁上方。不含自訂價值。');
  for (const name of ['分享結果', '下載結果圖']) await expect(share.getByRole('button', { name })).toHaveAttribute('aria-disabled', 'false');

  const downloading = page.waitForEvent('download');
  await share.getByRole('button', { name: '下載結果圖' }).click();
  const bytes = readFileSync(await (await downloading).path());
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1080, 1350]);

  await share.getByRole('button', { name: '分享結果' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { shareCalls: unknown[] }).shareCalls)).toEqual([{ url: link, type: 'image/png', width: 1080, height: 1350 }]);
  await expect(share.getByRole('status')).toHaveText('');
});
