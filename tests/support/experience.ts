import { expect, type Locator, type Page } from '@playwright/test';
import { categoryLabels } from '../../src/data';
import type { Category } from '../../src/types';

/** First-act importance for one value, chosen with that value's category buttons. */
export async function setCategory(page: Page, word: string, category: Category) {
  await page.getByRole('group', { name: `${word}的重要性` }).getByRole('button', { name: categoryLabels[category], exact: true }).click();
}

export async function classifyAll(page: Page, category: Category) {
  for (const group of await page.getByRole('group', { name: /的重要性$/ }).all()) await group.getByRole('button', { name: categoryLabels[category], exact: true }).click();
}

export async function classifyValues(page: Page) {
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
}

const coreValueWords = ['自主', '探索刺激', '享受生活', '成就', '主導權', '安全穩定', '遵守規範', '傳承', '照顧身邊的人', '普遍關懷'];

/** A value's row on the ranking page; its accessible name is the value's word. */
export const rankRow = (page: Page, word: string) => page.getByRole('listitem', { name: word, exact: true });

/** The drag handle, which also moves the value with ArrowUp / ArrowDown / Home / End. */
export const rankHandle = (page: Page, word: string) => page.getByRole('button', { name: `${word}的順序`, exact: true });

/** The position number shown on a value's row. */
export async function positionOf(page: Page, word: string) {
  return Number(await rankRow(page, word).locator('[data-position]').textContent());
}

export async function expectPosition(page: Page, word: string, position: number) {
  await expect(rankRow(page, word).locator('[data-position]')).toHaveText(String(position));
}

/** Moves a value with the keyboard on its handle. */
export async function pressOnHandle(page: Page, word: string, key: 'ArrowUp' | 'ArrowDown' | 'Home' | 'End', times = 1) {
  await rankHandle(page, word).focus();
  for (let step = 0; step < times; step += 1) await page.keyboard.press(key);
}

/** Sends each value to the bottom in turn, so the listed words end up in that order, each on its own position. */
export async function arrangeInOrder(page: Page, words: readonly string[]) {
  for (const word of words) await pressOnHandle(page, word, 'End');
}

// Gives the core values the strict order 1–10 in the listed order on the ranking page.
export async function rankValuesInListedOrder(page: Page) {
  await arrangeInOrder(page, coreValueWords);
}

export async function classifyAndRankValues(page: Page) {
  await classifyValues(page);
  await rankValuesInListedOrder(page);
}

/** A five-step answer, as its option is named on the page. */
export type Lean = '強烈偏向 A' | '稍微偏向 A' | '兩者相當' | '稍微偏向 B' | '強烈偏向 B';

/** Picks `lean` on the current question and confirms it. */
export async function confirmCurrentScenario(page: Page, lean: Lean = '強烈偏向 A') {
  await page.getByRole('radio', { name: lean, exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
}

/** Answers every question before the one titled `title` with `lean`, stopping on it. */
export async function goToScenario(page: Page, title: string, lean: Lean = '強烈偏向 A') {
  for (let count = 0; count < 30; count += 1) {
    if (await page.getByRole('heading', { name: title, exact: true }).count()) return;
    if (!await page.getByRole('button', { name: '確認答案', exact: true }).count()) break;
    const current = await page.locator('.scenario-card h1').textContent();
    await confirmCurrentScenario(page, lean);
    if (current) await expect(page.getByRole('heading', { name: current, exact: true })).toHaveCount(0);
  }
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
}

/** Answers every remaining scenario with `lean` and stops on the result page as it first opens (the cover after a full run). */
export async function answerRemainingScenarios(page: Page, lean: Lean = '強烈偏向 A') {
  const result = page.getByRole('heading', { name: '這一次，你的選擇。', exact: true });
  for (let count = 0; count < 30; count += 1) {
    if (await result.isVisible() || !await page.getByRole('button', { name: '確認答案', exact: true }).count()) break;
    const current = await page.locator('.scenario-card h1').textContent();
    await confirmCurrentScenario(page, lean);
    if (current) await expect(page.getByRole('heading', { name: current, exact: true })).toHaveCount(0);
  }
  await expect(result).toBeVisible();
}

/** Opens the detailed report from the result cover; already on the report, it does nothing. */
export async function openDetailedReport(page: Page) {
  const detail = page.getByRole('button', { name: '閱讀詳細報告 →' });
  if (await detail.count()) await detail.click();
}

/** Answers every remaining scenario and opens the detailed report, where the evidence is. */
export async function completeRemainingScenarios(page: Page, lean: Lean = '強烈偏向 A') {
  await answerRemainingScenarios(page, lean);
  await openDetailedReport(page);
}

export async function expectNoHorizontalScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

/** Every visible button, link, select, text field and slider inside `scope` is at least 44 × 44px. */
export async function expectTouchTargets(scope: Locator) {
  const controls = scope.getByRole('button').or(scope.getByRole('link')).or(scope.getByRole('combobox')).or(scope.getByRole('textbox')).or(scope.getByRole('slider'));
  for (const control of await controls.all()) {
    if (!await control.isVisible()) continue;
    const box = await control.boundingBox();
    const name = await control.getAttribute('aria-label') ?? await control.textContent() ?? '';
    expect(box?.width, name).toBeGreaterThanOrEqual(44);
    expect(box?.height, name).toBeGreaterThanOrEqual(44);
  }
}

/** No text inside `scope` is cut off: no element scrolls sideways inside its own box (form fields scroll their value by design). */
export async function expectNoClippedText(scope: Locator) {
  const clipped = await scope.evaluate(root => [...root.querySelectorAll<HTMLElement>(':not(input, select, textarea)')]
    .filter(element => element.offsetParent !== null && element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).overflowX !== 'visible')
    .map(element => element.textContent?.slice(0, 40)));
  expect(clipped).toEqual([]);
}

/** Every piece of text inside `scope` stays horizontal: neither it nor an ancestor inside `scope` is rotated or skewed (only decorative backgrounds may tilt). */
export async function expectHorizontalText(scope: Locator) {
  const tilted = await scope.evaluate(root => {
    const isTilted = (element: Element) => {
      const transform = getComputedStyle(element).transform;
      if (transform === 'none') return false;
      const matrix = new DOMMatrixReadOnly(transform);
      return Math.abs(matrix.b) > 1e-6 || Math.abs(matrix.c) > 1e-6;
    };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const found: string[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trim();
      if (!text) continue;
      for (let element = node.parentElement; element; element = element === root ? null : element.parentElement) {
        if (isTilted(element)) { found.push(text.slice(0, 30)); break; }
      }
    }
    return found;
  });
  expect(tilted).toEqual([]);
}

/** Paragraphs inside `scope` that run longer than three lines use the sans-serif body font, not the handwriting font. */
export async function expectLongParagraphsInSans(scope: Locator) {
  const handwritten = await scope.evaluate(root => [...root.querySelectorAll<HTMLElement>('p, li')].filter(element => {
    if (element.offsetParent === null) return false;
    const style = getComputedStyle(element);
    const lines = (element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)) / parseFloat(style.lineHeight);
    return lines > 3.2 && !/^"?Noto Sans TC/.test(style.fontFamily);
  }).map(element => element.textContent?.slice(0, 30)));
  expect(handwritten).toEqual([]);
}

/** The whole text is shown: nothing clipped by its own box or pushed past the viewport. */
export async function expectFullyShown(locator: Locator) {
  await expect(locator).toBeVisible();
  const fits = await locator.evaluate(element => element.scrollWidth <= element.clientWidth + 1 && element.getBoundingClientRect().right <= window.innerWidth);
  expect(fits).toBe(true);
}

/** Keyboard focus shows the shared 2px solid outline. */
export async function expectFocusRing(locator: Locator) {
  const outline = await locator.evaluate(element => ({ style: getComputedStyle(element).outlineStyle, width: parseFloat(getComputedStyle(element).outlineWidth) }));
  expect(outline.style).toBe('solid');
  expect(outline.width).toBeGreaterThanOrEqual(2);
}

/** No text inside `scope` ends with a line holding a single character (a lone 字 or punctuation mark wrapped onto its own line). */
export async function expectNoLoneLastCharacter(scope: Locator) {
  const lone = await scope.evaluate(root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const found: string[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trimEnd() ?? '';
      if (text.length < 2 || node.parentElement?.offsetParent === null) continue;
      const rectAt = (index: number) => { const range = document.createRange(); range.setStart(node!, index); range.setEnd(node!, index + 1); return range.getBoundingClientRect(); };
      const [last, before] = [rectAt(text.length - 1), rectAt(text.length - 2)];
      if (last.top - before.top > last.height / 2) found.push(text.slice(-12));
    }
    return found;
  });
  expect(lone).toEqual([]);
}
