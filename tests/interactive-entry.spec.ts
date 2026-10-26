import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { classifyAndRankValues } from './support/experience';
import { answerInteractiveByTitle, choiceCards, confirmDecision, questionHeading, startInteractiveScenarios } from './support/interactive';
import { shareRegion } from './support/result-share';

/** The question-only link the footer offers for the current round. */
async function questionLink(page: Page) {
  await page.getByRole('button', { name: '分享這份題目', exact: true }).click();
  return page.getByRole('textbox', { name: '題目連結', exact: true }).inputValue();
}

/** From the home page: ranks the core values and answers every question 目前無法決定, returning the round's titles in order. */
async function roundTitles(page: Page) {
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  return answerInteractiveByTitle(page);
}

test('正式入口只提供互動作答：首頁說明三種操作，第二幕沒有五段偏向選項，也沒有開發預覽字樣', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('反思筆記', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '關於這份題目' }).click();
  await expect(page.getByText('每題用一種操作作答：選一個方案、分配有限的時間或資源，或調整原本的安排。操作完按「確認答案」才算數，也可以選「目前無法決定」。', { exact: true })).toBeVisible();
  await expect(page.getByText(/五個選項|偏向多少/)).toHaveCount(0);
  await startInteractiveScenarios(page);
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '目前無法決定', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: /偏向|兩者相當/ })).toHaveCount(0);
  await answerInteractiveByTitle(page);
  await expect(page.getByText(/開發預覽/)).toHaveCount(0);
});

test.describe('題目連結', () => {
  test.use({ scenarioRandom: 0.99 });

  test('分享的題目連結在別人的瀏覽器重現同一輪 15 題，不帶答案或價值詞', async ({ page, browser }) => {
    await page.goto('/');
    const link = await questionLink(page);
    expect([...new URL(link).searchParams.keys()].sort()).toEqual(['seed', 'v']);
    const titles = await roundTitles(page);
    expect(titles).toHaveLength(15);
    for (const target of ['/', link]) {
      const context = await browser.newContext();
      const fresh = await context.newPage();
      // A different draw on the recipient's side: only the link makes the questions match.
      await fresh.addInitScript(() => { Math.random = () => 0; });
      await fresh.goto(target);
      const drawn = await roundTitles(fresh);
      if (target === link) expect(drawn).toEqual(titles); else expect(drawn).not.toEqual(titles);
      await context.close();
    }
  });

  test('開啟不同題目的連結時仍可繼續本機進度；改做這份連結的題目才取代它', async ({ page }) => {
    await page.goto('/');
    const own = new URL(await questionLink(page));
    const other = new URL(own);
    other.searchParams.set('seed', 'p.' + own.searchParams.get('seed')!.slice(2).split('.').map(selector => selector === '0' ? '1' : '0').join('.'));
    await classifyAndRankValues(page);
    await page.getByRole('button', { name: '進入情境中的取捨' }).click();
    await confirmDecision(page, '目前無法決定');
    const savedTitle = await questionHeading(page).textContent();
    await page.goto(other.href);
    await expect(page.getByText('這份題目連結的題目與你上次作答的不同；繼續會沿用上次的題目，改做這份連結的題目則會取代上次的進度。')).toBeVisible();
    await expect(page.getByRole('button', { name: '開始這次反思' })).toHaveCount(0);
    await page.getByRole('button', { name: '繼續上次作答' }).click();
    await expect(questionHeading(page)).toHaveText(savedTitle!);
    await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
    await page.goto(other.href);
    await page.getByRole('button', { name: '改做這份連結的題目' }).click();
    const shared = await roundTitles(page);
    expect(shared).not.toContain(savedTitle);
    // The shared round is now the saved one: reopening the site offers it.
    await page.goto('/');
    await page.getByRole('button', { name: '繼續上次作答' }).click();
    await expect(page.getByRole('heading', { name: '這一次，你的選擇。', exact: true })).toBeVisible();
  });
});

test('題目連結的題組資料無法使用時，說明原因並提供用目前題目開始', async ({ page }) => {
  await page.goto('/');
  const link = new URL(await questionLink(page));
  link.searchParams.set('seed', 'p.9.9');
  await page.goto(link.href);
  await expect(page.getByRole('status').filter({ hasText: '這份題目連結的題目資料無法使用。你可以用目前題目開始。' })).toBeVisible();
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '分享這份題目', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '用目前題目開始' }).click();
  expect(new URL(page.url()).search).toBe('');
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeEnabled();
});

test('重新開始優先抽還沒看過的變體；清除本機作答紀錄後已看紀錄也重設', async ({ page }) => {
  await page.goto('/');
  const first = await roundTitles(page);
  await page.getByRole('button', { name: '重新開始', exact: true }).click();
  const second = await roundTitles(page);
  expect(second.filter(title => first.includes(title))).toEqual([]);
  await page.getByRole('button', { name: '清除本機作答紀錄' }).click();
  expect(await roundTitles(page)).toEqual(first);
});

test('已看紀錄無法讀取時仍能完成作答，並告知無法保存', async ({ page }) => {
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key) {
      if (key === 'polarstar.seen.v3') throw new DOMException('Denied', 'SecurityError');
      return getItem.call(this, key);
    };
  });
  await page.goto('/');
  await expect(page.getByRole('status').filter({ hasText: '目前無法讀取本機紀錄' })).toBeVisible();
  await roundTitles(page);
  await expect(page.getByRole('status').filter({ hasText: '目前無法保存本機紀錄' })).toBeVisible();
});

test('收件者用今天題庫的互動結果連結，可以用同一份題目作答', async ({ page, browser }) => {
  await startInteractiveScenarios(page);
  const titles = await answerInteractiveByTitle(page);
  const link = await shareRegion(page).getByRole('textbox', { name: '結果連結' }).inputValue();
  const context = await browser.newContext();
  const fresh = await context.newPage();
  await fresh.addInitScript(() => { Math.random = () => 0.99; });
  await fresh.goto(link);
  await expect(fresh.getByText('這是分享者自己作答的結果。你可以閱讀，也可以用同一份題目作答；你的答案會另外保存在你的瀏覽器，不會改到這份結果。')).toBeVisible();
  await fresh.getByRole('button', { name: '用同一份題目作答' }).click();
  await expect(fresh.getByRole('heading', { name: '這一次，分享者的選擇。' })).toHaveCount(0);
  expect(await roundTitles(fresh)).toEqual(titles);
  await context.close();
});

test('選方案題的卡片在正式入口也能只用鍵盤選定並確認', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.99; });
  await startInteractiveScenarios(page);
  await expect(questionHeading(page)).toHaveText('這次租約，續住還是搬家？');
  await choiceCards(page).first().focus();
  await page.keyboard.press('Space');
  await expect(choiceCards(page).first()).toBeChecked();
  await page.keyboard.press('ArrowDown');
  await expect(choiceCards(page).nth(1)).toBeChecked();
  await page.getByRole('button', { name: '確認答案', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
});
