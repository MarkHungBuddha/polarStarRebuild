import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { strikeScenarios } from '../src/scenarios/strike';
import { classifyAndRankValues, completeRemainingScenarios, goToScenario, sceneOptions, tieValues } from './support/experience';

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

async function openScenario(page: Page, title: string, tie?: { value: string; with: string }) {
  await page.goto('/');
  await classifyAndRankValues(page);
  if (tie) await tieValues(page, tie.value, tie.with);
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
  await sceneOptions(page).nth(0).click();
  await expect(sceneOptions(page).nth(0)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = evidenceFor(page, '聚會的散場時間');
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(evidence.getByText('我想多留半小時，把話聊完。延長費我願意分攤，明天少睡一點也沒關係。', { exact: true })).toBeVisible();
});

test('主導權與照顧身邊的人有兩個完整的刪稿變體', () => {
  expectCompleteStrikeVariants('slot12', ['influence', 'care']);
});

test('夥伴主導題可用鍵盤刪稿與回改，結果核對保留回覆與第一幕位置', async ({ page }) => {
  await openScenario(page, '你熟悉的夥伴想主導');
  await sceneOptions(page).nth(1).focus();
  await page.keyboard.press('Space');
  await expect(sceneOptions(page).nth(1)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '確認答案', exact: true }).focus();
  await page.keyboard.press('Enter');
  await completeRemainingScenarios(page);
  const evidence = evidenceFor(page, '你熟悉的夥伴想主導');
  const yielded = '這次由你決定最後方向，我在旁邊幫忙；就算結果不是我最想要的，我也願意讓你來。';
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(evidence.getByText(yielded, { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await sceneOptions(page).nth(0).focus();
  await page.keyboard.press('Space');
  await expect(sceneOptions(page).nth(0)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(evidence.getByText(yielded, { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await sceneOptions(page).nth(0).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(evidence.getByText('這次最後方向還是由我來定，照我的判斷做；我知道這樣你就少一次練習主導的機會。', { exact: true })).toBeVisible();
});

test('自主與遵守規範補至兩個變體，刪稿共六題且識別全域唯一', () => {
  expectCompleteStrikeVariants('slot02', ['autonomy', 'rules']);
  expect(strikeScenarios).toHaveLength(6);
  expect(new Set(strikeScenarios.map(scenario => scenario.id)).size).toBe(6);
});

test('第一幕並列享受生活與遵守規範時，聚會題只描述保留的回覆', async ({ page }) => {
  await openScenario(page, '聚會的散場時間', { value: '遵守規範', with: '享受生活' });
  await sceneOptions(page).nth(1).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = evidenceFor(page, '聚會的散場時間');
  await expect(evidence.getByText('第一幕並列 · 只描述本次選擇', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toHaveCount(0);
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
  await expect(evidence.getByText('我們就照原本約好的九點散場吧；雖然正聊得開心，剩下的話下次再說。', { exact: true })).toBeVisible();
});

test.describe('抽到第二個變體', () => {
test.use({ scenarioRandom: 0.99 });
test('三個刪稿槽的第二變體都能刪稿確認，結果分別核對保留的回覆', async ({ page }) => {
  await openScenario(page, '週末的打掃，照誰的時間？');
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await sceneOptions(page).nth(0).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await goToScenario(page, '無手機的晚餐');
  await sceneOptions(page).nth(1).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await goToScenario(page, '熟朋友的活動籌備');
  await sceneOptions(page).nth(0).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  for (const title of ['這份提案，用誰的方法？', '聚會的散場時間', '你熟悉的夥伴想主導']) {
    await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
  }
  const cleaning = evidenceFor(page, '週末的打掃，照誰的時間？');
  await expect(cleaning.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(cleaning.getByText('這週我想照自己的作息，挑平日晚上把負責的區域打掃好。我知道這沒照週六上午的約定，大家可能也得多確認一次。', { exact: true })).toBeVisible();
  const dinner = evidenceFor(page, '無手機的晚餐');
  await expect(dinner.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(dinner.getByText('我照約定把手機收著，專心吃完；這次就不拍甜點和合照了。', { exact: true })).toBeVisible();
  const outing = evidenceFor(page, '熟朋友的活動籌備');
  await expect(outing.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(outing.getByText('這次預算和行程還是由我來決定；你可以提建議，最後由我定案。', { exact: true })).toBeVisible();
});
});
