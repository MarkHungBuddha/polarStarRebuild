import { test, expect } from './support/fixtures';
import { arrangeTravel, openRedesignRecords, startRedesign } from './support/redesign';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { expectPosition } from './support/experience';

// Captured by actually answering the deployed v3 UI; never assembled from the current session structure.
const legacyV3 = readFileSync(new URL('./support/legacy-v3-session.json', import.meta.url), 'utf8');

test('重新開啟後續答已確認的每天安排，未確認修改不覆寫保存版本', async ({ page }) => {
  await startRedesign(page);
  await arrangeTravel(page, ['自己排行程', '跟一日團', '自己排行程', '跟一日團', '自己排行程', '跟一日團']);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  const records = await openRedesignRecords(page);
  await expect(records.locator('.evidence-quote')).toContainText('第1天：自己排行程；第2天：跟一日團');
  await records.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('button', { name: '第1天：自己排行程', exact: true }).click();
  await page.getByRole('button', { name: '第2天：跟一日團', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答', exact: true }).click();
  await expect(page.getByRole('button', { name: '第1天：自己排行程', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '第2天：跟一日團', exact: true })).toBeVisible();
});

test('舊互動版只沿用第一幕，告知後由使用者選擇，原正式紀錄不被開發續答覆寫', async ({ page }) => {
  await page.addInitScript(raw => {
    if (!sessionStorage.getItem('seeded')) localStorage.setItem('polarstar.session.v3', raw);
    sessionStorage.setItem('seeded', '1');
  }, legacyV3);
  await page.goto('/dev/interactions?question=redesign-slot01-travel');
  await expect(page.getByRole('status')).toContainText('上次的價值分類、排序與自訂價值可以沿用');
  await page.reload();
  await expect(page.getByRole('status')).toContainText('舊版的答案不會換算成新版');
  await page.getByRole('button', { name: '繼續上次作答', exact: true }).click();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expectPosition(page, '安全穩定', 1);
  await expectPosition(page, '創作', 11);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '上次的進度已保留。' })).toBeVisible();
});

const confirmButton = (page: Page) => page.getByRole('button', { name: '確認答案', exact: true });
const unusableNotice = '先前的作答紀錄無法讀取或題目已改版，無法續答。按「重新開始」會刪除這份紀錄，從頭作答。';

// Each mechanism is answered through its own visible controls, then abandoned with an unconfirmed change.
const mechanisms: { name: string; question: string; answer: (page: Page) => Promise<void>; confirm: string; draftChange: (page: Page) => Promise<void> }[] = [
  { name: '每天安排', question: 'redesign-slot01-travel', confirm: '確認答案',
    answer: page => arrangeTravel(page, ['自己排行程', '自己排行程', '跟一日團', '跟一日團', '自己排行程', '跟一日團']),
    draftChange: async page => { await page.getByRole('button', { name: '第1天：自己排行程', exact: true }).click(); await page.getByRole('button', { name: '第3天：跟一日團', exact: true }).click(); } },
  { name: '場景位置', question: 'redesign-slot08-evening', confirm: '確認答案',
    answer: async page => { await page.getByRole('button', { name: '移動自己，目前在走廊', exact: true }).click(); await page.getByRole('button', { name: '走進沙發區', exact: true }).click(); },
    draftChange: async page => { await page.getByRole('button', { name: '移動自己，目前在沙發區', exact: true }).click(); await page.getByRole('button', { name: '走進餐桌區', exact: true }).click(); } },
  { name: '連動時數', question: 'redesign-slot07-saturday', confirm: '確認答案',
    answer: async page => { await page.getByRole('slider', { name: '休閒留白的安排', exact: true }).focus(); await page.keyboard.press('ArrowRight'); },
    draftChange: async page => { await page.getByRole('slider', { name: '休閒留白的安排', exact: true }).focus(); await page.keyboard.press('End'); } },
  { name: '資源分配', question: 'redesign-slot14-preparation', confirm: '確認答案',
    answer: async page => {
      for (let token = 1; token <= 6; token++) {
        await page.getByRole('button', { name: `時間籌碼 ${token}`, exact: true }).click();
        await page.getByRole('button', { name: token <= 4 ? '放進家裡的準備簿' : '放進社區的資訊簿', exact: true }).click();
      }
    },
    draftChange: async page => { await page.getByRole('button', { name: '時間籌碼 1', exact: true }).click(); await page.getByRole('button', { name: '放回未分配區', exact: true }).click(); } },
  { name: '排序', question: 'redesign-slot06-priority', confirm: '確認答案',
    answer: page => page.getByRole('button', { name: '將重拍攝影作品往前移' }).click(),
    draftChange: page => page.getByRole('button', { name: '將重拍攝影作品往前移' }).click() },
  { name: '保留句子', question: 'redesign-slot02-exhibition', confirm: '傳送這段訊息',
    answer: async page => { await page.getByRole('button', { name: '我想試試看把照片排成一段故事。', exact: true }).click(); },
    draftChange: async page => { await page.getByRole('button', { name: '明天我會先交一版。', exact: true }).click(); } },
];

for (const mechanism of mechanisms) {
  test(`${mechanism.name}：重新整理後完整讀回已確認答案，未確認修改不被保存`, async ({ page }) => {
    await startRedesign(page, mechanism.question);
    await mechanism.answer(page);
    await page.getByRole('button', { name: mechanism.confirm, exact: true }).click();
    const confirmed = await (await openRedesignRecords(page)).locator('.evidence-quote').innerText();
    expect(confirmed.length).toBeGreaterThan(0);
    await page.reload();
    await page.getByRole('button', { name: '繼續上次作答', exact: true }).click();
    await expect((await openRedesignRecords(page)).locator('.evidence-quote')).toHaveText(confirmed);
    await page.getByRole('button', { name: '修改這題', exact: true }).click();
    await mechanism.draftChange(page);
    await page.reload();
    await page.getByRole('button', { name: '繼續上次作答', exact: true }).click();
    await page.getByRole('button', { name: '返回已確認結果', exact: true }).click();
    await expect((await openRedesignRecords(page)).locator('.evidence-quote')).toHaveText(confirmed);
  });

  test(`${mechanism.name}：目前無法決定也能續答，重新開始與清除紀錄後都回到全新作答`, async ({ page }) => {
    await startRedesign(page, mechanism.question);
    await page.getByRole('button', { name: '目前無法決定', exact: true }).click();
    await confirmButton(page).click();
    await expect((await openRedesignRecords(page)).locator('.evidence-quote')).toHaveText('目前無法決定');
    await page.reload();
    await page.getByRole('button', { name: '繼續上次作答', exact: true }).click();
    await expect((await openRedesignRecords(page)).locator('.evidence-quote')).toHaveText('目前無法決定');
    await page.reload();
    await page.getByRole('button', { name: '重新開始', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: '繼續上次作答', exact: true })).toHaveCount(0);
    await startRedesign(page, mechanism.question);
    await mechanism.answer(page);
    await page.getByRole('button', { name: mechanism.confirm, exact: true }).click();
    await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: '繼續上次作答', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '開始這次反思' })).toBeEnabled();
  });
}

test('開發紀錄損壞時告知原因，重新整理仍保留該紀錄，由使用者選擇重新開始', async ({ page }) => {
  const opaque = JSON.stringify({ writtenBy: 'another build', answers: ['opaque'] });
  await page.addInitScript(raw => { if (!sessionStorage.getItem('seeded')) localStorage.setItem('polarstar.session.v4', raw); sessionStorage.setItem('seeded', '1'); }, opaque);
  await page.goto('/dev/interactions?question=redesign-slot01-travel');
  await expect(page.getByRole('status')).toHaveText(unusableNotice);
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('status')).toHaveText(unusableNotice);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('polarstar.')))).toEqual(['polarstar.session.v4']);
  await page.getByRole('button', { name: '重新開始', exact: true }).click();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeEnabled();
});

test('題庫改版後的開發紀錄只沿用第一幕，不套入舊的第二幕', async ({ page }) => {
  const older = JSON.stringify({ format: 4, catalogVersion: 'an-older-bank', session: JSON.parse(legacyV3) });
  await page.addInitScript(raw => { if (!sessionStorage.getItem('seeded')) localStorage.setItem('polarstar.session.v4', raw); sessionStorage.setItem('seeded', '1'); }, older);
  await page.goto('/dev/interactions?question=redesign-slot01-travel');
  await expect(page.getByRole('status')).toContainText('舊版的答案不會換算成新版');
  await page.getByRole('button', { name: '繼續上次作答', exact: true }).click();
  await expect(confirmButton(page)).toBeDisabled();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expectPosition(page, '安全穩定', 1);
  await expectPosition(page, '創作', 11);
});

test('清除本機紀錄一併刪除新舊版的作答與已看紀錄', async ({ page }) => {
  const keys = ['polarstar.session.v1', 'polarstar.session.v2', 'polarstar.session.v3', 'polarstar.session.v4', 'polarstar.seen.v1', 'polarstar.seen.v2', 'polarstar.seen.v3'];
  await page.addInitScript(names => { if (!sessionStorage.getItem('seeded')) for (const name of names) localStorage.setItem(name, '{}'); sessionStorage.setItem('seeded', '1'); }, keys);
  await page.goto('/dev/interactions?question=redesign-slot01-travel');
  await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('polarstar.')))).toEqual([]);
});

test('開發路徑讀取失敗時告知，仍可開始作答', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new DOMException('Denied', 'SecurityError'); }; });
  await page.goto('/dev/interactions?question=redesign-slot08-evening');
  await expect(page.getByRole('status')).toHaveText('目前無法讀取本機紀錄，仍可完成這次作答，但可能無法保存。');
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeEnabled();
});

test('開發路徑儲存寫入失敗時告知，仍能確認答案', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); }; });
  await startRedesign(page, 'redesign-slot08-evening');
  await expect(page.locator('.storage-notice')).toContainText('目前無法保存本機紀錄');
  await page.getByRole('button', { name: '移動自己，目前在走廊', exact: true }).click();
  await page.getByRole('button', { name: '走進沙發區', exact: true }).click();
  await confirmButton(page).click();
  await expect(page.getByText('明確決策 1 / 1 題')).toBeVisible();
});
