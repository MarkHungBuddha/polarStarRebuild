import type { Page } from '@playwright/test';
import { classifyAndRankValues } from './experience';

/** Full first act on the development bank; use question titles rather than random slot positions. */
export async function startRedesign(page: Page, questionId = 'redesign-slot01-travel') {
  await page.goto(`/dev/interactions?question=${encodeURIComponent(questionId)}`);
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
}

/** Calendar alternatives use the same visible day arrangement as pointer dragging. */
export async function arrangeTravel(page: Page, activities: readonly string[]) {
  for (const [index, activity] of activities.entries()) {
    await page.getByRole('button', { name: activity, exact: true }).click();
    await page.getByRole('button', { name: `第${index + 1}天：尚未安排`, exact: true }).click();
  }
}

/** Confirmed-result evidence, shared by mechanism tests without inspecting state or storage. */
export async function openRedesignRecords(page: Page) {
  await page.locator('details.decision-records > summary').click();
  return page.locator('.evidence');
}
