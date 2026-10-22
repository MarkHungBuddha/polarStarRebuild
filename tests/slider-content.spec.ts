import { expect, test } from './support/fixtures';
import { sliderScenarios } from '../src/scenarios/slider';
import { classifyValues, completeRemainingScenarios, goToScenario } from './support/experience';

test('自主與安全穩定有兩個可辨識的滑桿變體', () => {
  const variants = sliderScenarios.filter(scenario => scenario.slotId === 'slot01');
  expect(variants).toHaveLength(2);
  expect(new Set(variants.map(scenario => scenario.id)).size).toBe(2);
  for (const variant of variants) {
    expect(variant.pair).toEqual(['autonomy', 'security']);
    expect(variant.kind).toBe('slider');
    expect(variant.min).toBeLessThan(variant.max);
    expect(variant.step).toBeGreaterThan(0);
    expect(variant.initial).toBeGreaterThanOrEqual(variant.min);
    expect(variant.initial).toBeLessThanOrEqual(variant.max);
    expect(variant.question.length).toBeGreaterThan(0);
    expect(variant.unit.length).toBeGreaterThan(0);
    expect(variant.resultPrefix.length).toBeGreaterThan(0);
    expect(variant.resultSuffix.length).toBeGreaterThan(0);
  }
});

test('享受生活與成就有兩個完整的接受條件變體', () => {
  const variants = sliderScenarios.filter(scenario => scenario.slotId === 'slot07');
  expect(variants).toHaveLength(2);
  for (const variant of variants) {
    expect(variant.pair).toEqual(['hedonism', 'achievement']);
    expect(variant.kind).toBe('slider');
    expect(variant.unit).toBe('小時純休閒');
    expect(variant.setup.length).toBeGreaterThan(0);
    expect(variant.question.length).toBeGreaterThan(0);
    expect(variant.resultPrefix.length).toBeGreaterThan(0);
    expect(variant.resultSuffix.length).toBeGreaterThan(0);
  }
});

test('成就與普遍關懷有兩個完整變體，滑桿總計六題且識別唯一', () => {
  const variants = sliderScenarios.filter(scenario => scenario.slotId === 'slot10');
  expect(variants).toHaveLength(2);
  expect(sliderScenarios).toHaveLength(6);
  expect(new Set(sliderScenarios.map(scenario => scenario.id)).size).toBe(6);
  for (const variant of variants) {
    expect(variant.pair).toEqual(['achievement', 'fairness']);
    expect(variant.kind).toBe('slider');
    expect(variant.unit).toBe('週準備時間');
    expect(variant.setup.length).toBeGreaterThan(0);
    expect(variant.question.length).toBeGreaterThan(0);
    expect(variant.resultPrefix.length).toBeGreaterThan(0);
    expect(variant.resultSuffix.length).toBeGreaterThan(0);
  }
});

test('新槽位的休閒與準備時間可確認回改，結果保留各自單位', async ({ page }) => {
  await page.goto('/');
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '八週的進修，留多少空白？');
  const slider = page.getByRole('slider');
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await slider.focus();
  await slider.press('Home');
  for (let count = 0; count < 6; count += 1) await slider.press('ArrowRight');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await goToScenario(page, '成果發表，要多留一個版本嗎？');
  await slider.focus();
  await slider.press('Home');
  for (let count = 0; count < 3; count += 1) await slider.press('ArrowRight');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const leisure = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '八週的進修，留多少空白？', exact: true }) });
  const preparation = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '成果發表，要多留一個版本嗎？', exact: true }) });
  await expect(leisure.getByText('你希望每週至少保留 6 小時純休閒，再考慮八週進修安排。', { exact: true })).toBeVisible();
  await expect(preparation.getByText('你希望至少多有 3 週準備時間，再考慮延後發表並一併完成易讀版。', { exact: true })).toBeVisible();
  await preparation.getByRole('button', { name: '修改這題' }).click();
  await expect(slider).toHaveValue('3');
  await slider.focus();
  await slider.press('End');
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(preparation.getByText('你希望至少多有 3 週準備時間，再考慮延後發表並一併完成易讀版。', { exact: true })).toBeVisible();
  for (const evidence of [leisure, preparation]) {
    await expect(evidence.getByText('接受條件 · 只描述本次答案', { exact: true })).toBeVisible();
    await expect(evidence.getByText('與第一幕相符', { exact: true })).toHaveCount(0);
    await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
  }
});

test.describe('抽到第二個變體', () => {
test.use({ scenarioRandom: 0.99 });
test('新的居住滑桿變體可作答，且結果只呈現不調租保障條件', async ({ page }) => {
  await page.goto('/');
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '搬家之前，想先確定什麼？');
  const slider = page.getByRole('slider', { name: '至少保障幾個月不調租，你才考慮搬到新住處？' });
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await slider.focus();
  await slider.press('Home');
  for (let count = 0; count < 12; count += 1) await slider.press('ArrowRight');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  await expect(page.getByRole('heading', { name: '先準備多少，再換一種工作？', exact: true })).toHaveCount(0);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '搬家之前，想先確定什麼？', exact: true }) });
  await expect(evidence.getByText('你希望先有 12 個月不調租保障，再考慮搬到能自行安排空間的新住處。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('接受條件 · 只描述本次答案', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toHaveCount(0);
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
  await expect(page.getByText('你希望每個週末至少保留 1 小時純休閒，再考慮加入六週作品集共學。', { exact: true })).toBeVisible();
  await expect(page.getByText('你希望至少多有 1 週準備時間，再考慮延後作品分享並一併整理公開環境資料。', { exact: true })).toBeVisible();
});
});
