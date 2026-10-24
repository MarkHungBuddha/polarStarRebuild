import { expect, test } from './support/fixtures';
import { allocate, classifyAndRankValues, completeRemainingScenarios, expectNoHorizontalScroll, goToScenario, tieValues } from './support/experience';
import { allocationScenarios } from '../src/scenarios/allocation';

test('分配題庫覆蓋三個既定槽位，每槽兩個完整變體', () => {
  expect(allocationScenarios).toHaveLength(6);
  expect(new Set(allocationScenarios.map(scenario => scenario.id)).size).toBe(6);
  for (const [slotId, pair] of [['slot03', ['autonomy', 'care']], ['slot06', ['stimulation', 'achievement']], ['slot14', ['security', 'fairness']]] as const) {
    const variants = allocationScenarios.filter(scenario => scenario.slotId === slotId);
    expect(variants).toHaveLength(2);
    for (const variant of variants) {
      expect(variant.pair).toEqual(pair);
      expect(variant.kind).toBe('allocate');
      expect(variant.options.map(option => option.valueId)).toEqual(pair);
      expect(Number.isInteger(variant.total) && variant.total > 0).toBe(true);
      expect(variant.setup.length).toBeGreaterThan(50);
      for (const option of variant.options) expect(option.label.length > 0 && option.consequence.length > 0).toBe(true);
    }
  }
});

test('分配有限的晚上，較多的一邊算偏向並標示相符，但不呈現強度', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '六個晚上，留給哪些事？');
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await allocate(page, 4);
  await expect(page.locator('.scene-feedback')).toHaveText('自己的攝影小誌 4 晚 · 陪朋友練面試 2 晚行程排好了。');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '六個晚上，留給哪些事？', exact: true }) });
  await expect(evidence.getByText('你把 4 晚分給「自己的攝影小誌」，2 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(evidence.getByText('你把自主放在照顧身邊的人之前；在這題，你把較多晚分給「自己的攝影小誌」。', { exact: true })).toBeVisible();
  await expect(evidence.getByText(/兩倍|強度|總排名/)).toHaveCount(0);
});

test('把資源全部分給一邊時，才依第一幕先後標示相符或不同', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '六個晚上，留給哪些事？');
  await allocate(page, 0);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '六個晚上，留給哪些事？', exact: true }) });
  await expect(evidence.getByText('你把 0 晚分給「自己的攝影小誌」，6 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(evidence.getByText('你把自主放在照顧身邊的人之前；在這題，你把全部 6 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
});

test('分配不超出總量，均分只描述，回改採最後確認版本', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '六個晚上，留給哪些事？');
  const slots = page.locator('[data-planner-slot]');
  const confirm = page.getByRole('button', { name: '確認答案', exact: true });
  // The schedule has exactly the six evenings, and nothing is confirmable until every one is placed.
  await expect(slots).toHaveCount(6);
  await page.locator('.planner-activities button').nth(0).click();
  for (const slot of (await slots.all()).slice(0, 5)) await slot.click();
  await expect(confirm).toBeDisabled();
  await expect(page.locator('.scene-feedback')).toContainText('還有 1 個空檔。');
  await allocate(page, 3);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '六個晚上，留給哪些事？', exact: true }) });
  await expect(evidence.getByText('平均分配 · 只描述本次配置', { exact: true })).toBeVisible();
  await expect(evidence.getByText('你把 3 晚分給「自己的攝影小誌」，3 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toHaveCount(0);
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await allocate(page, 5);
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(evidence.getByText('你把 3 晚分給「自己的攝影小誌」，3 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await expect(page.locator('.scene-feedback')).toContainText('自己的攝影小誌 3 晚 · 陪朋友練面試 3 晚');
  await allocate(page, 5);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  await expect(evidence.getByText('你把 5 晚分給「自己的攝影小誌」，1 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test('第一幕並列時，分配較多也不補出相符或不同', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await tieValues(page, '照顧身邊的人', '自主');
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '六個晚上，留給哪些事？');
  await allocate(page, 1);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '六個晚上，留給哪些事？', exact: true }) });
  await expect(evidence.getByText('第一幕並列 · 只描述本次配置', { exact: true })).toBeVisible();
  await expect(evidence.getByText('你把 1 晚分給「自己的攝影小誌」，5 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
});

test('續答保留已確認的原始分配', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '六個晚上，留給哪些事？');
  await allocate(page, 4);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '六個晚上，留給哪些事？', exact: true }) });
  await expect(evidence.getByText('你把 4 晚分給「自己的攝影小誌」，2 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
});
