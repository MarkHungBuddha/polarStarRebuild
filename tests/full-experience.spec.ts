import { expect, test } from './support/fixtures';
import { classifyAndRankValues, completeRemainingScenarios, expectNoHorizontalScroll, goToScenario, sceneOption, sceneOptions, setAmount } from './support/experience';

test('開場說明完整體驗共十五個情境與約十五分鐘的設計目標，不再宣稱是原型', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '關於這份題目' }).click();
  await expect(page.getByText('第二幕有十五個情境，每題都有兩件你可能在意、卻無法完全兼顧的事。', { exact: true })).toBeVisible();
  await expect(page.getByText('約十五分鐘完成；這是設計時的估計，尚未實測。', { exact: true })).toBeVisible();
  await expect(page.getByText(/原型/)).toHaveCount(0);
});

test('情境頁顯示目前題序與總題數，返回上一題時進度跟著更新', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await setAmount(page, 7);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
});

test('未完成全部十五題前不提供結果捷徑；從結果修改一題並確認後直接回到結果，其他答案保留', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await setAmount(page, 7);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '返回已確認結果' })).toHaveCount(0);
  await goToScenario(page, '下週，照原計畫嗎？');
  await sceneOption(page, /留在原團隊/).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  await expect(page.getByRole('article')).toHaveCount(15);
  const choice = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '下週，照原計畫嗎？', exact: true }) });
  const slider = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '先準備多少，再換一種工作？', exact: true }) });
  await expect(slider.getByText('你希望先準備 7 個月生活費，再考慮轉為接案。', { exact: true })).toBeVisible();
  await choice.getByRole('button', { name: '修改這題' }).click();
  await expect(page.getByText('第 4 題，共 15 題', { exact: true })).toBeVisible();
  await sceneOption(page, /去新團隊試兩週/).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByRole('heading', { name: '這一次，你的選擇。', exact: true })).toBeVisible();
  await expect(choice.getByText('你把探索刺激放在安全穩定之前；在這題，你選擇了「去新團隊試兩週」。', { exact: true })).toBeVisible();
  await expect(slider.getByText('你希望先準備 7 個月生活費，再考慮轉為接案。', { exact: true })).toBeVisible();
});

test('只答了部分題目時，重新開啟後回到作答而不是結果', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await setAmount(page, 7);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(page.getByRole('button', { name: '返回已確認結果' })).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '這一次，你的選擇。' })).toHaveCount(0);
});

test('十五則證據各有題序與目錄，可從目錄找到並修改其中一題，回到結果時停在該題', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await completeRemainingScenarios(page);
  const contents = page.getByRole('navigation', { name: '本次十五個情境' });
  await expect(contents.getByRole('link')).toHaveCount(15);
  await contents.getByRole('link', { name: '第 13 題 · 今年的活動，誰說了算？' }).click();
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '今年的活動，誰說了算？', exact: true }) });
  await expect(evidence).toBeInViewport();
  await expect(evidence.getByText('第 13 題 · 社群 · 主導權與傳承', { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await expect(page.getByText('第 13 題，共 15 題', { exact: true })).toBeVisible();
  await sceneOptions(page).last().click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(evidence).toBeInViewport();
  await expect(page.getByText(/總排名|名次差|強度|診斷結果/)).toHaveCount(0);
  await expectNoHorizontalScroll(page);
});
