import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { classifyAll, completeRemainingScenarios, confirmCurrentScenario, goToScenario, openDetailedReport, rankValuesInListedOrder, expectPosition, pressOnHandle, rankRow } from './support/experience';

async function beginAndClassify(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await rankValuesInListedOrder(page);
  await pressOnHandle(page, '安全穩定', 'Home');
}

test('重新開啟後可續答，保留第一幕順序、自訂價值與相同題目', async ({ page }) => {
  await beginAndClassify(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  const title = await page.getByRole('heading', { level: 1 }).textContent();
  await page.reload();
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toBeVisible();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title!);
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expectPosition(page, '安全穩定', 1);
  await expectPosition(page, '創作', 2);
  await expect(rankRow(page, '創作')).toBeVisible();
});

// Stored blobs below are opaque stand-ins for a damaged record or one written by another app version; they do not mirror the session format.
test('損壞的本機紀錄不會被當成可續答的答案', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('polarstar.session.v2', 'damaged{'));
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('先前的本機紀錄無法讀取或版本不相容');
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toHaveCount(0);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('group', { name: /的重要性$/ })).toHaveCount(10);
});

test('未確認的修改不會覆寫重新開啟後的已確認答案', async ({ page }) => {
  await beginAndClassify(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '下週，照原計畫嗎？');
  await confirmCurrentScenario(page, '強烈偏向 B');
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '下週，照原計畫嗎？' }) });
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('radio', { name: '強烈偏向 A', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(page.getByRole('radio', { name: '強烈偏向 B', exact: true })).toBeChecked();
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await openDetailedReport(page);
  await expect(evidence.getByText('已確認答案：強烈偏向 B。安全穩定加 2 分。')).toBeVisible();
  await expect(evidence.locator('.evidence-label')).toHaveText('與第一幕相符');
});

test('清除紀錄後可重新開始，重新開啟不會沿用舊分類', async ({ page }) => {
  await beginAndClassify(page);
  await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toHaveCount(0);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('group', { name: /的重要性$/ })).toHaveCount(10);
  await expect(page.getByRole('group', { name: /的重要性$/ }).getByRole('button', { pressed: true })).toHaveCount(0);
});

test('儲存寫入失敗時告知無法保存，仍能完成當次作答', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  });
  await beginAndClassify(page);
  await expect(page.getByRole('status')).toContainText('目前無法保存本機紀錄');
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await completeRemainingScenarios(page);
  await expect(page.getByRole('heading', { name: '這一次，你的選擇。' })).toBeVisible();
});

test('無法讀取本機儲存時仍可開始，不會卡在續答入口', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Denied', 'SecurityError'); };
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('目前無法讀取本機紀錄');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('group', { name: /的重要性$/ })).toHaveCount(10);
});

test('其他版本留下的本機紀錄不會把舊答案套用到目前題目', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('polarstar.session.v2', JSON.stringify({ writtenBy: 'another app version', answers: ['opaque'] })));
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('先前的本機紀錄無法讀取或版本不相容');
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeVisible();
});

test('清除本機作答紀錄時，也刪除舊版題庫留下的作答與已看紀錄', async ({ page }) => {
  // Opaque stand-ins for what the mixed-mechanism bank left; they do not mirror any record format.
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('polarstar.session.v1', 'earlier bank');
    localStorage.setItem('polarstar.seen.v1', 'earlier bank');
    sessionStorage.setItem('seeded', '1');
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('上次的作答來自舊版題目');
  await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
  const keys = await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('polarstar.')));
  expect(keys.filter(key => key.endsWith('.v1'))).toEqual([]);
  await page.reload();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeEnabled();
});
