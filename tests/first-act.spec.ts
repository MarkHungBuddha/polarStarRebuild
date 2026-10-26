import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { reopenAndContinue } from './support/interactive';
import { classifyAll, expectFocusRing, expectFullyShown, expectNoHorizontalScroll, expectPosition, expectTouchTargets, pressOnHandle, rankHandle, rankRow, setCategory } from './support/experience';

// Near the 24-character limit for custom values; one unbroken word is the hardest case to fit at 320px.
const longCustom = '在忙碌生活裡仍留給自己安靜讀書和慢慢散步的時間';

for (const width of [320, 390, 1280]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`第一幕在 ${width}px ${colorScheme === 'light' ? '淺色' : '深色'}下完整顯示長自訂價值，不橫向捲動，可點擊區至少 44 × 44px`, async ({ page }) => {
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
      await expectPosition(page, '自主', 1);
      await expectPosition(page, '成就', 4);
      await expectFullyShown(page.getByText(longCustom, { exact: true }));
      await expectNoHorizontalScroll(page);
      await expectTouchTargets(page.locator('main'));
    });
  }
}

test('只用鍵盤就能分類與排序，焦點清楚可見', async ({ page }) => {
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
  const handle = rankHandle(page, '創作');
  await handle.focus();
  await expectFocusRing(handle);
  await page.keyboard.press('Home');
  await expectPosition(page, '創作', 1);
  await expect(page.getByText('「創作」在第 1 位', { exact: true })).toBeAttached();
  await expect(handle).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expectPosition(page, '創作', 2);
  await expectPosition(page, '自主', 1);
  await page.keyboard.press('End');
  await expectPosition(page, '創作', 11);
  await pressOnHandle(page, '安全穩定', 'ArrowUp', 2);
  await expectPosition(page, '安全穩定', 4);
  await expectPosition(page, '成就', 5);
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
  // Values join a category at the bottom, in the order they were sorted: 自主, 成就, 創作.
  await pressOnHandle(page, '創作', 'Home');
  await pressOnHandle(page, '安全穩定', 'End');
  const expectFirstAct = async () => {
    await expectPosition(page, '創作', 1);
    await expectPosition(page, '自主', 2);
    await expectPosition(page, '成就', 3);
    await expectPosition(page, '安全穩定', 7);
    await expectPosition(page, '探索刺激', 1);
    await expect(page.getByRole('region', { name: '不太在乎' }).getByRole('listitem')).toHaveCount(1);
    await expectPosition(page, '傳承', 1);
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
  // Reopening resumes the saved session where it was.
  await reopenAndContinue(page);
  await page.getByRole('button', { name: '返回上一頁' }).click();
  await expectFirstAct();
});

/** Drags a value's handle with the mouse and drops it at the vertical middle of `target`, offset by `offsetY`. */
async function dragValue(page: Page, word: string, target: string, offsetY: number) {
  const from = (await rankHandle(page, word).boundingBox())!;
  const to = (await rankRow(page, target).boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2, to.y + to.height / 2 + offsetY, { steps: 8 });
  await page.mouse.up();
}

test('拖曳把手可排序，單純點把手不改順序', async ({ page }) => {
  // Tall enough that the whole ranking list is on screen, since the mouse drags in viewport coordinates.
  await page.setViewportSize({ width: 1280, height: 2000 });
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  // Starts in list order: 自主, 探索刺激, 享受生活, 成就, …
  await dragValue(page, '成就', '自主', -20);
  await expectPosition(page, '成就', 1);
  await expectPosition(page, '自主', 2);
  await expectPosition(page, '享受生活', 4);
  await dragValue(page, '自主', '安全穩定', 20);
  await expectPosition(page, '自主', 6);
  await expectPosition(page, '安全穩定', 5);
  await rankHandle(page, '探索刺激').click();
  await expectPosition(page, '探索刺激', 2);
});
