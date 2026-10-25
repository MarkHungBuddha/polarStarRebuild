import { expect, type Page } from '@playwright/test';
import { classifyAndRankValues } from './experience';

export type Lean = '強烈偏向 A' | '稍微偏向 A' | '兩者相當' | '稍微偏向 B' | '強烈偏向 B';

/** PREVIEW ONLY (#49 until #56): the five-step run is reached through `?experience=preference`; core values ranked in list order. */
export async function startPreferencePreview(page: Page) {
  await page.goto('/?experience=preference');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
}

/** Picks and confirms one lean per question in order, then `rest` for any remaining question, until the result page shows. */
export async function answerPreferences(page: Page, leans: readonly Lean[], rest?: Lean) {
  const result = page.getByRole('heading', { name: '這一次，你的選擇。', exact: true });
  const pick = async (name: Lean) => {
    await page.getByRole('radio', { name, exact: true }).click();
    await page.getByRole('button', { name: '確認答案', exact: true }).click();
  };
  for (const name of leans) await pick(name);
  // The preview's question count grows as content tickets land (PREVIEW ONLY until #56).
  while (rest && !await result.isVisible()) await pick(rest);
  await expect(result).toBeVisible();
}

/** A preference column's rows as rendered text, found by the column heading (the sharer's or the recipient's). */
export const scoreColumn = (page: Page, heading: string) => page.getByRole('heading', { name: heading, exact: true }).locator('..');
