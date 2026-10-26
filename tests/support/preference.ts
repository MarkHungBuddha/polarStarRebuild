import { expect, type Locator, type Page } from '@playwright/test';
import { classifyAndRankValues, type Lean } from './experience';

export type { Lean };

export const confirmButton = (page: Page) => page.getByRole('button', { name: '確認答案', exact: true });
export const leanOption = (page: Page, name: Lean) => page.getByRole('radio', { name, exact: true });
/** The current question's title. */
export const questionHeading = (page: Page) => page.locator('.scenario-card h1');
export const resultHeading = (page: Page) => page.getByRole('heading', { name: '這一次，你的選擇。', exact: true });
/** One question's evidence on the detailed report, found by its title. */
export const evidence = (page: Page, title: string): Locator => page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

/** Opens the site, ranks the core values in list order and enters the scenarios. */
export async function startScenarios(page: Page) {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
}

/** Picks and confirms `name` on the current question and waits for the next screen. */
export async function confirmLean(page: Page, name: Lean) {
  const title = await questionHeading(page).textContent();
  await leanOption(page, name).click();
  await confirmButton(page).click();
  if (title) await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
}

/** Picks and confirms one lean per question in order, then `rest` for any remaining question, until the result page shows. */
export async function answerPreferences(page: Page, leans: readonly Lean[], rest?: Lean) {
  for (const name of leans) await confirmLean(page, name);
  while (rest && !await resultHeading(page).isVisible()) await confirmLean(page, rest);
  await expect(resultHeading(page)).toBeVisible();
}

/** Answers every remaining question by its title: listed titles get their lean, every other question `rest`. Returns the titles in order. */
export async function answerByTitle(page: Page, leans: Readonly<Record<string, Lean>> = {}, rest: Lean = '兩者相當') {
  const titles: string[] = [];
  while (!await resultHeading(page).isVisible()) {
    const title = (await questionHeading(page).textContent())!;
    titles.push(title);
    await confirmLean(page, leans[title] ?? rest);
  }
  return titles;
}

/** A preference column's rows as rendered text, found by the column heading (the sharer's or the recipient's). */
export const scoreColumn = (page: Page, heading: string) => page.getByRole('heading', { name: heading, exact: true }).locator('..');

/** The sharer's second-act column as「名次｜價值（不論順序）｜分數」. */
export async function scoreRows(page: Page) {
  const column = page.locator('.conclusion-columns > div').filter({ has: page.getByRole('heading', { name: '情境中的偏向分數' }) });
  return Promise.all((await column.getByRole('listitem').all()).map(async item => {
    const [position, words, score] = await Promise.all(['span', 'strong', 'small'].map(tag => item.locator(tag).textContent()));
    return `${position}｜${words!.split('、').sort().join('、')}｜${score}`;
  }));
}
export const scoreRow = (position: string, words: readonly string[], score: string) => `${position}｜${[...words].sort().join('、')}｜${score}`;
