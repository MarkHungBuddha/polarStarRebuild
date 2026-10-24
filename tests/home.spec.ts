import { expect, test } from './support/fixtures';
import { expectNoHorizontalScroll, expectTouchTargets } from './support/experience';

test('首頁保留簡短說明，可用鍵盤開關「關於這份題目」，不換頁並可開始作答', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/你重視什麼/);
  await expect(page.getByText('參考 Schwartz 價值理論設計的自編反思工具，不是診斷。')).toBeVisible();
  const about = page.getByRole('button', { name: '關於這份題目' });
  const limits = page.getByText('預計約十五分鐘完成；這是設計時的估計，尚未實測。', { exact: true });
  await expect(about).toHaveAttribute('aria-expanded', 'false');
  await expect(limits).toBeHidden();
  const url = page.url();
  await about.focus();
  await page.keyboard.press('Enter');
  await expect(about).toHaveAttribute('aria-expanded', 'true');
  await expect(limits).toBeVisible();
  await expect(page.getByText(/題目與解讀尚未驗證/)).toBeVisible();
  await page.keyboard.press('Space');
  await expect(about).toHaveAttribute('aria-expanded', 'false');
  await expect(limits).toBeHidden();
  expect(page.url()).toBe(url);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('heading', { name: '哪些事，對你重要？' })).toBeVisible();
});

test('字型載入很慢時，首頁文字仍以備援字型顯示並可操作', async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, () => new Promise(() => {}));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 3000 });
  await page.getByRole('button', { name: '開始這次反思' }).click({ timeout: 3000 });
  await expect(page.getByRole('heading', { name: '哪些事，對你重要？' })).toBeVisible();
});

for (const width of [320, 390, 1280]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`首頁在 ${width}px ${colorScheme === 'light' ? '淺色' : '深色'}下不橫向捲動，可點擊區至少 44 × 44px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ colorScheme });
      await page.goto('/');
      await page.getByRole('button', { name: '關於這份題目' }).click();
      await expectNoHorizontalScroll(page);
      await expectTouchTargets(page.locator('main'));
    });
  }
}
