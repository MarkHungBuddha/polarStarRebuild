import { expect, type Page } from '@playwright/test';

export async function classifyValues(page: Page) {
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const select of await page.getByRole('combobox').all()) await select.selectOption('core');
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
    const slider = page.getByRole('slider');
    if (await slider.count()) {
      await slider.focus();
      await slider.press('Home');
      await slider.press('ArrowRight');
    } else if (await page.getByRole('spinbutton').count()) {
      await page.getByRole('spinbutton').first().fill('0');
    } else {
      await page.getByRole('radio').first().check();
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
