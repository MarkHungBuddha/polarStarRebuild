import { expect, test } from './support/fixtures';
import { scenarios } from '../src/scenarios';
import { baseValues } from '../src/data';
import { classifyAndRankValues, completeRemainingScenarios, goToScenario, sceneOption, sceneOptions } from './support/experience';

const binarySlots = {
  slot05: ['stimulation', 'tradition'],
  slot08: ['hedonism', 'care'],
  slot11: ['influence', 'fairness'],
  slot13: ['influence', 'tradition'],
  slot15: ['rules', 'tradition'],
} as const;

test('其餘五個二選一槽位各有兩個完整變體，識別全域唯一', () => {
  expect(new Set(scenarios.map(scenario => scenario.id)).size).toBe(scenarios.length);
  const valueWords = baseValues.map(value => value.word);
  for (const [slotId, pair] of Object.entries(binarySlots)) {
    const variants = scenarios.filter(scenario => scenario.slotId === slotId);
    expect(variants, slotId).toHaveLength(2);
    for (const variant of variants) {
      expect(variant.id.startsWith(`${slotId}-`)).toBe(true);
      expect(variant.kind).toBe('choice');
      expect(variant.pair).toEqual(pair);
      if (variant.kind !== 'choice') continue;
      expect(variant.setup.length).toBeGreaterThan(60);
      // Each side is tied to one value of the pair by explicit metadata, never inferred from wording.
      expect(variant.options.map(option => option.valueId)).toEqual(pair);
      expect(new Set(variant.options.map(option => option.id)).size).toBe(2);
      for (const option of variant.options) {
        expect(option.label.length).toBeGreaterThan(0);
        expect(option.consequence).toContain('也');
      }
      // The visible text never names the underlying values.
      const visible = [variant.title, variant.setup, ...variant.options.flatMap(option => [option.label, option.consequence])].join('');
      for (const word of valueWords) expect(visible, `${variant.id} reveals ${word}`).not.toContain(word);
    }
  }
});

test('新二選一題需明確確認，可回改並依第一幕先後標示相符或不同', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '原本留給自己的那一晚。');
  const confirm = page.getByRole('button', { name: '確認答案', exact: true });
  await expect(sceneOptions(page)).toHaveCount(2);
  await expect(confirm).toBeDisabled();
  await sceneOption(page, /照原計畫去看電影/).click();
  await confirm.click();
  await goToScenario(page, '這筆活動預算，誰來決定？');
  await expect(confirm).toBeDisabled();
  await sceneOption(page, /讓居民代表共同決定部分預算/).click();
  await confirm.click();
  await completeRemainingScenarios(page);
  const fund = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '這筆活動預算，誰來決定？', exact: true }) });
  const evening = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '原本留給自己的那一晚。', exact: true }) });
  await expect(fund.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(fund.getByText('你把主導權放在普遍關懷之前；在這題，你選擇了「讓居民代表共同決定部分預算」。', { exact: true })).toBeVisible();
  await expect(evening.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(evening.getByText('你把享受生活放在照顧身邊的人之前；在這題，你選擇了「照原計畫去看電影，明天再回覆朋友」。', { exact: true })).toBeVisible();

  await fund.getByRole('button', { name: '修改這題' }).click();
  await expect(sceneOption(page, /讓居民代表共同決定部分預算/)).toHaveAttribute('aria-pressed', 'true');
  await sceneOption(page, /保留全部定案權/).click();
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(fund.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await fund.getByRole('button', { name: '修改這題' }).click();
  await sceneOption(page, /保留全部定案權/).click();
  await confirm.click();
  await completeRemainingScenarios(page);
  await expect(fund.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(fund.getByText('你把主導權放在普遍關懷之前；在這題，你選擇了「保留全部定案權，照我的方案執行」。', { exact: true })).toBeVisible();
});

test.describe('抽到第二個變體', () => {
  test.use({ scenarioRandom: 0.99 });
  test('第一幕並列時，新二選一題只描述本次選擇', async ({ page }) => {
    await page.goto('/');
    await classifyAndRankValues(page);
    await page.getByRole('combobox', { name: '遵守規範的位置' }).selectOption('8');
    await page.getByRole('button', { name: '進入情境中的取捨' }).click();
    await goToScenario(page, '節慶聚會用哪一套餐具？');
    await sceneOption(page, /沿用各自帶器皿的慣例/).click();
    await page.getByRole('button', { name: '確認答案', exact: true }).click();
    await completeRemainingScenarios(page);
    await expect(page.getByRole('heading', { name: '新約定遇上紀念聚會。', exact: true })).toHaveCount(0);
    const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '節慶聚會用哪一套餐具？', exact: true }) });
    await expect(evidence.getByText('第一幕並列 · 只描述本次選擇', { exact: true })).toBeVisible();
    await expect(evidence.getByText('你將遵守規範與傳承並列；在這題，你選擇了「沿用各自帶器皿的慣例」。', { exact: true })).toBeVisible();
    await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
    await expect(evidence.getByText('與第一幕相符', { exact: true })).toHaveCount(0);
    for (const title of ['這次連假，怎麼過？', '只有半天的空檔。', '一場公開分享會的名額與主題。', '工藝展的安排權。']) {
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    }
  });
});
