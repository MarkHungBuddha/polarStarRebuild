import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { answerRemainingScenarios, classifyAll, expectNoHorizontalScroll, openDetailedReport } from './support/experience';

const longCustomValue = 'Supercalifragilisticexpi';

/** First act with a 24-character custom value and every value tied, then all scenarios; stops on the result cover. */
async function reachResultWithLongNamesAndTies(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await page.getByRole('textbox', { name: '自訂價值' }).fill(longCustomValue);
  await page.getByRole('button', { name: '新增價值' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerRemainingScenarios(page);
}

/** No text inside main is cut off: no element scrolls sideways inside its own box (form fields scroll their value by design). */
async function expectNoClippedText(page: Page) {
  const clipped = await page.locator('main').evaluate(main => [...main.querySelectorAll<HTMLElement>(':not(input, select, textarea)')]
    .filter(element => element.offsetParent !== null && element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).overflowX !== 'visible')
    .map(element => element.textContent?.slice(0, 40)));
  expect(clipped).toEqual([]);
}

async function expectTargetsAtLeast44(page: Page) {
  for (const control of await page.locator('main').getByRole('button').or(page.locator('main').getByRole('link')).or(page.locator('main').getByRole('textbox')).all()) {
    if (!await control.isVisible()) continue;
    const box = await control.boundingBox();
    const name = await control.textContent() ?? '';
    expect(box?.width, name).toBeGreaterThanOrEqual(44);
    expect(box?.height, name).toBeGreaterThanOrEqual(44);
  }
}

test('結果摘要把解讀限制寫在註記裡，沒有圖片匯出', async ({ page }) => {
  await reachResultWithLongNamesAndTies(page);
  await expect(page.getByRole('note').filter({ hasText: '不是人格判定' })).toBeVisible();
  await expect(page.getByRole('button', { name: /圖片/ })).toHaveCount(0);
  await openDetailedReport(page);
  await expect(page.getByRole('note').filter({ hasText: '改一題就可能換名次' })).toBeVisible();
  await expect(page.getByRole('note').filter({ hasText: '題目與解讀尚未驗證' })).toBeVisible();
  await expect(page.getByRole('button', { name: /圖片/ })).toHaveCount(0);
});

for (const width of [320, 390, 1280]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`結果摘要、詳細回顧與分享區在 ${width}px ${colorScheme === 'light' ? '淺色' : '深色'}下長名稱與並列皆可讀，不橫向溢出，點擊區至少 44 × 44px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ colorScheme });
      await reachResultWithLongNamesAndTies(page);
      const columns = page.getByRole('region', { name: '你的前三名' }).getByRole('heading', { level: 3 });
      const [stated, chosen] = [await columns.nth(0).boundingBox(), await columns.nth(1).boundingBox()];
      if (width >= 1280) expect(Math.abs(stated!.y - chosen!.y), '桌面兩份前三名並排比較').toBeLessThan(2);
      else expect(chosen!.y, '手機單欄').toBeGreaterThan(stated!.y + stated!.height);
      await page.getByRole('button', { name: '分享這份題目', exact: true }).click();
      await expectNoHorizontalScroll(page);
      await expectNoClippedText(page);
      await expectTargetsAtLeast44(page);
      await openDetailedReport(page);
      await expect(page.getByText(longCustomValue)).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectNoClippedText(page);
      await expectTargetsAtLeast44(page);
    });
  }
}
