import { expect, test } from './support/fixtures';
import { amountFeedback, classifyAndRankValues, completeRemainingScenarios, expectNoHorizontalScroll, goToScenario, setAmount } from './support/experience';

test('滑桿需明確操作及確認；條件落在兩門檻之間時，結果只描述原始接受條件', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '先準備多少，再換一種工作？');
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await expect(amountFeedback(page)).toHaveText('還沒有定案，先在場景裡試試看。');
  await setAmount(page, 8);
  await expect(amountFeedback(page)).toContainText(' 8 個月生活費');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '先準備多少，再換一種工作？', exact: true }) });
  await expect(evidence.getByText('你希望先準備 8 個月生活費，再考慮轉為接案。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('接受條件 · 只描述本次答案', { exact: true })).toBeVisible();
  await expect(evidence.getByText('這個條件不算偏向任何一邊：3 以下算偏向自主，12 以上算偏向安全穩定。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toHaveCount(0);
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
});

test('滑桿條件超出作者門檻時算偏向一邊，並依第一幕先後標示相符或不同', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '先準備多少，再換一種工作？');
  await setAmount(page, 12);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '先準備多少，再換一種工作？', exact: true }) });
  await expect(evidence.getByText('你希望先準備 12 個月生活費，再考慮轉為接案。', { exact: true })).toBeVisible();
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(evidence.getByText('這個條件算偏向安全穩定：3 以下算偏向自主，12 以上算偏向安全穩定。', { exact: true })).toBeVisible();
});

test('滑桿回改只在再次確認後更新，且保留其他題答案', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '先準備多少，再換一種工作？');
  await setAmount(page, 12);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '先準備多少，再換一種工作？', exact: true }) });
  const choiceEvidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '下週，照原計畫嗎？', exact: true }) });
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await expect(amountFeedback(page)).toContainText(' 12 ');
  await setAmount(page, 'max');
  await expect(amountFeedback(page)).toContainText(' 24 個月生活費');
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(evidence.getByText('你希望先準備 12 個月生活費，再考慮轉為接案。', { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await expect(amountFeedback(page)).toContainText(' 12 ');
  await setAmount(page, 'max');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  await expect(evidence.getByText('你希望先準備 24 個月生活費，再考慮轉為接案。', { exact: true })).toBeVisible();
  await expect(choiceEvidence.getByText('你把探索刺激放在安全穩定之前；在這題，你選擇了「去新團隊試兩週」。', { exact: true })).toBeVisible();
  await expectNoHorizontalScroll(page);
});
