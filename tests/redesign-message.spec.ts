import { test, expect } from './support/fixtures';
import { startRedesign, openRedesignRecords } from './support/redesign';
import { expectFocusRing, expectNoClippedText, expectNoHorizontalScroll, expectTouchTargets } from './support/experience';

const question = 'redesign-slot02-exhibition';
const sentence = '我想試試看把照片排成一段故事。';

test('完整草稿可直接傳送，結果保留全文；修改草稿須再次確認', async ({ page }) => {
  await startRedesign(page, question);
  await expect(page.getByRole('heading', { name: '這段訊息，你會留下哪些話？' })).toBeVisible();
  await expect(page.getByRole('status', { name: '訊息預覽' })).toContainText('會傳出 7 句');
  await page.getByRole('button', { name: '傳送這段訊息', exact: true }).click();
  const records = await openRedesignRecords(page);
  await expect(records.locator('.evidence-quote')).toContainText(sentence);
  await expect(page.getByText('明確決策 0 / 1 題', { exact: true })).toBeVisible();
  await records.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('button', { name: sentence, exact: true }).click();
  await expect(page.getByRole('button', { name: sentence, exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('status', { name: '訊息預覽' })).not.toContainText(sentence);
  await page.getByRole('button', { name: '返回已確認結果', exact: true }).click();
  await expect((await openRedesignRecords(page)).locator('.evidence-quote')).toContainText(sentence);
});

test('鍵盤可保留混合考量、還原句子並確認，返回修改重建相同內容', async ({ page }) => {
  await startRedesign(page, question);
  const bubble = page.getByRole('group', { name: '尚未傳送的訊息' });
  const first = bubble.getByRole('button').nth(0);
  await page.keyboard.press('Tab');
  await first.focus();
  await expectFocusRing(first);
  await page.keyboard.press('Space');
  await expect(first).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await first.press('Enter');
  await bubble.getByRole('button').nth(2).press('Enter');
  await expect(page.getByRole('status', { name: '訊息預覽' })).toContainText('會傳出 5 句');
  await page.getByRole('button', { name: '傳送這段訊息', exact: true }).press('Enter');
  const records = await openRedesignRecords(page);
  await expect(records.locator('.evidence-quote')).toHaveText('傳送的訊息：我想試試看把照片排成一段故事。我記得我們先前約好要用同一種版型。如果要維持一致，我可以再調整。也想請你看看這種排法，再一起討論。多出來的排版工作，我可以自己處理。');
  await expect(page.getByText('明確決策 0 / 1 題', { exact: true })).toBeVisible();
  await records.getByRole('button', { name: '修改這題' }).press('Enter');
  await expect(first).toHaveAttribute('aria-pressed', 'false');
  await expect(bubble.getByRole('button').nth(2)).toHaveAttribute('aria-pressed', 'false');
  await expect(bubble.getByRole('button', { pressed: true })).toHaveCount(5);
});

test.describe('手機觸控', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('觸控可刪還原及傳送，窄螢幕與深淺色的全文和控制項可閱讀', async ({ page }) => {
    await startRedesign(page, question);
    const bubble = page.getByRole('group', { name: '尚未傳送的訊息' });
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme });
        await expectNoHorizontalScroll(page);
        await expectNoClippedText(page.locator('.scenario-page'));
        await expectTouchTargets(page.locator('.scenario-page'));
        const first = bubble.getByRole('button').nth(0);
        await first.tap();
        await expect(first).toHaveAttribute('aria-pressed', 'false');
        await first.tap();
        await expect(first).toHaveAttribute('aria-pressed', 'true');
      }
    }
    await bubble.getByRole('button').nth(1).tap();
    await page.getByRole('button', { name: '傳送這段訊息', exact: true }).tap();
    await expect((await openRedesignRecords(page)).locator('.evidence-quote')).not.toContainText(sentence);
  });
});

test('多句可刪除、還原及全刪，不傳訊息與無法決定分開記錄', async ({ page }) => {
  await startRedesign(page, question);
  const bubble = page.getByRole('group', { name: '尚未傳送的訊息' });
  await bubble.getByRole('button').nth(0).click();
  await bubble.getByRole('button').nth(1).click();
  await expect(page.getByRole('status', { name: '訊息預覽' })).toContainText('會傳出 5 句');
  await page.getByRole('button', { name: '撤回最近一步' }).click();
  await expect(bubble.getByRole('button').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '重設草稿' }).click();
  await expect(page.getByRole('status', { name: '訊息預覽' })).toContainText('會傳出 7 句');
  for (const button of await bubble.getByRole('button').all()) await button.click();
  await expect(page.getByRole('button', { name: '傳送這段訊息', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '這次不傳', exact: true }).click();
  const records = await openRedesignRecords(page);
  await expect(records.locator('.evidence-quote')).toHaveText('這次不傳訊息');
  await expect(records).toContainText('無法對照');
  await expect(page.getByText(/保留具體決策但不判方向/)).toBeVisible();
  await records.getByRole('button', { name: '修改這題' }).click();
  await expect(bubble.getByRole('button', { pressed: true })).toHaveCount(0);
  await bubble.getByRole('button').nth(0).click();
  await page.getByRole('button', { name: '還原已確認安排' }).click();
  await expect(bubble.getByRole('button', { pressed: true })).toHaveCount(0);
  await page.getByRole('button', { name: '目前無法決定', exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect((await openRedesignRecords(page)).locator('.evidence-quote')).toHaveText('目前無法決定');
});
