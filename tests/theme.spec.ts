import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { classifyAndRankValues, confirmCurrentScenario } from './support/experience';

const themeButton = (page: Page, name: '淺色' | '深色') => page.getByRole('group', { name: '顯示主題' }).getByRole('button', { name, exact: true });

test('主題預設跟隨系統並隨系統變更，點太陽或月亮後保存選擇', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const light = themeButton(page, '淺色');
  const dark = themeButton(page, '深色');
  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(light).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  await dark.click();
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.reload();
  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await expect(light).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});

test('保存的深色在應用程式載入前就套用，不先閃出淺色', async ({ page }) => {
  await page.goto('/');
  await themeButton(page, '深色').click();
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
  await expect(themeButton(page, '深色')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await themeButton(page, '淺色').click();
  await expect(page.getByText('無法儲存主題偏好', { exact: false })).toBeVisible();
  await expect(themeButton(page, '深色')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('heading', { name: '哪些事，對你重要？' })).toBeVisible();
});

test('作答中切換主題，不改變作答位置與已確認答案', async ({ page }) => {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await confirmCurrentScenario(page, '稍微偏向 B');
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
  await themeButton(page, '深色').click();
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(page.getByRole('radio', { name: '稍微偏向 B', exact: true })).toBeChecked();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});
