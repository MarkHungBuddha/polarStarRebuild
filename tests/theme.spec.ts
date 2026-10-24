import { expect, test } from './support/fixtures';
import { amountFeedback, classifyAndRankValues, setAmount } from './support/experience';

test('主題跟隨系統，手動選擇可保存，恢復跟隨後回應系統變更', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const theme = page.getByRole('combobox', { name: '顯示主題' });
  await expect(theme).toHaveValue('system');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await theme.selectOption('light');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  await page.reload();
  await expect(theme).toHaveValue('light');
  await theme.selectOption('system');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
});

test('保存的深色在應用程式載入前就套用，不先閃出淺色', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: '顯示主題' }).selectOption('dark');
  await page.route('**/src/main.tsx', route => route.abort());
  await page.reload();
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});

test('無法使用本機儲存時跟隨系統，提示偏好無法保存，仍可開始作答', async ({ page }) => {
  await page.addInitScript(() => {
    const fail = () => { throw new DOMException('blocked', 'SecurityError'); };
    Object.defineProperty(window, 'localStorage', { get: () => ({ getItem: fail, setItem: fail, removeItem: fail }) });
  });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const theme = page.getByRole('combobox', { name: '顯示主題' });
  await expect(theme).toHaveValue('system');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await theme.selectOption('light');
  await expect(page.getByText('無法儲存主題偏好', { exact: false })).toBeVisible();
  await expect(theme).toHaveValue('system');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('heading', { name: '哪些事，對你重要？' })).toBeVisible();
});

test('作答中切換主題，不改變作答位置與已確認答案', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await setAmount(page, 3);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: '顯示主題' }).selectOption('dark');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(amountFeedback(page)).toContainText('3');
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});
