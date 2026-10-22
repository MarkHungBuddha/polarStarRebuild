import { test as base } from '@playwright/test';

// Fixed randomness is a system-boundary fixture: normal product sessions still vary.
export const test = base.extend<{ scenarioRandom: number }>({
  scenarioRandom: [0, { option: true }],
  page: async ({ page, scenarioRandom }, use) => {
    await page.addInitScript(value => { Math.random = () => value; }, scenarioRandom);
    await use(page);
  },
});
export { expect } from '@playwright/test';
