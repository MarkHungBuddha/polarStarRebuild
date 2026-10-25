import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { classifyAndRankValues } from './support/experience';
import { preferenceScenarios } from '../src/scenarios/preference';

// Fifteen slots and their value pairs from docs/scenario-feature-spec.md, written out independently of the catalog.
const blueprint: Record<string, [string, string]> = {
  slot01: ['autonomy', 'security'], slot02: ['autonomy', 'rules'], slot03: ['autonomy', 'care'],
  slot04: ['stimulation', 'security'], slot05: ['stimulation', 'tradition'], slot06: ['stimulation', 'achievement'],
  slot07: ['hedonism', 'achievement'], slot08: ['hedonism', 'care'], slot09: ['hedonism', 'rules'],
  slot10: ['achievement', 'fairness'], slot11: ['influence', 'fairness'], slot12: ['influence', 'care'],
  slot13: ['influence', 'tradition'], slot14: ['security', 'fairness'], slot15: ['rules', 'tradition'],
};
const slots = Object.keys(blueprint);
/** The title of a slot's variant in authored order; the titles only identify what the page shows, they do not pick it. */
const variant = (slot: string, index: number) => preferenceScenarios.filter(scenario => scenario.slotId === slot)[index].title;
const slotOf = (title: string) => preferenceScenarios.find(scenario => scenario.title === title)?.slotId;

const heading = (page: Page) => page.locator('.scenario-card h1');
const resultHeading = (page: Page) => page.getByRole('heading', { name: '這一次，你的選擇。', exact: true });

async function enterScenarios(page: Page) {
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
}

/** Confirms 兩者相當 on the current question and returns its title. */
async function answerCurrent(page: Page) {
  const title = (await heading(page).textContent())!;
  await page.getByRole('radio', { name: '兩者相當', exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
  return title;
}

/** Answers `count` questions (all remaining when omitted) and returns the titles seen, in order. */
async function answer(page: Page, count = Infinity) {
  const titles: string[] = [];
  while (titles.length < count && !await resultHeading(page).isVisible()) titles.push(await answerCurrent(page));
  return titles;
}

async function questionLink(page: Page) {
  const share = page.getByRole('textbox', { name: '題目分享連結' });
  if (!await share.isVisible()) await page.getByRole('button', { name: '分享這份題目', exact: true }).click();
  return share.inputValue();
}

// The fixture fixes Math.random at 0, so any free draw takes the first candidate; which variants are candidates is what these tests control.
test('完整題庫 45 題：每槽三個情境變體，每輪 15 題每槽一道，核心價值各出現三次', async ({ page }) => {
  expect(preferenceScenarios).toHaveLength(45);
  for (const [slot, pair] of Object.entries(blueprint)) {
    const variants = preferenceScenarios.filter(scenario => scenario.slotId === slot);
    expect(variants.map(scenario => scenario.pair), slot).toEqual([pair, pair, pair]);
  }
  const appearances = new Map<string, number>();
  for (const value of Object.values(blueprint).flat()) appearances.set(value, (appearances.get(value) ?? 0) + 1);
  expect([...appearances.values()]).toEqual(Array(10).fill(3));

  await page.goto('/?experience=preference');
  await enterScenarios(page);
  await expect(page.getByText('第 1 題，共 15 題', { exact: true })).toBeVisible();
  const titles = await answer(page);
  expect(titles.map(slotOf).sort()).toEqual(slots);
});

test('一般重測每槽先出未看過的變體，同槽三個都看過才重複', async ({ page }) => {
  const early = ['slot01', 'slot02', 'slot03', 'slot04'];
  await page.goto('/?experience=preference');
  await enterScenarios(page);
  // Three questions answered and the fourth shown: only slots 1–4 have been seen before leaving.
  expect(await answer(page, 3)).toEqual([variant('slot01', 0), variant('slot02', 0), variant('slot03', 0)]);
  await expect(heading(page)).toHaveText(variant('slot04', 0));
  await page.reload();
  await page.getByRole('button', { name: '重新開始', exact: true }).click();
  await enterScenarios(page);
  expect(await answer(page)).toEqual(slots.map(slot => variant(slot, early.includes(slot) ? 1 : 0)));
  await page.getByRole('button', { name: '重新開始', exact: true }).click();
  await enterScenarios(page);
  // Slots 1–4 have one unseen variant left; the others have two and take the first of them.
  expect(await answer(page)).toEqual(slots.map(slot => variant(slot, early.includes(slot) ? 2 : 1)));
  await page.getByRole('button', { name: '重新開始', exact: true }).click();
  await enterScenarios(page);
  // Every variant of slots 1–4 has been seen, so they may repeat; the other slots still have one unseen variant.
  expect(await answer(page)).toEqual(slots.map(slot => variant(slot, early.includes(slot) ? 0 : 2)));
});

test('返回、重新整理與續答都維持同一份題目與順序，只保存已確認答案', async ({ page }) => {
  await page.goto('/?experience=preference');
  await enterScenarios(page);
  const link = await questionLink(page);
  const [first, second] = await answer(page, 2);
  await page.getByRole('radio', { name: '強烈偏向 A', exact: true }).click();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(heading(page)).toHaveText(second);
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expect(heading(page)).toHaveText(first);
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await expect(heading(page)).toHaveText(first);
  await expect(page.getByRole('radio', { name: '兩者相當', exact: true })).toBeChecked();
  expect(await questionLink(page)).toBe(link);
  await answer(page, 2);
  // The third question was never confirmed, so it opens unanswered.
  for (const option of await page.getByRole('radio').all()) await expect(option).not.toBeChecked();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  expect(await questionLink(page)).toBe(link);
});

test('題目連結在另一個瀏覽器重現題目與順序、不含答案，並優先於收件者的已看紀錄', async ({ page, browser }) => {
  await page.goto('/?experience=preference');
  const link = await questionLink(page);
  expect([...new URL(link).searchParams.keys()].sort()).toEqual(['experience', 'seed', 'v']);
  await enterScenarios(page);
  const shared = await answer(page);
  expect(await questionLink(page)).toBe(link);

  const context = await browser.newContext();
  const recipient = await context.newPage();
  await recipient.addInitScript(() => { Math.random = () => 0; });
  // The recipient has already seen the shared variants of slots 1–4, so a free draw there would bring new ones.
  await recipient.goto('/?experience=preference');
  await enterScenarios(recipient);
  await answer(recipient, 3);
  await recipient.reload();
  await recipient.getByRole('button', { name: '重新開始', exact: true }).click();
  await enterScenarios(recipient);
  await expect(heading(recipient)).not.toHaveText(shared[0]);

  await recipient.goto(link);
  await recipient.getByRole('button', { name: '改做分享的題目' }).click();
  await enterScenarios(recipient);
  expect(await answer(recipient)).toEqual(shared);
  await context.close();
});

test('舊版留下的未完成作答提示重新開始，不會沿用或換算', async ({ page }) => {
  // An opaque stand-in for a record the earlier question bank left; it does not mirror any session format.
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('polarstar.session.v1', JSON.stringify({ writtenBy: 'earlier question bank' })); sessionStorage.setItem('seeded', '1'); } });
  await page.goto('/?experience=preference');
  await expect(page.getByRole('status')).toContainText('上次的作答來自舊版題目，不能接著做，也不會換算成新版答案。請重新開始。');
  await expect(page.getByRole('button', { name: '繼續上次作答' })).toHaveCount(0);
  await page.getByRole('button', { name: '重新開始', exact: true }).click();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeEnabled();
});

test('不相容的舊題目連結說明原因，並提供新版測驗入口', async ({ page }) => {
  await page.goto('/?experience=preference&seed=p.1.0.1.0.1.0.1.0.1.0.1.0.1.0.1&v=cearlier');
  await expect(page.getByRole('status')).toContainText('這份題目連結建立時用的題庫和目前不同，題目已經改過，無法重現原本的題組。');
  await expect(page.getByRole('button', { name: '開始這次反思' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '分享這份題目', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '開始新版測驗' }).click();
  expect(new URL(page.url()).search).toBe('?experience=preference');
  await enterScenarios(page);
  expect(await answer(page, 1)).toEqual([variant('slot01', 0)]);
});

test('已看紀錄無法讀取時仍能完成作答，並告知無法保存', async ({ page }) => {
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key) {
      if (key.startsWith('polarstar.seen.')) throw new DOMException('Denied', 'SecurityError');
      return getItem.call(this, key);
    };
  });
  await page.goto('/?experience=preference');
  await expect(page.getByRole('status')).toContainText('目前無法讀取本機紀錄');
  await enterScenarios(page);
  await answer(page);
  await expect(resultHeading(page)).toBeVisible();
  await expect(page.getByText('目前無法保存本機紀錄。', { exact: false })).toBeVisible();
});
