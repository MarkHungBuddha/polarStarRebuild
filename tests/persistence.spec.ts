import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { amountFeedback, classifyAll, completeRemainingScenarios, goToScenario, openDetailedReport, rankValuesInListedOrder, sceneOption, setAmount } from './support/experience';

async function beginAndClassify(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await rankValuesInListedOrder(page);
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

// Stored blobs below are opaque stand-ins for a damaged record or one written by another app version; they do not mirror the session format.
test('損壞的本機紀錄不會被當成可續答的答案', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('polarstar.session.v1', 'damaged{'));
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
  await sceneOption(page, /留在原團隊/).click();
  await page.getByRole('button', { name: '確認答案' }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '下週，照原計畫嗎？' }) });
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await sceneOption(page, /去新團隊試兩週/).click();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(sceneOption(page, /留在原團隊/)).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await openDetailedReport(page);
  await expect(page.getByText('你將探索刺激與安全穩定並列；在這題，你選擇了「留在原團隊」。')).toBeVisible();
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
  await goToScenario(page, '下週，照原計畫嗎？');
  await sceneOption(page, /留在原團隊/).click();
  await page.getByRole('button', { name: '確認答案' }).click();
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

test('滑桿已確認的原始條件可續答，未確認的新刻度不覆寫它', async ({ page }) => {
  await beginAndClassify(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await goToScenario(page, '先準備多少，再換一種工作？');
  await setAmount(page, 12);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await completeRemainingScenarios(page);
  const evidence = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '先準備多少，再換一種工作？', exact: true }) });
  await evidence.getByRole('button', { name: '修改這題' }).click();
  await setAmount(page, 'max');
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(amountFeedback(page)).toContainText(' 12 ');
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await openDetailedReport(page);
  await expect(evidence.getByText('你希望先準備 12 個月生活費，再考慮轉為接案。', { exact: true })).toBeVisible();
});

test('其他版本留下的本機紀錄不會把舊答案套用到目前題目', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('polarstar.session.v1', JSON.stringify({ writtenBy: 'another app version', answers: ['opaque'] })));
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('先前的本機紀錄無法讀取或版本不相容');
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeVisible();
});
