import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { classifyAll, expectPosition, pressOnHandle, rankRow, rankValuesInListedOrder } from './support/experience';
import { answerInteractiveByTitle, questionHeading, resultHeading } from './support/interactive';

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

test('重新開啟後回到同一題續答，保留第一幕順序、自訂價值與相同題目', async ({ page }) => {
  await beginAndClassify(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  const title = await questionHeading(page).textContent();
  await page.reload();
  await expect(questionHeading(page)).toHaveText(title!);
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expectPosition(page, '安全穩定', 1);
  await expectPosition(page, '創作', 2);
  await expect(rankRow(page, '創作')).toBeVisible();
});

// The stored blob is an opaque stand-in for a record written by another app version; it does not mirror the session format.
test('其他版本留下的互動紀錄不會把舊答案套用到目前題目', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('polarstar.session.v3', JSON.stringify({ writtenBy: 'another app version', answers: ['opaque'] })));
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('先前的作答紀錄無法讀取或題目已改版，這次從頭開始；重新作答後會取代它。');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('group', { name: /的重要性$/ }).getByRole('button', { pressed: true })).toHaveCount(0);
});

test('清除紀錄後可重新開始，重新開啟不會沿用舊分類', async ({ page }) => {
  await beginAndClassify(page);
  await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
  await page.reload();
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
  await answerInteractiveByTitle(page);
  await expect(resultHeading(page)).toBeVisible();
});

test('無法讀取本機儲存時仍可開始，不會卡在續答', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Denied', 'SecurityError'); };
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('目前無法讀取本機紀錄，仍可完成這次作答，但可能無法保存。');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('group', { name: /的重要性$/ })).toHaveCount(10);
});
