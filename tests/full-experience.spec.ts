import { expect, test } from './support/fixtures';
import { classifyAndRankValues, completeRemainingScenarios, confirmCurrentScenario, expectNoHorizontalScroll, expectTouchTargets, goToScenario } from './support/experience';

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
  await confirmCurrentScenario(page, '稍微偏向 A');
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
});

test('未完成全部十五題前不提供結果捷徑；從結果修改一題並確認後直接回到結果，其他答案保留', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await confirmCurrentScenario(page, '稍微偏向 A');
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '返回已確認結果' })).toHaveCount(0);
  await goToScenario(page, '下週，照原計畫嗎？', '稍微偏向 A');
  await confirmCurrentScenario(page, '強烈偏向 B');
  await completeRemainingScenarios(page);
  await expect(page.getByRole('article')).toHaveCount(15);
  const changed = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '下週，照原計畫嗎？', exact: true }) });
  const first = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '固定薪水，還是自己接案？', exact: true }) });
  await expect(first.getByText('已確認答案：稍微偏向 A。自主加 1 分。', { exact: true })).toBeVisible();
  await changed.getByRole('button', { name: '修改這題' }).click();
  await expect(page.getByText('第 4 題，共 15 題', { exact: true })).toBeVisible();
  await confirmCurrentScenario(page, '強烈偏向 A');
  await expect(page.getByRole('heading', { name: '這一次，你的選擇。', exact: true })).toBeVisible();
  await expect(changed.getByText('已確認答案：強烈偏向 A。探索刺激加 2 分。', { exact: true })).toBeVisible();
  await expect(first.getByText('已確認答案：稍微偏向 A。自主加 1 分。', { exact: true })).toBeVisible();
});

test('只答了部分題目時，重新開啟後回到作答而不是結果', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await confirmCurrentScenario(page, '稍微偏向 A');
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
  await expect(evidence.getByText('第 13 題 · 社群 · 偏向程度', { exact: true })).toBeVisible();
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await expect(page.getByText('第 13 題，共 15 題', { exact: true })).toBeVisible();
  await confirmCurrentScenario(page, '強烈偏向 B');
  await expect(evidence).toBeInViewport();
  await expect(evidence.getByText('已確認答案：強烈偏向 B。傳承加 2 分。', { exact: true })).toBeVisible();
  await expect(page.getByText(/總排名|名次差|診斷結果/)).toHaveCount(0);
  await expectNoHorizontalScroll(page);
});

test('手機上只用鍵盤就能走完十五題、看結果並修改一題', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).focus();
  await page.keyboard.press('Enter');
  const confirm = page.getByRole('button', { name: '確認答案', exact: true });
  for (let question = 1; question <= 15; question += 1) {
    await expect(page.getByText(`第 ${question} 題，共 15 題`, { exact: true })).toBeVisible();
    // Tab reaches the scale as one group; arrows move within it, and Space picks the focused option.
    await page.getByRole('button', { name: '返回上一頁' }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('radio', { name: '強烈偏向 B', exact: true })).toBeFocused();
    await page.keyboard.press('Space');
    for (let step = 0; step < question % 5; step += 1) await page.keyboard.press('ArrowLeft');
    await expect(confirm).toBeEnabled();
    await expectNoHorizontalScroll(page);
    await expectTouchTargets(page.locator('.scenario-page .actions'));
    await confirm.focus();
    await page.keyboard.press('Enter');
  }
  await expect(page.getByRole('heading', { name: '這一次，你的選擇。', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '閱讀詳細報告 →' }).focus();
  await page.keyboard.press('Enter');
  const edit = page.getByRole('button', { name: '修改這題' }).first();
  await edit.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: '稍微偏向 B', exact: true })).toBeChecked();
  await expect(page.getByRole('button', { name: '返回已確認結果' })).toBeVisible();
  await expectNoHorizontalScroll(page);
});
