import { expect, test } from './support/fixtures';
import { classifyAndRankValues } from './support/experience';
import { confirmDecision, questionHeading, reopenAndContinue } from './support/interactive';

test('照題目連結作答到一半重新開啟，仍續答同一份已確認進度', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '分享這份題目', exact: true }).click();
  const link = await page.getByRole('textbox', { name: '題目分享連結' }).inputValue();
  await page.goto(link);
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await confirmDecision(page, '目前無法決定');
  const nextTitle = await questionHeading(page).textContent();
  await reopenAndContinue(page);
  await expect(questionHeading(page)).toHaveText(nextTitle!);
  await expect(page.getByText('第 2 題，共 15 題', { exact: true })).toBeVisible();
});

test('無法自動複製時仍能取得只含題目的分享連結', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }));
  await page.goto('/?private-answer=not-for-sharing#my-result');
  await page.getByRole('button', { name: '分享這份題目', exact: true }).click();
  const link = await page.getByRole('textbox', { name: '題目分享連結' }).inputValue();
  expect(link).not.toContain('private-answer');
  expect(link).not.toContain('my-result');
  await page.getByRole('button', { name: '複製題目連結', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('請選取上方連結並手動複製');
  await expect(page.getByRole('textbox', { name: '題目分享連結' })).toHaveValue(link);
});
