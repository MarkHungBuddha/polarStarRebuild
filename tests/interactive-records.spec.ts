import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { expectNoClippedText, expectNoHorizontalScroll, expectTouchTargets } from './support/experience';
import { answerInteractiveByTitle, decisionRecord, startInteractiveScenarios } from './support/interactive';

// The preview's sample: six evenings between a photo zine of one's own (A, 自主) and a friend's interview practice (B, 照顧身邊的人).
// The first act ranks the core values in list order, so 自主 is ahead of 照顧身邊的人.
const evenings = '六個晚上，留給誰？';

/** The full list of core values with their counts, as「價值｜次數」rows. */
async function allCountRows(page: Page) {
  const list = page.getByRole('list', { name: '全部價值的優先保留次數' });
  return Promise.all((await list.getByRole('listitem').all()).map(async item => `${await item.locator('span').textContent()}｜${await item.locator('b').textContent()}`));
}

test('完整清單列出十個核心價值，0 次標成本輪未優先保留', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [evenings]: { allocate: [4, 2] } });
  const rows = await allCountRows(page);
  expect(rows).toHaveLength(10);
  expect(rows).toContain('自主｜1 次／3 題');
  expect(rows).toContain('照顧身邊的人｜本輪未優先保留');
  expect(rows.filter(row => row.endsWith('本輪未優先保留'))).toHaveLength(9);
});

test('逐題記錄可以展開，列出原始決策，方向明確的題目與第一幕排序對照', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [evenings]: { allocate: [4, 2] } });
  const record = await decisionRecord(page, evenings);
  await expect(record).toContainText('做攝影小誌 4 晚、陪朋友練面試 2 晚');
  await expect(record).toContainText('這次情境選擇與原先排序一致');

  await record.getByRole('button', { name: '修改這題' }).click();
  await answerInteractiveByTitle(page, { [evenings]: { allocate: [1, 5] } });
  const changed = await decisionRecord(page, evenings);
  await expect(changed).toContainText('做攝影小誌 1 晚、陪朋友練面試 5 晚');
  await expect(changed).toContainText('這次情境選擇與原先排序不同');
});

test('平均分配與目前無法決定照原樣記錄，不判一致或不同', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [evenings]: '目前無法決定' });
  const record = await decisionRecord(page, evenings);
  await expect(record).toContainText('目前無法決定');
  await expect(record).not.toContainText(/一致|不同/);

  await record.getByRole('button', { name: '修改這題' }).click();
  await answerInteractiveByTitle(page, { [evenings]: '平均分配' });
  const even = await decisionRecord(page, evenings);
  await expect(even).toContainText('平均分配：做攝影小誌 3 晚、陪朋友練面試 3 晚');
  await expect(even).not.toContainText(/一致|不同/);
});

test('整理規則收在可展開的「結果怎麼整理」，結果用語不說言行矛盾或真實行為', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [evenings]: { allocate: [4, 2] } });
  const rule = page.getByText(/平均分配和目前無法決定都不加次數/);
  await expect(rule).toBeHidden();
  await page.getByText('結果怎麼整理', { exact: true }).click();
  await expect(rule).toBeVisible();
  await page.getByText('展開全部 1 題的決策', { exact: true }).click();
  await expect(page.locator('.result-page')).not.toContainText(/言行|矛盾|真實行為/);
});

test('手機上目前無法決定與展開的結果都不橫向捲動，控制項夠大', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await startInteractiveScenarios(page);
  await expectTouchTargets(page.locator('.scenario-mechanic'));
  await answerInteractiveByTitle(page, { [evenings]: '目前無法決定' });
  await decisionRecord(page, evenings);
  await page.getByText('結果怎麼整理', { exact: true }).click();
  await expectNoHorizontalScroll(page);
  await expectNoClippedText(page.locator('.result-page'));
  await expectTouchTargets(page.locator('.decision-records'));
});
