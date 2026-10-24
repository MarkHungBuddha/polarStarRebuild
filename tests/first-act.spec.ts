import { expect, test } from './support/fixtures';
import { classifyAll, expectFocusRing, expectFullyShown, expectNoHorizontalScroll, expectTouchTargets, setCategory } from './support/experience';

// Near the 24-character limit for custom values; one unbroken word is the hardest case to fit at 320px.
const longCustom = '在忙碌生活裡仍留給自己安靜讀書和慢慢散步的時間';

for (const width of [320, 390, 1280]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`第一幕在 ${width}px ${colorScheme === 'light' ? '淺色' : '深色'}下完整顯示長自訂價值與並列，不橫向捲動，可點擊區至少 44 × 44px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ colorScheme });
      await page.goto('/');
      await page.getByRole('button', { name: '開始這次反思' }).click();
      await page.getByRole('textbox', { name: '自訂價值' }).fill(longCustom);
      await page.getByRole('button', { name: '新增價值' }).click();
      await expectFullyShown(page.getByRole('heading', { name: longCustom }));
      await expectNoHorizontalScroll(page);
      await expectTouchTargets(page.locator('main'));
      await classifyAll(page, 'core');
      await page.getByRole('button', { name: '下一步：排出順序' }).click();
      await expect(page.getByRole('combobox', { name: '自主的位置' })).toHaveValue('1');
      await expect(page.getByRole('combobox', { name: '成就的位置' })).toHaveValue('1');
      await expectFullyShown(page.getByText(longCustom, { exact: true }));
      await expectNoHorizontalScroll(page);
      await expectTouchTargets(page.locator('main'));
    });
  }
}

test('只用鍵盤就能分類、排序與並列，焦點清楚可見', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).focus();
  await page.keyboard.press('Enter');
  const custom = page.getByRole('textbox', { name: '自訂價值' });
  await custom.focus();
  await page.keyboard.type('創作');
  await page.keyboard.press('Enter');
  const groups = page.getByRole('group', { name: /的重要性$/ });
  await expect(groups).toHaveCount(11);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '新增價值' })).toBeFocused();
  for (const [index, group] of (await groups.all()).entries()) {
    // Tab moves through each value's category buttons in order; the first one is "這就是我".
    await page.keyboard.press('Tab');
    const core = group.getByRole('button', { name: '這就是我', exact: true });
    await expect(core).toBeFocused();
    await expectFocusRing(core);
    await page.keyboard.press(index === 0 ? 'Enter' : 'Space');
    await expect(core).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  }
  const next = page.getByRole('button', { name: '下一步：排出順序' });
  await next.focus();
  await page.keyboard.press('Enter');
  const position = page.getByRole('combobox', { name: '創作的位置' });
  await position.focus();
  await expectFocusRing(position);
  await page.keyboard.press('End');
  await expect(position).toHaveValue('11');
  const security = page.getByRole('combobox', { name: '安全穩定的位置' });
  await security.focus();
  await page.keyboard.press('ArrowDown');
  await expect(security).toHaveValue('2');
  await expect(page.getByRole('article').filter({ has: security }).getByText('並列', { exact: true })).toHaveCount(0);
  await page.getByRole('combobox', { name: '自主的位置' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('article').filter({ has: security }).getByText('並列', { exact: true })).toBeVisible();
});

test('進入第二幕、返回調整與重新開啟後，都保留分類、名次與自訂價值', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  await classifyAll(page, 'good');
  for (const word of ['自主', '成就', '創作']) await setCategory(page, word, 'core');
  await setCategory(page, '傳承', 'low');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('combobox', { name: '創作的位置' }).selectOption('3');
  await page.getByRole('combobox', { name: '成就的位置' }).selectOption('2');
  await page.getByRole('combobox', { name: '安全穩定的位置' }).selectOption('2');
  const expectFirstAct = async () => {
    await expect(page.getByRole('combobox', { name: '自主的位置' })).toHaveValue('1');
    await expect(page.getByRole('combobox', { name: '成就的位置' })).toHaveValue('2');
    await expect(page.getByRole('combobox', { name: '創作的位置' })).toHaveValue('3');
    await expect(page.getByRole('combobox', { name: '安全穩定的位置' })).toHaveValue('2');
    await expect(page.getByRole('combobox', { name: '傳承的位置' }).getByRole('option')).toHaveText(['1']);
    await page.getByRole('button', { name: '返回分類' }).click();
    for (const [word, label] of [['創作', '這就是我'], ['傳承', '不太在乎'], ['普遍關懷', '還不錯']]) {
      await expect(page.getByRole('group', { name: `${word}的重要性` }).getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true');
    }
    await page.getByRole('button', { name: '下一步：排出順序' }).click();
  };
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expectFirstAct();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await page.reload();
  await page.getByRole('button', { name: '繼續上次作答' }).click();
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expectFirstAct();
});
