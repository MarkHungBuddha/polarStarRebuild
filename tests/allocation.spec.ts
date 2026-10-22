import { expect, test } from './support/fixtures';
import { classifyAndRankValues, completeRemainingScenarios, goToScenario } from './support/experience';
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

test('分配有限的晚上，確認後呈現原始配置而非強度', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '六個晚上，留給哪些事？');
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  const own = page.getByRole('spinbutton', { name: '自己的攝影小誌' });
  const friend = page.getByRole('spinbutton', { name: '陪朋友練面試' });
  await own.fill('4');
  await expect(friend).toHaveValue('2');
  await expect(page.getByText('已分配 6 / 6 晚', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '六個晚上，留給哪些事？', exact: true }) });
  await expect(evidence.getByText('你把 4 晚分給「自己的攝影小誌」，2 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(evidence.getByText(/兩倍|強度|總排名/)).toHaveCount(0);
});

test('分配不超出總量，均分只描述，回改採最後確認版本', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '六個晚上，留給哪些事？');
  const own = page.getByRole('spinbutton', { name: '自己的攝影小誌' });
  const friend = page.getByRole('spinbutton', { name: '陪朋友練面試' });
  await own.fill('99');
  await expect(own).toHaveValue('6');
  await expect(friend).toHaveValue('0');
  await own.fill('-1');
  await expect(own).toHaveValue('0');
  await expect(friend).toHaveValue('6');
  await own.fill('3');
  await own.focus();
  await own.press('ArrowUp');
  await expect(own).toHaveValue('4');
  await own.press('ArrowDown');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '六個晚上，留給哪些事？', exact: true }) });
  await expect(evidence.getByText('平均分配 · 只描述本次配置', { exact: true })).toBeVisible();
  await expect(evidence.getByText('你把 3 晚分給「自己的攝影小誌」，3 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toHaveCount(0);
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await own.fill('5');
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(evidence.getByText('你把 3 晚分給「自己的攝影小誌」，3 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await expect(own).toHaveValue('3');
  await own.fill('5');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  await expect(evidence.getByText('你把 5 晚分給「自己的攝影小誌」，1 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('第一幕並列時，分配較多也不補出相符或不同', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('combobox', { name: '照顧身邊的人的位置' }).selectOption('1');
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '六個晚上，留給哪些事？');
  await page.getByRole('spinbutton', { name: '自己的攝影小誌' }).fill('1');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '六個晚上，留給哪些事？', exact: true }) });
  await expect(evidence.getByText('第一幕並列 · 只描述本次配置', { exact: true })).toBeVisible();
  await expect(evidence.getByText('你把 1 晚分給「自己的攝影小誌」，5 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
});

test('續答保留已確認的原始分配，損壞的分配紀錄不會被恢復', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '六個晚上，留給哪些事？');
  await page.getByRole('spinbutton', { name: '自己的攝影小誌' }).fill('4');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '六個晚上，留給哪些事？', exact: true }) });
  await expect(evidence.getByText('你把 4 晚分給「自己的攝影小誌」，2 晚分給「陪朋友練面試」。', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    const raw = localStorage.getItem('polarstar.session.v1');
    if (!raw) throw new Error('Expected a saved session');
    const saved = JSON.parse(raw);
    saved.session.answers['slot03-evenings'].allocations = [6, 6];
    localStorage.setItem('polarstar.session.v1', JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('先前的本機紀錄無法讀取或版本不相容');
});
