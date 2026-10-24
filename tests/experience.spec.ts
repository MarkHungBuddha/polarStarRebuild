import { expect, test } from './support/fixtures';
import { classifyAll, classifyAndRankValues, classifyValues, completeRemainingScenarios, expectNoHorizontalScroll, expectPosition, goToScenario, pressOnHandle, rankValuesInListedOrder, sceneOption, setCategory, tieValues } from './support/experience';

test('使用者能分類十個共同價值，並在進入情境前保留並列與自訂價值', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '關於這份題目' }).click();
  await expect(page.getByText('兩幕都是在假設情境下的自我回報', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('group', { name: /的重要性$/ })).toHaveCount(10);
  await expect(page.getByRole('button', { name: '下一步：排出順序' })).toBeDisabled();
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await pressOnHandle(page, '安全穩定', 'ArrowDown');
  await expectPosition(page, '安全穩定', 2);
  await expect(page.getByText('一樣重要的，按「並列」和上一個排在一起', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '下週，照原計畫嗎？');
  await expect(page.getByRole('heading', { name: '下週，照原計畫嗎？' })).toBeVisible();
  await expect(page.getByRole('button', { name: '確認答案' })).toBeDisabled();
});

test('沒有自行排出先後時，同類價值視為並列，結果不標相符或不同', async ({ page }) => {
  await page.goto('/');
  await classifyValues(page);
  await expectPosition(page, '探索刺激', 1);
  await expectPosition(page, '安全穩定', 1);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '下週，照原計畫嗎？');
  await sceneOption(page, /留在原團隊/).click();
  await page.getByRole('button', { name: '確認答案' }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '下週，照原計畫嗎？', exact: true }) });
  await expect(evidence.getByText('第一幕並列 · 只描述本次選擇', { exact: true })).toBeVisible();
  await expect(page.getByText(/^與第一幕(相符|不同)$/)).toHaveCount(0);
});

test('排序位置只在同一類別內選擇，換類別後重新從並列開始', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await classifyAll(page, 'good');
  for (const word of ['自主', '成就', '傳承']) await setCategory(page, word, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  const core = page.getByRole('region', { name: '這就是我' }).getByRole('listitem');
  await expect(core).toHaveCount(3);
  await expect(page.getByRole('region', { name: '還不錯' }).getByRole('listitem')).toHaveCount(7);
  await pressOnHandle(page, '傳承', 'End');
  await expectPosition(page, '傳承', 2);
  await page.getByRole('button', { name: '返回分類' }).click();
  await setCategory(page, '成就', 'low');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await expect(core).toHaveCount(2);
  await expectPosition(page, '自主', 1);
  await expectPosition(page, '傳承', 2);
  await expectPosition(page, '成就', 1);
});

test('結果只使用最後確認答案，並可呈現相符與不同', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '下週，照原計畫嗎？');
  await sceneOption(page, /留在原團隊/).click();
  await page.getByRole('button', { name: '確認答案' }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '下週，照原計畫嗎？', exact: true }) });
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(evidence.getByText('你把探索刺激放在安全穩定之前；在這題，你選擇了「留在原團隊」。')).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await sceneOption(page, /去新團隊試兩週/).click();
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await sceneOption(page, /去新團隊試兩週/).click();
  await page.getByRole('button', { name: '確認答案' }).click();
  await completeRemainingScenarios(page);
  await expect(evidence.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(evidence.getByText('你把探索刺激放在安全穩定之前；在這題，你選擇了「去新團隊試兩週」。')).toBeVisible();
});

test('並列不被判成不同，且自訂價值仍在結果獨立呈現', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await rankValuesInListedOrder(page);
  await pressOnHandle(page, '創作', 'End');
  await tieValues(page, '安全穩定', '探索刺激');
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '下週，照原計畫嗎？');
  await sceneOption(page, /留在原團隊/).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: '確認答案' }).focus();
  await page.keyboard.press('Enter');
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '下週，照原計畫嗎？', exact: true }) });
  await expect(evidence.getByText('第一幕並列 · 只描述本次選擇', { exact: true })).toBeVisible();
  await expect(evidence.getByText('你將探索刺激與安全穩定並列；在這題，你選擇了「留在原團隊」。')).toBeVisible();
  await expect(page.getByRole('heading', { name: '你的自訂價值' })).toBeVisible();
  await expect(page.getByText('創作 · 這就是我 · 位置 10')).toBeVisible();
  await expect(evidence.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
  await expectNoHorizontalScroll(page);
});
