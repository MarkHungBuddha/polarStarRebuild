import { test, expect } from './support/fixtures';
import { classifyAndRankValues, expectNoHorizontalScroll, expectTouchTargets } from './support/experience';
import { arrangeTravel, startRedesign } from './support/redesign';

test('旅行安排確認後忠實保留每日行程，修改草稿不覆寫結果', async ({ page }) => {
  await page.goto('/dev/interactions?question=redesign-slot01-travel');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await expect(page.getByRole('heading', { name: '六天的旅程，怎麼排？' })).toBeVisible();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  for (let day = 1; day <= 6; day++) {
    await page.getByRole('button', { name: day <= 4 ? '自己排行程' : '跟一日團', exact: true }).click();
    await page.getByRole('button', { name: `第${day}天：尚未安排`, exact: true }).click();
  }
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await page.getByText('展開全部 1 題的決策').click();
  await expect(page.locator('.evidence-quote')).toContainText('第1天：自己排行程；第2天：自己排行程；第3天：自己排行程；第4天：自己排行程；第5天：跟一日團；第6天：跟一日團');
  await expect(page.getByText('明確決策 1 / 1 題')).toBeVisible();
  await page.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('button', { name: '第1天：自己排行程', exact: true }).click();
  await page.getByRole('button', { name: '第5天：跟一日團', exact: true }).click();
  await expect(page.getByRole('button', { name: '第1天：跟一日團', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回已確認結果', exact: true }).click();
  await page.getByText('展開全部 1 題的決策').click();
  await expect(page.locator('.evidence-quote')).toContainText('第1天：自己排行程');
});

test('鍵盤可取消拿取、撤回及重設，無法決定需明確確認', async ({ page }) => {
  await startRedesign(page);
  const activity = page.getByRole('button', { name: '自己排行程', exact: true });
  await activity.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('已拿起「自己排行程」。請選目的地。')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('已拿起「自己排行程」。請選目的地。')).toHaveCount(0);
  await activity.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '第1天：尚未安排', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '第1天：自己排行程', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '撤回最近一步' }).click();
  await expect(page.getByRole('button', { name: '第1天：尚未安排', exact: true })).toBeVisible();
  await arrangeTravel(page, ['自己排行程', '自己排行程', '自己排行程', '跟一日團', '跟一日團', '跟一日團']);
  await page.getByRole('button', { name: '重設草稿' }).click();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '目前無法決定', exact: true }).click();
  await expect(page.getByRole('heading', { name: '六天的旅程，怎麼排？' })).toBeVisible();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByText('明確決策 0 / 1 題')).toBeVisible();
});

test('拖曳可放置、交換、移回，無效位置不形成安排', async ({ page }) => {
  await startRedesign(page);
  const source = page.getByRole('button', { name: '自己排行程', exact: true });
  const first = page.getByRole('button', { name: '第1天：尚未安排', exact: true });
  await source.dragTo(first);
  await expect(page.getByRole('button', { name: '第1天：自己排行程', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '跟一日團', exact: true }).dragTo(page.getByRole('button', { name: '第2天：尚未安排', exact: true }));
  await page.getByRole('button', { name: '第1天：自己排行程', exact: true }).dragTo(page.getByRole('button', { name: '第2天：跟一日團', exact: true }));
  await expect(page.getByRole('button', { name: '第1天：跟一日團', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '第1天：跟一日團', exact: true }).dragTo(page.getByRole('heading', { name: '六天的旅程，怎麼排？' }));
  await expect(page.getByRole('button', { name: '第1天：跟一日團', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '第1天：跟一日團', exact: true }).dragTo(page.getByRole('button', { name: '移回卡片區' }));
  await expect(page.getByRole('button', { name: '第1天：尚未安排', exact: true })).toBeVisible();
});

test('均分不判方向，但結果保留六天的實際安排', async ({ page }) => {
  await startRedesign(page);
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await expectNoHorizontalScroll(page);
    await expectTouchTargets(page.locator('.scenario-page'));
  }
  await arrangeTravel(page, ['自己排行程', '跟一日團', '自己排行程', '跟一日團', '自己排行程', '跟一日團']);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByText('明確決策 0 / 1 題')).toBeVisible();
  await page.getByText('展開全部 1 題的決策').click();
  await expect(page.locator('.evidence-quote')).toHaveText('第1天：自己排行程；第2天：跟一日團；第3天：自己排行程；第4天：跟一日團；第5天：自己排行程；第6天：跟一日團');
});

test.describe('觸控', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test('手機可先拿再放，深淺色與窄螢幕均可操作', async ({ page }) => {
    await startRedesign(page);
    await page.setViewportSize({ width: 390, height: 1600 });
    const source = page.getByRole('button', { name: '跟一日團', exact: true });
    const destination = page.getByRole('button', { name: '第2天：尚未安排', exact: true });
    await source.scrollIntoViewIfNeeded();
    const from = (await source.boundingBox())!;
    const to = (await destination.boundingBox())!;
    // Chromium's input boundary sends real touch events, exercising pointer capture rather than dispatching handlers.
    const touch = await page.context().newCDPSession(page);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x + from.width / 2, y: from.y + from.height / 2, id: 41 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: to.x + to.width / 2, y: to.y + to.height / 2, id: 41 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.getByRole('button', { name: '第2天：跟一日團', exact: true })).toBeVisible();
    await touch.detach();
    await page.getByRole('button', { name: '自己排行程', exact: true }).tap();
    await expect(page.getByRole('button', { name: '自己排行程', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: '第1天：尚未安排', exact: true }).tap();
    await expect(page.getByRole('button', { name: '第1天：自己排行程', exact: true })).toBeVisible();
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme });
        await expectNoHorizontalScroll(page);
        await expectTouchTargets(page.locator('.scenario-page'));
      }
    }
  });
});
