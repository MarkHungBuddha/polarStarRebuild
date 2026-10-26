import { expect, test } from './support/fixtures';
import { expectFullyShown, expectNoClippedText, expectNoHorizontalScroll, expectNoLoneLastCharacter } from './support/experience';
import { answerInteractiveByTitle, applyDecision, choiceCards, confirmButton, confirmDecision, priorityRows, startInteractiveScenarios } from './support/interactive';

// The preview's 選方案 sample shares slot03 with the six evenings; a high Math.random draws it instead of the evenings.
// Card A is the woodwork class of one's own plan (自主), card B helping a friend pack (照顧身邊的人).
test.use({ scenarioRandom: 0.99 });
const saturday = '這個週六，去上課還是去幫忙？';

test('選方案：選定卡片並確認，該側價值記 1 次，逐題紀錄寫出選了哪個方案', async ({ page }) => {
  await startInteractiveScenarios(page);
  expect(await answerInteractiveByTitle(page, { [saturday]: '選 B' })).toEqual([saturday]);
  expect(await priorityRows(page)).toEqual(['第 1｜照顧身邊的人｜1 次／3 題']);
  await expect(page.locator('.result-evidence')).toContainText('選了「去幫朋友打包」');
});

test('兩張卡片呈現方案內容與代價，不顯示價值名稱；一開始沒有預選，選定後才能確認，也能換卡片', async ({ page }) => {
  await startInteractiveScenarios(page);
  await expect(choiceCards(page)).toHaveCount(2);
  const [a, b] = await choiceCards(page).all();
  await expect(page.locator('.choice-card').first()).toContainText(/照原計畫去上木工課.*小板凳.*代價.*惦記著他/);
  await expect(page.locator('.choice-card').last()).toContainText(/去幫朋友打包.*輕鬆一點.*代價.*等到明年/);
  await expect(a).not.toBeChecked();
  await expect(b).not.toBeChecked();
  await expect(confirmButton(page)).toBeDisabled();
  await page.getByText('照原計畫去上木工課').click();
  await expect(a).toBeChecked();
  await expect(confirmButton(page)).toBeEnabled();
  await page.getByText('陪朋友一起收拾').click();
  await expect(b).toBeChecked();
  await expect(a).not.toBeChecked();
  const screen = page.locator('.scenario-page');
  await expect(screen).not.toContainText(/自主|探索刺激|享受生活|成就|主導權|安全穩定|遵守規範|傳承|照顧身邊的人|普遍關懷/);
  await confirmButton(page).click();
  expect(await priorityRows(page)).toEqual(['第 1｜照顧身邊的人｜1 次／3 題']);
});

test('只用鍵盤也能選卡片、換卡片並確認', async ({ page }) => {
  await startInteractiveScenarios(page);
  await choiceCards(page).first().focus();
  await page.keyboard.press('Space');
  await expect(choiceCards(page).first()).toBeChecked();
  await page.keyboard.press('ArrowDown');
  await expect(choiceCards(page).last()).toBeChecked();
  await page.keyboard.press('ArrowUp');
  await expect(choiceCards(page).first()).toBeChecked();
  await confirmButton(page).focus();
  await page.keyboard.press('Enter');
  expect(await priorityRows(page)).toEqual(['第 1｜自主｜1 次／3 題']);
});

test('返回修改要重新確認才覆蓋；重新整理保留上次已確認的卡片，不保存未確認的換選', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [saturday]: '選 A' });
  await page.getByRole('button', { name: '修改這題' }).click();
  await expect(choiceCards(page).first()).toBeChecked();
  await applyDecision(page, '選 B');
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  expect(await priorityRows(page)).toEqual(['第 1｜自主｜1 次／3 題']);
  await expect(page.locator('.result-evidence')).toContainText('選了「照原計畫去上木工課」');

  await page.getByRole('button', { name: '修改這題' }).click();
  await applyDecision(page, '選 B');
  await page.reload();
  await expect(choiceCards(page).first()).toBeChecked();
  await confirmDecision(page, '選 B');
  expect(await priorityRows(page)).toEqual(['第 1｜照顧身邊的人｜1 次／3 題']);
  await page.reload();
  expect(await priorityRows(page)).toEqual(['第 1｜照顧身邊的人｜1 次／3 題']);
  await expect(page.locator('.result-evidence')).toContainText('選了「去幫朋友打包」');
});

for (const viewport of [{ width: 375, height: 812 }, { width: 1280, height: 900 }]) {
  test(`卡片文字在 ${viewport.width}px 寬不溢出，也沒有單獨一個字換到最後一行`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await startInteractiveScenarios(page);
    await applyDecision(page, '選 A');
    const cards = page.locator('.choice-cards');
    await expectNoHorizontalScroll(page);
    await expectNoClippedText(cards);
    await expectNoLoneLastCharacter(cards);
    for (const card of await page.locator('.choice-card').all()) await expectFullyShown(card);
  });
}
