import { expect, test } from './support/fixtures';
import { answerRemainingScenarios, classifyAll, expectFocusRing, expectNoHorizontalScroll, pressOnHandle, setCategory } from './support/experience';
import { customResultLinksV1 } from './support/result-links-v1';

test('自訂價值預設不分享，勾選後依第一幕順序送到收件者，取消後移除', async ({ page, browser }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (const word of ['保有獨處的時間', '這就是我', '不公開']) {
    await page.getByRole('textbox', { name: '自訂價值' }).fill(word);
    await page.getByRole('button', { name: '新增價值' }).click();
  }
  await classifyAll(page, 'core');
  await setCategory(page, '保有獨處的時間', 'good');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await pressOnHandle(page, '這就是我', 'Home');
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerRemainingScenarios(page);
  const share = page.getByRole('region', { name: '分享結果' });
  const group = share.getByRole('group', { name: '也分享自訂價值' });
  await expect(group).toBeVisible();
  await expect(group.getByRole('checkbox')).toHaveCount(3);
  for (const checkbox of await group.getByRole('checkbox').all()) await expect(checkbox).not.toBeChecked();
  const original = await share.getByRole('textbox', { name: '結果連結' }).inputValue();
  await group.getByLabel('保有獨處的時間').check();
  await group.getByLabel('這就是我', { exact: true }).focus();
  await page.keyboard.press('Space');
  const link = await share.getByRole('textbox', { name: '結果連結' }).inputValue();
  expect(new URL(link).hash.split('.')[3]).toBe('6YCZ5bCx5piv5oiR~5L-d5pyJ542o6JmV55qE5pmC6ZaT');
  const context = await browser.newContext();
  const recipient = await context.newPage();
  await recipient.goto(link);
  const custom = recipient.getByRole('heading', { name: '分享者的自訂價值' }).locator('..');
  await expect(custom.getByRole('listitem')).toHaveText(['這就是我', '保有獨處的時間']);
  await expect(custom.getByText('由分享者自行加入，沒有納入兩份前三名。')).toBeVisible();
  await group.getByLabel('保有獨處的時間').uncheck();
  await group.getByLabel('這就是我', { exact: true }).uncheck();
  await expect(share.getByRole('textbox', { name: '結果連結' })).toHaveValue(original);
  await context.close();
});

test('定版自訂價值連結支援十項、24 個 Unicode 字元及接近上限的長度', async ({ page }) => {
  for (const link of customResultLinksV1) {
    await page.goto('/' + link.fragment);
    const custom = page.getByRole('heading', { name: '分享者的自訂價值' }).locator('..');
    await expect(custom.getByRole('listitem')).toHaveText(link.custom);
    await page.reload();
    await expect(custom.getByRole('listitem')).toHaveText(link.custom);
  }
});

test('合法的短值、重複文字、頭尾空白及 HTML 都以純文字呈現', async ({ page }) => {
  await page.goto('/#r=1.autonomy~care~security..YQ~YQ~IGIg~PHNjcmlwdD54PC9zY3JpcHQ-.c18hay5z.0-0-0-0-0-0-0-0-0-0-0-0-0-0-0');
  const custom = page.getByRole('heading', { name: '分享者的自訂價值' }).locator('..');
  await expect(custom.getByRole('listitem')).toHaveText(['a', 'a', 'b', '<script>x</script>']);
  await expect(custom.locator('script')).toHaveCount(0);
});

test('自訂價值欄位不合法時整份結果都不顯示', async ({ page }) => {
  const invalid = [
    'YQ~YQ~YQ~YQ~YQ~YQ~YQ~YQ~YQ~YQ~YQ', // Eleven values.
    'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYQ', // Twenty-five characters.
    'IA', '44CA', // ASCII and ideographic spaces only.
    'YQo', 'YQA', 'YcKf', // LF, NUL and C1 controls.
    'YQ==', 'YR', 'Y Q', 'YQ+', 'YQ/', 'Y', // Padding, nonzero pad bits, whitespace, alphabet and length.
    'wA', '7aCA', '4g', // Invalid UTF-8: overlong, surrogate, incomplete.
    '~YQ', 'YQ~', 'YQ~~Yg', // Empty values.
  ];
  for (const custom of invalid) {
    await page.goto(`/#r=1.autonomy~care~security..${custom}.c18hay5z.0-0-0-0-0-0-0-0-0-0-0-0-0-0-0`);
    await expect(page.getByRole('heading', { name: '這條結果連結不完整' }), custom).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);
  }
});

test('最多分享十個自訂價值，取消一項後可以改勾其他項目', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: '開始這次反思' }).click();
  for (let index = 1; index <= 11; index += 1) {
    await page.getByRole('textbox', { name: '自訂價值' }).fill(`自訂價值${index}`);
    await page.getByRole('button', { name: '新增價值' }).click();
  }
  await classifyAll(page, 'core');
  await page.getByRole('button', { name: '下一步：排出順序' }).click();
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerRemainingScenarios(page);
  const group = page.getByRole('group', { name: '也分享自訂價值' });
  await expect(group).toHaveAccessibleDescription('預設不分享。勾選的項目會放進結果連結；結果圖最多放 3 個，其餘寫成「另有 N 個自訂價值」。');
  const checkboxes = group.getByRole('checkbox');
  for (let index = 0; index < 10; index += 1) await checkboxes.nth(index).check();
  await expect(checkboxes.nth(10)).toBeDisabled();
  await expect(group).toHaveAccessibleDescription(/最多 10 個。$/);
  await checkboxes.first().uncheck();
  await expect(checkboxes.nth(10)).toBeEnabled();
  await checkboxes.nth(10).locator('..').click();
  await expect(checkboxes.nth(10)).toBeChecked();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(checkboxes.nth(10)).toBeFocused();
  await expectFocusRing(checkboxes.nth(10));
  for (const label of await group.locator('label').all()) expect((await label.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await expectNoHorizontalScroll(page);
  await expect(page.getByRole('region', { name: '分享結果' }).getByRole('status')).toBeEmpty();
});
