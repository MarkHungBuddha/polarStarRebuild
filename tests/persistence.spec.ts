import { expect, test, type Page } from '@playwright/test';

async function beginAndClassify(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  for (const select of await page.getByRole('combobox').all()) await select.selectOption('core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('combobox', { name: '安全穩定的位置' }).selectOption('2');
}

test('重新開啟後可續答，保留第一幕並列、自訂價值與相同題目', async ({ page }) => {
  await beginAndClassify(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  const title = await page.getByRole('heading', { level: 1 }).textContent();
  await page.reload();
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toBeVisible();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title!);
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(page.getByRole('combobox', { name: '安全穩定的位置' })).toHaveValue('2');
  await expect(page.getByRole('combobox', { name: '創作的位置' })).toBeVisible();
});

test('損壞或不相容的本機紀錄不會被當成可續答的答案', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('polarstar.session.v1', JSON.stringify({ schemaVersion: 1, session: { screen: 'scenario' } })));
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('先前的本機紀錄無法讀取或版本不相容');
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toHaveCount(0);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('combobox')).toHaveCount(10);
});

test('未確認的修改不會覆寫重新開啟後的已確認答案', async ({ page }) => {
  await beginAndClassify(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await page.getByRole('radio', { name: /留在原團隊/ }).check();
  await page.getByRole('button', { name: '確認答案' }).click();
  await page.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('radio', { name: /去新團隊試兩週/ }).check();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByRole('radio', { name: /留在原團隊/ })).toBeChecked();
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await expect(page.getByText('你將探索刺激與安全穩定並列；在這題，你選擇了「留在原團隊」。')).toBeVisible();
});

test('清除紀錄後可重新開始，重新開啟不會沿用舊分類', async ({ page }) => {
  await beginAndClassify(page);
  await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toHaveCount(0);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('combobox')).toHaveCount(10);
  for (const select of await page.getByRole('combobox').all()) await expect(select).toHaveValue('');
});

test('儲存寫入失敗時告知無法保存，仍能完成當次作答', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  });
  await beginAndClassify(page);
  await expect(page.getByRole('status')).toContainText('目前無法保存本機紀錄');
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await page.getByRole('radio', { name: /留在原團隊/ }).check();
  await page.getByRole('button', { name: '確認答案' }).click();
  await expect(page.getByRole('heading', { name: '這一次，你的選擇。' })).toBeVisible();
});

test('無法讀取本機儲存時仍可開始，不會卡在續答入口', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Denied', 'SecurityError'); };
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('目前無法讀取本機紀錄');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('combobox')).toHaveCount(10);
});
