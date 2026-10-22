import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { strikeScenarios } from '../src/scenarios/strike';
import { classifyAndRankValues, completeRemainingScenarios, goToScenario } from './support/experience';

function expectCompleteStrikeVariants(slotId: string, pair: readonly [string, string]) {
  const variants = strikeScenarios.filter(scenario => scenario.slotId === slotId);
  expect(variants).toHaveLength(2);
  expect(new Set(variants.map(scenario => scenario.id)).size).toBe(2);
  for (const variant of variants) {
    expect(variant.kind).toBe('strike');
    expect(variant.pair).toEqual(pair);
    expect(variant.setup.length).toBeGreaterThan(0);
    expect(variant.options.map(option => option.valueId)).toEqual(pair);
    expect(new Set(variant.options.map(option => option.id)).size).toBe(2);
    for (const option of variant.options) {
      expect(option.label.length).toBeGreaterThan(0);
      expect(option.consequence.length).toBeGreaterThan(0);
    }
  }
}

async function openScenario(page: Page, title: string, tie?: { value: string; position: string }) {
  await page.goto('/');
  await classifyAndRankValues(page);
  if (tie) await page.getByRole('combobox', { name: `${tie.value}的位置` }).selectOption(tie.position);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, title);
}

function evidenceFor(page: Page, title: string) {
  return page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}

test('享受生活與遵守規範有兩個完整的刪稿變體', () => {
  expectCompleteStrikeVariants('slot09', ['hedonism', 'rules']);
});

test('聚會散場題可刪去約定段，結果保留享受相聚的回覆並與第一幕相符', async ({ page }) => {
  await openScenario(page, '聚會的散場時間');
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('radio', { name: '刪掉 B 段' }).check();
  await expect(page.getByText('保留 A 段', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = evidenceFor(page, '聚會的散場時間');
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(evidence.getByText('我想多留半小時把這段相聚享受完；我願意分攤延長費，也接受明天少些休息。', { exact: true })).toBeVisible();
});

test('主導權與照顧身邊的人有兩個完整的刪稿變體', () => {
  expectCompleteStrikeVariants('slot12', ['influence', 'care']);
});

test('夥伴主導題可用鍵盤刪稿與回改，結果核對保留回覆與第一幕位置', async ({ page }) => {
  await openScenario(page, '你熟悉的夥伴想主導');
  await page.getByRole('radio', { name: '刪掉 A 段' }).focus();
  await page.keyboard.press('Space');
  await expect(page.getByText('保留 B 段', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '確認答案', exact: true }).focus();
  await page.keyboard.press('Enter');
  await completeRemainingScenarios(page);
  const evidence = evidenceFor(page, '你熟悉的夥伴想主導');
  const yielded = '這次由你定最後方向，我提供需要的支援；即使最後方案不是我最想要的，我也願意讓出這個位置。';
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(evidence.getByText(yielded, { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('radio', { name: '刪掉 A 段' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByText('保留 A 段', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(evidence.getByText(yielded, { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('radio', { name: '刪掉 B 段' }).check();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(evidence.getByText('這次我想保留最後定案權，讓方向依我的判斷推進；我知道這會少給你一次主導的練習。', { exact: true })).toBeVisible();
});

test('自主與遵守規範補至兩個變體，刪稿共六題且識別全域唯一', () => {
  expectCompleteStrikeVariants('slot02', ['autonomy', 'rules']);
  expect(strikeScenarios).toHaveLength(6);
  expect(new Set(strikeScenarios.map(scenario => scenario.id)).size).toBe(6);
});

test('第一幕並列享受生活與遵守規範時，聚會題只描述保留的回覆', async ({ page }) => {
  await openScenario(page, '聚會的散場時間', { value: '遵守規範', position: '3' });
  await page.getByRole('radio', { name: '刪掉 A 段' }).check();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = evidenceFor(page, '聚會的散場時間');
  await expect(evidence.getByText('第一幕並列 · 只描述本次選擇', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toHaveCount(0);
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
  await expect(evidence.getByText('我想照我們原先約好的九點散場；雖然正聊得開心，我會把後面的話留到下次。', { exact: true })).toBeVisible();
});

test.describe('抽到第二個變體', () => {
test.use({ scenarioRandom: 0.99 });
test('三個刪稿槽的第二變體都能刪稿確認，結果分別核對保留的回覆', async ({ page }) => {
  await openScenario(page, '週末的打掃，照誰的時間？');
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('radio', { name: '刪掉 B 段' }).check();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await goToScenario(page, '無手機的晚餐');
  await page.getByRole('radio', { name: '刪掉 A 段' }).check();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await goToScenario(page, '熟朋友的活動籌備');
  await page.getByRole('radio', { name: '刪掉 B 段' }).check();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  for (const title of ['這份提案，用誰的方法？', '聚會的散場時間', '你熟悉的夥伴想主導']) {
    await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
  }
  const cleaning = evidenceFor(page, '週末的打掃，照誰的時間？');
  await expect(cleaning.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(cleaning.getByText('這週我想照自己的節奏，挑平日晚上把負責的區域打掃好；我知道這會偏離大家約好的週六上午，也可能讓大家多確認一次。', { exact: true })).toBeVisible();
  const dinner = evidenceFor(page, '無手機的晚餐');
  await expect(dinner.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(dinner.getByText('我先照約定把手機收著，專心吃完；這次就不留下甜點和合照了。', { exact: true })).toBeVisible();
  const outing = evidenceFor(page, '熟朋友的活動籌備');
  await expect(outing.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(outing.getByText('這次預算與行程的最後決定我仍想自己掌握；你可以提建議，但我會負責定案。', { exact: true })).toBeVisible();
});
});
