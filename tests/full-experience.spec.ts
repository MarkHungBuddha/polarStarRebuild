import { expect, test } from './support/fixtures';
import { classifyAll, expectNoHorizontalScroll, expectNoLoneLastCharacter, expectTouchTargets, rankValuesInListedOrder } from './support/experience';
import { confirmDecision, decideWithKeyboard, questionHeading, resultHeading, startInteractiveScenarios, reopenAndContinue } from './support/interactive';

test('開場說明完整體驗共十五個情境與約十五分鐘的設計目標，不再宣稱是原型', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '關於這份題目' }).click();
  await expect(page.getByText('第二幕有十五個情境，每題都有兩件你可能在意、卻無法完全兼顧的事。', { exact: true })).toBeVisible();
  await expect(page.getByText('約十五分鐘完成；這是設計時的估計，尚未實測。', { exact: true })).toBeVisible();
  await expect(page.getByText(/原型/)).toHaveCount(0);
});

test('情境頁顯示目前題序與總題數，返回上一題時進度跟著更新；未完成全部題目前沒有結果捷徑', async ({ page }) => {
  await startInteractiveScenarios(page);
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await confirmDecision(page, '目前無法決定');
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '返回已確認結果' })).toHaveCount(0);
});

test('只答了部分題目時，重新開啟後回到作答而不是結果', async ({ page }) => {
  await startInteractiveScenarios(page);
  await confirmDecision(page, '目前無法決定');
  await reopenAndContinue(page);
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
  await expect(resultHeading(page)).toHaveCount(0);
});

for (const viewport of [{ width: 375, height: 812 }, { width: 1280, height: 900 }]) {
  test(`${viewport.width}px 寬只用鍵盤就能走完十五題、看結果並修改一題，畫面不溢出`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.getByRole('button', { name: '開始這次反思' }).focus();
    await page.keyboard.press('Enter');
    // The first act's own keyboard use is covered in first-act.spec.ts.
    await classifyAll(page, 'core');
    await page.getByRole('button', { name: '下一步：排出順序' }).click();
    await rankValuesInListedOrder(page);
    await page.getByRole('button', { name: '進入情境中的取捨' }).focus();
    await page.keyboard.press('Enter');
    for (let question = 1; question <= 15; question += 1) {
      await expect(page.getByText(`第 ${question} 題，共 15 題`, { exact: true })).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectTouchTargets(page.locator('.scenario-page'));
      await expectNoLoneLastCharacter(page.locator('.scenario-page'));
      await decideWithKeyboard(page);
    }
    await expect(resultHeading(page)).toBeVisible();
    await expectNoHorizontalScroll(page);
    const records = page.locator('details.decision-records summary');
    await records.focus();
    await page.keyboard.press('Enter');
    const first = page.locator('details.decision-records li').first();
    const title = await first.getByRole('heading').textContent();
    await first.getByRole('button', { name: '修改這題' }).focus();
    await page.keyboard.press('Enter');
    await expect(questionHeading(page)).toHaveText(title!);
    await expect(page.getByRole('button', { name: '返回已確認結果' })).toBeVisible();
    await page.getByRole('button', { name: '返回已確認結果' }).focus();
    await page.keyboard.press('Enter');
    await expect(resultHeading(page)).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectTouchTargets(page.locator('main'));
  });
}
