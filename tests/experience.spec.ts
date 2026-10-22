import { expect, test, type Page } from '@playwright/test';

export async function classifyValues(page: Page) {
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const select of await page.getByRole('combobox').all()) {
    await select.selectOption('core');
  }
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
}

test('使用者能分類十個共同價值，並在進入情境前保留並列與自訂價值', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('假設性的自我回報', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('combobox')).toHaveCount(10);
  await expect(page.getByRole('button', { name: '下一步：排出順序' })).toBeDisabled();
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  for (const select of await page.getByRole('combobox').all()) await select.selectOption('core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('combobox', { name: '安全穩定的位置' }).selectOption('2');
  await expect(page.getByText('同一位置代表並列', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await expect(page.getByRole('heading', { name: '下週，照原計畫嗎？' })).toBeVisible();
  await expect(page.getByRole('button', { name: '確認答案' })).toBeDisabled();
});

test('結果只使用最後確認答案，並可呈現相符與不同', async ({ page }) => {
  await page.goto('/');
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await page.getByRole('radio', { name: /留在原團隊/ }).check();
  await page.getByRole('button', { name: '確認答案' }).click();
  await expect(page.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await expect(page.getByText('你把探索刺激放在安全穩定之前；在這題，你選擇了「留在原團隊」。')).toBeVisible();
  await page.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('radio', { name: /去新團隊試兩週/ }).check();
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(page.getByText('與第一幕不同', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('radio', { name: /去新團隊試兩週/ }).check();
  await page.getByRole('button', { name: '確認答案' }).click();
  await expect(page.getByText('與第一幕相符', { exact: true })).toBeVisible();
  await expect(page.getByText('你把探索刺激放在安全穩定之前；在這題，你選擇了「去新團隊試兩週」。')).toBeVisible();
});

test('並列不被判成不同，且自訂價值仍在結果獨立呈現', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  for (const select of await page.getByRole('combobox').all()) await select.selectOption('core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('combobox', { name: '安全穩定的位置' }).selectOption('2');
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await page.getByRole('radio', { name: /留在原團隊/ }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: '確認答案' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('第一幕並列 · 只描述本次選擇', { exact: true })).toBeVisible();
  await expect(page.getByText('你將探索刺激與安全穩定並列；在這題，你選擇了「留在原團隊」。')).toBeVisible();
  await expect(page.getByRole('heading', { name: '你的自訂價值' })).toBeVisible();
  await expect(page.getByText('創作 · 這就是我 · 位置 11')).toBeVisible();
  await expect(page.getByText('與第一幕不同', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
