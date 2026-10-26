import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { classifyAll, expectHorizontalText, expectLongParagraphsInSans, expectNoClippedText, expectNoHorizontalScroll, expectTouchTargets } from './support/experience';
import { answerInteractiveByTitle } from './support/interactive';

const longCustomValue = 'Supercalifragilisticexpi';

/** First act with a 24-character custom value and every value tied, then every question 目前無法決定; stops on the result. */
async function reachResultWithLongNames(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await page.getByRole('textbox', { name: '自訂價值' }).fill(longCustomValue);
  await page.getByRole('button', { name: '新增價值' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerInteractiveByTitle(page);
}

test('結果把解讀限制寫在註記裡', async ({ page }) => {
  await reachResultWithLongNames(page);
  await expect(page.getByRole('note').filter({ hasText: '不是人格判定' })).toBeVisible();
  await expect(page.getByRole('note').filter({ hasText: '題目與解讀尚未驗證' })).toBeVisible();
});

for (const width of [320, 390, 1280]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`結果、逐題紀錄與分享區在 ${width}px ${colorScheme === 'light' ? '淺色' : '深色'}下長名稱皆可讀，不橫向溢出，點擊區至少 44 × 44px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ colorScheme });
      await reachResultWithLongNames(page);
      const columns = page.getByRole('region', { name: '你的前三名' }).getByRole('heading', { level: 3 });
      const [stated, chosen] = [await columns.nth(0).boundingBox(), await columns.nth(1).boundingBox()];
      if (width >= 1280) expect(Math.abs(stated!.y - chosen!.y), '桌面兩份前三名並排比較').toBeLessThan(2);
      else expect(chosen!.y, '手機單欄').toBeGreaterThan(stated!.y + stated!.height);
      await page.getByRole('button', { name: '分享這份題目', exact: true }).click();
      await expectNoHorizontalScroll(page);
      await expectNoClippedText(page.locator('main'));
      await expectTouchTargets(page.locator('main'));
      await expectHorizontalText(page.locator('body'));
      await expectLongParagraphsInSans(page.locator('main'));
      await page.locator('details.decision-records summary').click();
      await page.locator('details.counting-rules summary').click();
      await expect(page.getByText(longCustomValue)).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectNoClippedText(page.locator('main'));
      await expectTouchTargets(page.locator('main'));
      await expectHorizontalText(page.locator('body'));
      await expectLongParagraphsInSans(page.locator('main'));
    });
  }
}
