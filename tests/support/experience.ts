import { expect, type Page } from '@playwright/test';

export async function classifyValues(page: Page) {
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const button of await page.getByRole('button', { name: '這就是我', exact: true }).all()) await button.click();
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
}

const coreValueWords = ['自主', '探索刺激', '享受生活', '成就', '主導權', '安全穩定', '遵守規範', '傳承', '照顧身邊的人', '普遍關懷'];

// Values start tied; this gives the core values an explicit strict order 1–10 on the ranking page.
export async function rankValuesInListedOrder(page: Page) {
  for (const [index, word] of coreValueWords.entries()) await page.getByRole('combobox', { name: `${word}的位置` }).selectOption(String(index + 1));
}

export async function classifyAndRankValues(page: Page) {
  await classifyValues(page);
  await rankValuesInListedOrder(page);
}

async function confirmCurrentScenario(page: Page) {
  const confirm = page.getByRole('button', { name: '確認答案', exact: true });
  if (await confirm.isDisabled()) {
    const slots = page.locator('[data-planner-slot]');
    if (await slots.count()) {
      for (const slot of await slots.all()) await slot.click();
    } else if (await page.getByRole('slider').count()) {
      await page.getByRole('slider').focus(); await page.keyboard.press('Home');
    } else if (await page.locator('.calendar-page').count()) {
      await page.locator('.calendar-page').click();
    } else if (await page.getByRole('button', { name: '放入一個月生活費', exact: true }).count()) {
      await page.getByRole('button', { name: '放入一個月生活費', exact: true }).click();
    } else {
      await page.locator('.play-scene .scene-action').first().click();
    }
  }
  await confirm.click();
}

export async function goToScenario(page: Page, title: string) {
  for (let count = 0; count < 30; count += 1) {
    if (await page.getByRole('heading', { name: title, exact: true }).count()) return;
    if (!await page.getByRole('button', { name: '確認答案', exact: true }).count()) break;
    await confirmCurrentScenario(page);
  }
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
}

export async function completeRemainingScenarios(page: Page) {
  for (let count = 0; count < 30; count += 1) {
    if (!await page.getByRole('button', { name: '確認答案', exact: true }).count()) return;
    await confirmCurrentScenario(page);
  }
  await expect(page.getByRole('heading', { name: '這一次，你的選擇。', exact: true })).toBeVisible();
}

export async function expectNoHorizontalScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
