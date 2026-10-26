import { expect, type Locator, type Page } from '@playwright/test';
import { shareRegion } from './result-share';

/**
 * Gates the native `document.fonts.load` the image waits on, so a test decides when generation finishes or fails.
 * Unheld, it behaves as the browser does.
 */
export async function controlImageFonts(page: Page) {
  await page.addInitScript(() => {
    const load = document.fonts.load.bind(document.fonts);
    let gate: Promise<void> | undefined; let release = () => {}; let fail = false;
    Object.assign(window, {
      holdImageFonts: () => { gate = new Promise<void>(resolve => { release = resolve; }); },
      releaseImageFonts: () => { gate = undefined; release(); },
      failImageFonts: (value: boolean) => { fail = value; },
    });
    document.fonts.load = async (...args) => {
      if (gate) await gate;
      if (fail) throw new Error('font unavailable');
      return load(...args);
    };
  });
}
export const callPage = (page: Page, name: 'holdImageFonts' | 'releaseImageFonts' | 'failImageFonts', value?: boolean) =>
  page.evaluate(([name, value]) => (window as unknown as Record<string, (value?: boolean) => void>)[name as string](value as boolean | undefined), [name, value] as const);

/** What the image draws as text: every `fillText` of one canvas, with its box on the 1080 × 1350 image, in drawing order. */
export interface DrawnText { text: string; left: number; right: number; top: number; bottom: number }

/** Records the text of every image the page encodes, so a test can read what the PNG says without comparing pixels. */
export async function recordImageText(page: Page) {
  await page.addInitScript(() => {
    const images: DrawnText[][] = [];
    const drawn = new WeakMap<HTMLCanvasElement, DrawnText[]>();
    Object.assign(window, { drawnImages: images });
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text: string, x: number, y: number, maxWidth?: number) {
      const list = drawn.get(this.canvas) ?? [];
      drawn.set(this.canvas, list);
      const metrics = this.measureText(text);
      const left = this.textAlign === 'right' || this.textAlign === 'end' ? x - metrics.width : this.textAlign === 'center' ? x - metrics.width / 2 : x;
      list.push({ text, left, right: left + metrics.width, top: y - metrics.actualBoundingBoxAscent, bottom: y + metrics.actualBoundingBoxDescent });
      return fillText.call(this, text, x, y, maxWidth);
    };
    const toDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...args: Parameters<HTMLCanvasElement['toDataURL']>) {
      images.push(drawn.get(this) ?? []);
      return toDataURL.apply(this, args);
    };
  });
}
/** The text of the image the share block shows now: the last one encoded once its preview is ready. */
export async function drawnImage(page: Page): Promise<DrawnText[]> {
  await expect(shareRegion(page).getByRole('img')).toBeVisible();
  return page.evaluate(() => (window as unknown as { drawnImages: DrawnText[][] }).drawnImages.at(-1)!);
}
export const allText = (drawn: DrawnText[]) => drawn.map(item => item.text).join('');

/** Nothing is cut off or drawn over: every text stays inside the image, and no two texts overlap. */
export function expectFullyLegible(drawn: DrawnText[]) {
  for (const item of drawn) {
    expect(item.left, item.text).toBeGreaterThanOrEqual(0);
    expect(item.right, item.text).toBeLessThanOrEqual(1080);
    expect(item.top, item.text).toBeGreaterThanOrEqual(0);
    expect(item.bottom, item.text).toBeLessThanOrEqual(1350);
  }
  for (const [index, a] of drawn.entries()) for (const b of drawn.slice(index + 1)) {
    const overlaps = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    expect(overlaps, `「${a.text}」與「${b.text}」重疊`).toBe(false);
  }
}

/** Every row of a page column is drawn as one run of text: its position, its names (wrapped as needed) and its score. */
export async function expectRowsDrawn(column: Locator, drawn: DrawnText[]) {
  const rows = await column.getByRole('listitem').allTextContents();
  expect(rows.length).toBeGreaterThan(0);
  for (const row of rows) expect(allText(drawn), row).toContain(row);
}
