import { test, expect } from './support/fixtures';
import { startRedesign, openRedesignRecords } from './support/redesign';
import { expectFocusRing, expectNoClippedText, expectNoHorizontalScroll, expectTouchTargets } from './support/experience';

test('走進房間才形成決策，確認後記錄行動，修改草稿不覆寫結果', async ({ page }) => {
  await startRedesign(page, 'redesign-slot08-evening');
  await expect(page.getByRole('heading', { name: '今晚，你想走向哪裡？' })).toBeVisible();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '移動自己，目前在走廊', exact: true }).click();
  await page.getByRole('button', { name: '走進沙發區', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: '目前在沙發區' })).toContainText('今晚好好看電影，和朋友另約時間。');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toHaveText('走進沙發區：今晚好好看電影，和朋友另約時間。');
  await expect(page.getByText('明確決策 1 / 1 題')).toBeVisible();
  await page.getByRole('button', { name: '修改這題' }).click();
  await expect(page.getByRole('button', { name: '移動自己，目前在沙發區', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '移動自己，目前在沙發區', exact: true }).click();
  await page.getByRole('button', { name: '走進餐桌區', exact: true }).click();
  await page.getByRole('button', { name: '返回已確認結果', exact: true }).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toHaveText('走進沙發區：今晚好好看電影，和朋友另約時間。');
});

test('能撤回、重設、還原已確認位置，無法決定另行確認', async ({ page }) => {
  await startRedesign(page, 'redesign-slot08-evening');
  await page.getByRole('button', { name: '移動自己，目前在走廊', exact: true }).click();
  await page.getByRole('button', { name: '走進餐桌區', exact: true }).click();
  await page.getByRole('button', { name: '撤回最近一步', exact: true }).click();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '移動自己，目前在走廊', exact: true }).click();
  await page.getByRole('button', { name: '走進沙發區', exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await openRedesignRecords(page);
  await page.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('button', { name: '重設草稿', exact: true }).click();
  await expect(page.getByRole('button', { name: '移動自己，目前在走廊', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '還原已確認安排', exact: true }).click();
  await expect(page.getByRole('button', { name: '移動自己，目前在沙發區', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '目前無法決定', exact: true }).click();
  await expect(page.getByRole('heading', { name: '今晚，你想走向哪裡？' })).toBeVisible();
  await page.getByRole('button', { name: '撤回最近一步', exact: true }).click();
  await expect(page.getByRole('button', { name: '目前無法決定', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: '目前無法決定', exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByText('明確決策 0 / 1 題')).toBeVisible();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toHaveText('目前無法決定');
});

test('人物能拖進整個房間與移回走廊，落在場景外不會自動選邊', async ({ page }) => {
  await startRedesign(page, 'redesign-slot08-evening');
  const actor = () => page.getByRole('button', { name: /^移動自己，目前在/ });
  await actor().dragTo(page.getByRole('heading', { name: '今晚，你想走向哪裡？' }));
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await actor().dragTo(page.getByRole('heading', { name: '沙發區', exact: true }));
  await expect(page.getByRole('button', { name: '移動自己，目前在沙發區', exact: true })).toBeVisible();
  await actor().dragTo(page.getByRole('heading', { name: '今晚，你想走向哪裡？' }));
  await expect(page.getByRole('button', { name: '移動自己，目前在沙發區', exact: true })).toBeVisible();
  await actor().dragTo(page.getByRole('heading', { name: '餐桌區', exact: true }));
  await expect(page.getByRole('button', { name: '移動自己，目前在餐桌區', exact: true })).toBeVisible();
  await actor().dragTo(page.getByRole('heading', { name: '走廊', exact: true }));
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '撤回最近一步', exact: true }).click();
  await expect(page.getByRole('button', { name: '移動自己，目前在餐桌區', exact: true })).toBeVisible();
});

test('鍵盤能取消拿取、換位置及確認新版本，方向來自具體行動', async ({ page }) => {
  await startRedesign(page, 'redesign-slot08-evening');
  const actor = page.getByRole('button', { name: '移動自己，目前在走廊', exact: true });
  await page.keyboard.press('Tab');
  await actor.focus();
  await expectFocusRing(actor);
  await page.keyboard.press('Enter');
  await expect(page.getByText('已拿起「自己」。請選目的地。')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('已拿起「自己」。請選目的地。')).toHaveCount(0);
  await page.getByRole('button', { name: '走進沙發區', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await actor.focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: '走進餐桌區', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '確認答案', exact: true }).focus();
  await page.keyboard.press('Enter');
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toHaveText('走進餐桌區：今晚留給朋友，電影改到另一天。');
  await expect(page.locator('.evidence-label')).toHaveText('這次情境選擇與原先排序不同');
  await page.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('button', { name: '移動自己，目前在餐桌區', exact: true }).click();
  await page.getByRole('button', { name: '移回走廊', exact: true }).click();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '移動自己，目前在走廊', exact: true }).click();
  await page.getByRole('button', { name: '走進沙發區', exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toHaveText('走進沙發區：今晚好好看電影，和朋友另約時間。');
  await expect(page.locator('.evidence-label')).toHaveText('這次情境選擇與原先排序一致');
});


test.describe('場景觸控與窄螢幕', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 1600 } });
  test('真實觸控可拖進房間，也能捲動後先拿再放，深淺色均能完成', async ({ page }) => {
    await page.goto('/dev/interactions?question=redesign-slot08-evening');
    await page.getByRole('button', { name: '開始這次反思' }).tap();
    for (const group of await page.getByRole('group', { name: /的重要性$/ }).all()) await group.getByRole('button', { name: '這就是我', exact: true }).tap();
    await page.getByRole('button', { name: '下一步：排出順序' }).tap();
    await page.getByRole('button', { name: '進入情境中的取捨' }).tap();
    const actor = page.getByRole('button', { name: '移動自己，目前在走廊', exact: true });
    await actor.scrollIntoViewIfNeeded();
    const from = (await actor.boundingBox())!;
    const to = (await page.getByRole('heading', { name: '沙發區', exact: true }).boundingBox())!;
    const touch = await page.context().newCDPSession(page);
    // A distinct CDP touch ID keeps this drag separate from Playwright's native tap sequences.
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x + from.width / 2, y: from.y + from.height / 2, id: 41 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: to.x + to.width / 2, y: to.y + to.height / 2, id: 41 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.getByRole('button', { name: '移動自己，目前在沙發區', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '重設草稿', exact: true }).tap();
    await expect(page.getByRole('button', { name: '移動自己，目前在走廊', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 320, height: 844 });
    await page.getByRole('button', { name: '移動自己，目前在走廊', exact: true }).tap();
    await expect(page.getByText('已拿起「自己」。請選目的地。')).toBeVisible();
    await page.getByRole('button', { name: '走進餐桌區', exact: true }).tap();
    await expect(page.getByRole('button', { name: '移動自己，目前在餐桌區', exact: true })).toBeVisible();
    for (const width of [320, 390, 1100]) {
      await page.setViewportSize({ width, height: 844 });
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme });
        await expectNoHorizontalScroll(page);
        await expectNoClippedText(page.locator('.scenario-page'));
        await expectTouchTargets(page.locator('.scenario-page'));
      }
    }
    await page.getByRole('button', { name: '確認答案', exact: true }).tap();
    await expect(page.getByText('明確決策 1 / 1 題')).toBeVisible();
    await touch.detach();
  });
});
