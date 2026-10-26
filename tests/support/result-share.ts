import { expect, type Page } from '@playwright/test';
import { answerRemainingScenarios, classifyAll, classifyAndRankValues } from './experience';

export const corruptHeading = '這條結果連結不完整';
export const unsupportedHeading = '這條結果連結目前無法顯示';

/** The recipient page's top-three columns, found by their headings: the first act, and a legacy (format version 1) link's counts. */
export const statedColumn = (page: Page) => page.getByRole('heading', { name: '分享者最重視的' }).locator('..');
export const chosenColumn = (page: Page) => page.getByRole('heading', { name: '分享者在情境中最常選的' }).locator('..');

/** Opens a result link that must not be read: the failure page's heading shows, and no part of the result does (整份結果都不顯示). */
export async function expectUnreadable(page: Page, fragment: string, heading = corruptHeading) {
  await page.goto('/' + fragment);
  await expect(page.getByRole('heading', { level: 1, name: heading }), fragment).toBeVisible();
  await expect(page.getByRole('listitem'), '整份結果都不顯示').toHaveCount(0);
}

/** The sharer's「分享結果」block on the result page. */
export const shareRegion = (page: Page) => page.getByRole('region', { name: '分享結果' });

/** The fixed-randomness flow: core values ranked in list order, every scenario answered 強烈偏向 A. */
export async function reachShare(page: Page) {
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerRemainingScenarios(page);
  return shareRegion(page);
}

/**
 * Adds the custom values on the first screen, puts every core value in「這就是我」and answers every scenario.
 * `classified` runs after the values are classified and `ranked` on the ranking page, for tests that move a value first.
 */
export async function reachShareWithCustomValues(page: Page, words: readonly string[], { classified, ranked }: { classified?: () => Promise<void>; ranked?: () => Promise<void> } = {}) {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const word of words) {
    await page.getByRole('textbox', { name: '自訂價值' }).fill(word);
    await page.getByRole('button', { name: '新增價值' }).click();
  }
  await classifyAll(page, 'core');
  await classified?.();
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await ranked?.();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerRemainingScenarios(page);
  return shareRegion(page);
}
