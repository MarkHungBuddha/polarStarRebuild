import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { answerRemainingScenarios, classifyAndRankValues, classifyValues, confirmCurrentScenario } from './support/experience';
import { noChosen, resultLinksV1, resultLinksV1Catalog, type PublishedResultLink } from './support/result-links-v1';
import { catalogVersion } from '../src/questionPlan';

// A published link opened against today's catalog, so its question set is still reproducible.
const current = (link: PublishedResultLink) => link.fragment.replace(`.${resultLinksV1Catalog}.`, `.${catalogVersion}.`);
const statedColumn = (page: Page) => page.getByRole('heading', { name: '分享者最重視的' }).locator('..');
const chosenColumn = (page: Page) => page.getByRole('heading', { name: '分享者在情境中最常選的' }).locator('..');
const storageSnapshot = (page: Page) => page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()));

async function shareFixedFlow(page: Page) {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerRemainingScenarios(page);
  return page.getByRole('region', { name: '分享結果' });
}

test('收件者打開結果連結，看到分享者的兩份前三名和解讀限制', async ({ page }) => {
  const link = resultLinksV1.general;
  await page.goto('/' + link.fragment);
  await expect(page.getByRole('heading', { level: 1, name: '這一次，分享者的選擇。' })).toBeVisible();
  await expect(page.getByText('這是分享者自己作答的結果。你可以閱讀，也可以用同一份題目作答；你的答案會另外保存在你的瀏覽器，不會改到這份結果。')).toBeVisible();
  await expect(statedColumn(page).getByRole('listitem')).toHaveText(link.stated);
  await expect(chosenColumn(page).getByRole('listitem')).toHaveText(link.chosen);
  await expect(page.getByText('這是分享者在假設情境下的自我回報，不是人格判定，也不代表實際行為。每個價值只出現在約三題，改一題就可能換名次。')).toBeVisible();
  await expect(page.getByRole('button', { name: '回第一幕調整' })).toHaveCount(0);
  await expect(page.getByText('還可以想想')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '分享這份題目' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '清除本機作答紀錄' })).toBeVisible();
});

test('定版範例連結的並列、第二幕沒有結果和全部並列都照分享當時顯示', async ({ page }) => {
  for (const link of [resultLinksV1.statedTieNoChosen, resultLinksV1.chosenAllTied, resultLinksV1.fixedFlow]) {
    await page.goto('/' + link.fragment);
    await expect(statedColumn(page).getByRole('listitem')).toHaveText(link.stated);
    await expect(chosenColumn(page).getByRole('listitem')).toHaveText(link.chosen);
    if (!link.chosen.length) await expect(chosenColumn(page).getByText(noChosen, { exact: true })).toBeVisible();
  }
});

test('分享者的結果連結在別人的瀏覽器打開，兩份前三名和次數都相同', async ({ page, browser }) => {
  const share = await shareFixedFlow(page);
  await expect(share.getByRole('group', { name: '也分享自訂價值' })).toHaveCount(0);
  await expect(share.getByText('結果圖和結果連結只放兩份前三名，不包含逐題答案和第一幕的完整排序。拿到圖片或連結的人都看得到這些內容。')).toBeVisible();
  const link = await share.getByRole('textbox', { name: '結果連結' }).inputValue();
  expect(new URL(link).search).toBe('');
  const columns = page.getByRole('region', { name: '你的前三名' }).getByRole('list');
  const stated = await columns.nth(0).getByRole('listitem').allTextContents();
  const chosen = await columns.nth(1).getByRole('listitem').allTextContents();
  const fresh = await (await browser.newContext()).newPage();
  await fresh.goto(link);
  await expect(statedColumn(fresh).getByRole('listitem')).toHaveText(stated);
  await expect(chosenColumn(fresh).getByRole('listitem')).toHaveText(chosen);
  await fresh.context().close();
});

test('同樣的作答產生的結果連結，和定版範例連結逐字相同', async ({ page }) => {
  const share = await shareFixedFlow(page);
  const link = await share.getByRole('textbox', { name: '結果連結' }).inputValue();
  expect(new URL(link).hash).toBe(current(resultLinksV1.fixedFlow));
});

test('複製結果連結成功或失敗，狀態區都說明結果', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const share = await shareFixedFlow(page);
  await share.getByRole('button', { name: '複製結果連結' }).click();
  await expect(share.getByRole('status')).toHaveText('已複製結果連結。');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await share.getByRole('textbox', { name: '結果連結' }).inputValue());
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('denied')); });
  await share.getByRole('button', { name: '複製結果連結' }).click();
  await expect(share.getByRole('status')).toHaveText('無法自動複製，請選取上方連結並手動複製。');
});

test('用同一份題目作答，會照題目連結的流程做分享者的原題組', async ({ page, browser }) => {
  await page.goto('/' + current(resultLinksV1.chosenAllTied));
  await page.getByRole('button', { name: '用同一份題目作答' }).click();
  await expect(page).toHaveURL(`/?seed=p.1.0.1.0.1.0.1.0.1.0.1.0.1.0.1&v=${catalogVersion}`);
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  const first = await page.getByRole('heading', { level: 1 }).textContent();
  const direct = await (await browser.newContext()).newPage();
  await direct.goto(`/?seed=p.1.0.1.0.1.0.1.0.1.0.1.0.1.0.1&v=${catalogVersion}`);
  await classifyValues(direct);
  await direct.getByRole('button', { name: '進入情境中的取捨' }).click();
  await expect(direct.getByRole('heading', { level: 1 })).toHaveText(first!);
  await direct.context().close();
});

test('打開結果連結不讀也不寫本機的作答和已看題目紀錄', async ({ page, browser }) => {
  await page.goto('/');
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await confirmCurrentScenario(page);
  const before = await storageSnapshot(page);
  expect(before).not.toBe('[]');
  await page.goto('/' + current(resultLinksV1.general));
  await expect(page.getByRole('heading', { level: 1, name: '這一次，分享者的選擇。' })).toBeVisible();
  await expect(page.getByText('上次的進度已保留。')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: '這一次，分享者的選擇。' })).toBeVisible();
  expect(await storageSnapshot(page)).toBe(before);
  const fresh = await (await browser.newContext()).newPage();
  await fresh.goto('/' + current(resultLinksV1.general));
  await expect(fresh.getByRole('heading', { level: 1, name: '這一次，分享者的選擇。' })).toBeVisible();
  expect(await storageSnapshot(fresh)).toBe('[]');
  await fresh.context().close();
});

test('網址同時有題目連結和結果連結時顯示結果；重新整理後還是同一份結果', async ({ page }) => {
  const link = resultLinksV1.general;
  await page.goto(`/?seed=p.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1&v=${catalogVersion}${link.fragment}`);
  await expect(page.getByRole('heading', { level: 1, name: '這一次，分享者的選擇。' })).toBeVisible();
  await page.reload();
  expect(new URL(page.url()).hash).toBe(link.fragment);
  await expect(chosenColumn(page).getByRole('listitem')).toHaveText(link.chosen);
});

test('結果連結讀不出來時，整份結果都不顯示，改說明連結不完整', async ({ page }) => {
  const full = resultLinksV1.general.fragment;
  await page.goto('/' + full.slice(0, full.length / 2));
  await expect(page.getByRole('heading', { level: 1, name: '這條結果連結不完整' })).toBeVisible();
  await expect(page.getByText('連結可能在複製或轉貼時被截斷或改動，所以整份結果都不顯示。請向分享者要一條新的結果連結。')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('heading', { level: 1, name: /你重視什麼/ })).toBeVisible();
});
