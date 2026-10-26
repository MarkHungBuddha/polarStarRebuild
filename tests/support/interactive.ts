import { expect, type Page } from '@playwright/test';
import { classifyAndRankValues } from './experience';
import { confirmButton, questionHeading, resultHeading } from './preference';

export { confirmButton, questionHeading, resultHeading };

/**
 * One interactive decision, applied to whichever question carries the title it is listed under.
 * `{ allocate: [a, b] }` puts a cells on side A and b on side B; '平均分配' gives each side half the cells.
 * '選 A'／'選 B' picks the first or second card of a 選方案 question; '維持初始安排' presses 維持這個安排 on a question that opens
 * on a current arrangement; '目前無法決定' presses the button every question offers.
 */
export type InteractiveDecision = { allocate: readonly [number, number] } | '平均分配' | '選 A' | '選 B' | '維持初始安排' | '目前無法決定';

/** The 目前無法決定 button every interactive question offers; it still needs 確認答案. */
export const undecidedButton = (page: Page) => page.getByRole('button', { name: '目前無法決定', exact: true });

/** The 維持這個安排 button an adjust question offers; it still needs 確認答案. */
export const keepButton = (page: Page) => page.getByRole('button', { name: '維持這個安排', exact: true });

/** The development preview of the interactive second act; it only exists on the dev server. */
export const interactivePreviewPath = '/?preview=interactive';

/** Opens the interactive preview, ranks the core values in list order and enters the scenarios. */
export async function startInteractiveScenarios(page: Page) {
  await page.goto(interactivePreviewPath);
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
}

/** The allocation cells of the current question, each a group named by its label (for example 第一週・週二). */
export const allocationCells = (page: Page) => page.locator('.allocation-cells').getByRole('group');

/** The plan cards of the current 選方案 question, A then B, each a radio named by its whole card. */
export const choiceCards = (page: Page) => page.locator('.choice-cards').getByRole('radio');

/** Sets the current question to `decision` without confirming it. */
export async function applyDecision(page: Page, decision: InteractiveDecision) {
  if (decision === '目前無法決定') { await undecidedButton(page).click(); return; }
  if (decision === '維持初始安排') { await keepButton(page).click(); return; }
  if (decision === '選 A' || decision === '選 B') {
    await choiceCards(page).nth(decision === '選 A' ? 0 : 1).check();
    return;
  }
  const cells = await allocationCells(page).all();
  const [a, b] = decision === '平均分配' ? [cells.length / 2, cells.length / 2] : decision.allocate;
  expect(a + b, 'an allocation fills every cell').toBe(cells.length);
  // Each cell offers the two sides as buttons in A, B order.
  for (const [index, cell] of cells.entries()) await cell.getByRole('button').nth(index < a ? 0 : 1).click();
}

/** Applies and confirms `decision` on the current question, then waits for the question to leave. */
export async function confirmDecision(page: Page, decision: InteractiveDecision) {
  const title = await questionHeading(page).textContent();
  await applyDecision(page, decision);
  await confirmButton(page).click();
  if (title) await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
}

/**
 * Answers every remaining question by its title: listed titles get their decision, every other question `rest`. Returns the titles in order.
 * The default rest, 目前無法決定, fits every kind of question and adds no count, so a test sees only the counts of the titles it lists.
 */
export async function answerInteractiveByTitle(page: Page, decisions: Readonly<Record<string, InteractiveDecision>> = {}, rest: InteractiveDecision = '目前無法決定') {
  const titles: string[] = [];
  while (!await resultHeading(page).isVisible()) {
    const title = (await questionHeading(page).textContent())!;
    titles.push(title);
    await confirmDecision(page, decisions[title] ?? rest);
  }
  return titles;
}

/** Waits for the result page, then reads its second-act column as「名次｜價值（不論順序）｜次數」rows. */
export async function priorityRows(page: Page) {
  await expect(resultHeading(page)).toBeVisible();
  const column = page.locator('.conclusion-columns > div').filter({ has: page.getByRole('heading', { name: '情境中優先保留的', exact: true }) });
  return Promise.all((await column.getByRole('listitem').all()).map(async item => {
    const [position, words, count] = await Promise.all(['span', 'strong', 'small'].map(tag => item.locator(tag).textContent()));
    return `${position}｜${words!.split('、').sort().join('、')}｜${count}`;
  }));
}

/** One question's record on the result page, found by its title; opens the folded per-question records first. */
export async function decisionRecord(page: Page, title: string) {
  const records = page.locator('details.decision-records');
  if (!await records.evaluate(element => (element as HTMLDetailsElement).open)) await records.locator('summary').click();
  return records.getByRole('listitem').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}

/** Goes back from the result page to change the question with this title. */
export async function editQuestion(page: Page, title: string) {
  await (await decisionRecord(page, title)).getByRole('button', { name: '修改這題' }).click();
}
