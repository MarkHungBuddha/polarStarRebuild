import type { Page } from '@playwright/test';

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
