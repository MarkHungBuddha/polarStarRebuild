import { expect, test } from './support/fixtures';
import { classifyAll, expectNoHorizontalScroll, expectPosition, pressOnHandle, rankValuesInListedOrder, setCategory } from './support/experience';
import { answerInteractiveByTitle, questionHeading } from './support/interactive';

test('使用者能分類十個共同價值，並在進入情境前排出順序、保留自訂價值', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '關於這份題目' }).click();
  await expect(page.getByText('兩幕都是在假設情境下的自我回報', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await expect(page.getByRole('group', { name: /的重要性$/ })).toHaveCount(10);
  await expect(page.getByRole('button', { name: '下一步：排出順序' })).toBeDisabled();
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await pressOnHandle(page, '安全穩定', 'ArrowDown');
  await expectPosition(page, '安全穩定', 7);
  await expect(page.getByText('就算很難分，也請排出先後', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await expect(questionHeading(page)).toHaveText('六天的旅程，哪幾天自己排？');
  await expect(page.getByRole('button', { name: '確認答案' })).toBeDisabled();
});

test('排序只在同一類別內，換類別的價值排到新類別最後', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await classifyAll(page, 'good');
  for (const word of ['自主', '成就', '傳承']) await setCategory(page, word, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  const core = page.getByRole('region', { name: '這就是我' }).getByRole('listitem');
  await expect(core).toHaveCount(3);
  await expect(page.getByRole('region', { name: '還不錯' }).getByRole('listitem')).toHaveCount(7);
  await expectPosition(page, '傳承', 3);
  await pressOnHandle(page, '傳承', 'Home');
  await expectPosition(page, '傳承', 1);
  await expectPosition(page, '自主', 2);
  await page.getByRole('button', { name: '返回分類' }).click();
  await setCategory(page, '成就', 'low');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await expect(core).toHaveCount(2);
  await expectPosition(page, '傳承', 1);
  await expectPosition(page, '自主', 2);
  await expectPosition(page, '成就', 1);
});

test('自訂價值在結果獨立列出分類與位置，不列入次數或兩幕對照', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  await page.getByRole('textbox', { name: '自訂價值' }).fill('創作');
  await page.getByRole('button', { name: '新增價值' }).click();
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await rankValuesInListedOrder(page);
  await pressOnHandle(page, '創作', 'End');
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerInteractiveByTitle(page);
  await expect(page.getByRole('heading', { name: '你的自訂價值' })).toBeVisible();
  await expect(page.getByText('創作 · 這就是我 · 位置 11')).toBeVisible();
  await expect(page.getByRole('list', { name: '全部價值的優先保留次數' })).not.toContainText('創作');
  await expectNoHorizontalScroll(page);
});
