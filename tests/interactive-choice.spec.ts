import { expect, test } from './support/fixtures';
import { expectFullyShown, expectNoClippedText, expectNoHorizontalScroll, expectNoLoneLastCharacter } from './support/experience';
import { answerInteractiveByTitle, applyDecision, choiceCards, confirmButton, confirmDecision, decisionRecord, editQuestion, priorityRows, startInteractiveScenarios, undecidedButton, reopenAndContinue } from './support/interactive';

// Math.random 0.99 draws every slot's third variant; slot 1's is the round's first question, a 選方案 question between two homes.
// Card A moves to a place one can arrange oneself (自主), card B renews a three-year lease with fixed rent (安全穩定). Every other
// question is answered 目前無法決定, so the counts come from this one.
test.use({ scenarioRandom: 0.99 });
const lease = '這次租約，續住還是搬家？';

test('選方案：選定卡片並確認，該側價值記 1 次，逐題紀錄寫出選了哪個方案', async ({ page }) => {
  await startInteractiveScenarios(page);
  expect(await answerInteractiveByTitle(page, { [lease]: '選 B' })).toContain(lease);
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await expect(await decisionRecord(page, lease)).toContainText('選了「續簽三年不調租的現住處」');
});

test('兩張卡片呈現方案內容與代價，不顯示價值名稱；一開始沒有預選，選定後才能確認，也能換卡片', async ({ page }) => {
  await startInteractiveScenarios(page);
  await expect(choiceCards(page)).toHaveCount(2);
  const [a, b] = await choiceCards(page).all();
  await expect(page.locator('.choice-card').first()).toContainText(/搬到能自己安排空間的新住處.*照自己的方式布置.*代價.*房租可能調漲/);
  await expect(page.locator('.choice-card').last()).toContainText(/續簽三年不調租的現住處.*三年內都有保障.*代價.*照房東的規定/);
  await expect(a).not.toBeChecked();
  await expect(b).not.toBeChecked();
  await expect(confirmButton(page)).toBeDisabled();
  await page.getByText('搬到能自己安排空間的新住處').click();
  await expect(a).toBeChecked();
  await expect(confirmButton(page)).toBeEnabled();
  await page.getByText('房租和租期，三年內都有保障。').click();
  await expect(b).toBeChecked();
  await expect(a).not.toBeChecked();
  const screen = page.locator('.scenario-page');
  await expect(screen).not.toContainText(/自主|探索刺激|享受生活|成就|主導權|安全穩定|遵守規範|傳承|照顧身邊的人|普遍關懷/);
  await confirmButton(page).click();
  await answerInteractiveByTitle(page);
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
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
  await answerInteractiveByTitle(page);
  expect(await priorityRows(page)).toEqual(['第 1｜自主｜1 次／3 題']);
});

test('返回修改要重新確認才覆蓋；重新整理保留上次已確認的卡片，不保存未確認的換選', async ({ page }) => {
  await startInteractiveScenarios(page);
  await answerInteractiveByTitle(page, { [lease]: '選 A' });
  await editQuestion(page, lease);
  await expect(choiceCards(page).first()).toBeChecked();
  await applyDecision(page, '選 B');
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  expect(await priorityRows(page)).toEqual(['第 1｜自主｜1 次／3 題']);
  await expect(await decisionRecord(page, lease)).toContainText('選了「搬到能自己安排空間的新住處」');

  await editQuestion(page, lease);
  await applyDecision(page, '選 B');
  await reopenAndContinue(page);
  await expect(choiceCards(page).first()).toBeChecked();
  await confirmDecision(page, '選 B');
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await reopenAndContinue(page);
  expect(await priorityRows(page)).toEqual(['第 1｜安全穩定｜1 次／3 題']);
  await expect(await decisionRecord(page, lease)).toContainText('選了「續簽三年不調租的現住處」');
});

test('選方案也能選目前無法決定：確認後不加次數，逐題記錄寫目前無法決定；回到題目改選卡片就取消它', async ({ page }) => {
  await startInteractiveScenarios(page);
  await applyDecision(page, '選 A');
  await confirmDecision(page, '目前無法決定');
  const rest = await answerInteractiveByTitle(page);
  expect(await priorityRows(page)).toEqual([]);
  await expect(page.getByText(`明確決策 0 / ${rest.length + 1} 題`, { exact: true })).toBeVisible();
  const record = await decisionRecord(page, lease);
  await expect(record.locator('.evidence-quote')).toHaveText('目前無法決定');
  await expect(record).not.toContainText(/選了|一致|不同/);

  await editQuestion(page, lease);
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(choiceCards(page).first()).not.toBeChecked();
  await expect(confirmButton(page)).toBeEnabled();
  await page.getByText('房租和租期，三年內都有保障。').click();
  await expect(undecidedButton(page)).toHaveAttribute('aria-pressed', 'false');
  await confirmButton(page).click();
  await expect(await decisionRecord(page, lease)).toContainText('選了「續簽三年不調租的現住處」');
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
