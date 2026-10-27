import { test, expect } from './support/fixtures';
import { startRedesign, openRedesignRecords } from './support/redesign';
import { expectNoHorizontalScroll, expectTouchTargets } from './support/experience';
import type { Page } from '@playwright/test';

const clockOf = (page: Page) => page.getByRole('slider', { name: '休閒留白的安排', exact: true });
async function clockPoint(page: Page, hour: number) {
  const box = (await clockOf(page).boundingBox())!;
  const angle = hour * Math.PI / 6;
  return { x: box.x + box.width / 2 + box.width * .31 * Math.sin(angle), y: box.y + box.height / 2 - box.height * .31 * Math.cos(angle) };
}

test('時鐘連動保留原始時數與作品進度，預設須明確維持', async ({ page }) => {
  await startRedesign(page, 'redesign-slot07-saturday');
  await expect(page.getByRole('heading', { name: '週六六小時，留多少空白？' })).toBeVisible();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  const clock = page.getByRole('slider', { name: '休閒留白的安排', exact: true });
  await clock.focus(); await page.keyboard.press('ArrowRight');
  await expect(clock).toHaveAttribute('aria-valuenow', '4');
  await expect(page.getByText('八週投入作品：16 小時', { exact: true })).toBeVisible();
  await expect(page.getByText('發表日後待補：8 小時', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByText('明確決策 1 / 1 題')).toBeVisible();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('休閒留白 4 小時');
  await expect(page.locator('.evidence-quote')).toContainText('發表日後待補 8 小時');
});

test('鍵盤守住上下界，維持、撤回、重設與無法決定皆須確認', async ({ page }) => {
  await startRedesign(page, 'redesign-slot07-saturday');
  const clock = clockOf(page);
  await clock.focus(); await page.keyboard.press('Home'); await page.keyboard.press('ArrowLeft');
  await expect(clock).toHaveAttribute('aria-valuenow', '0');
  await page.keyboard.press('End'); await page.keyboard.press('ArrowRight');
  await expect(clock).toHaveAttribute('aria-valuenow', '6');
  await expect(page.getByText('發表日後待補：24 小時', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '重設草稿', exact: true }).click();
  await expect(clock).toHaveAttribute('aria-valuenow', '3');
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '維持這個安排', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  await expect(clock).toHaveAttribute('aria-valuenow', '3');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByText('明確決策 0 / 1 題')).toBeVisible();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('明確維持：休閒留白 3 小時');
  await page.getByRole('button', { name: '修改這題', exact: true }).click();
  await clock.focus(); await page.keyboard.press('ArrowRight');
  await page.getByRole('button', { name: '撤回最近一步', exact: true }).click();
  await expect(clock).toHaveAttribute('aria-valuenow', '3');
  await page.getByRole('button', { name: '目前無法決定', exact: true }).click();
  await expect(page.getByRole('heading', { name: '週六六小時，留多少空白？' })).toBeVisible();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toHaveText('目前無法決定');
});

test('滑鼠拖動時針連動進度，撤回整次拖曳，草稿不覆寫結果', async ({ page }) => {
  await startRedesign(page, 'redesign-slot07-saturday');
  await clockOf(page).scrollIntoViewIfNeeded();
  const from = await clockPoint(page, 4);
  const to = await clockPoint(page, 6);
  await page.mouse.move(from.x, from.y); await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 5 }); await page.mouse.up();
  await expect(clockOf(page)).toHaveAttribute('aria-valuenow', '5');
  await page.getByRole('button', { name: '撤回最近一步', exact: true }).click();
  await expect(clockOf(page)).toHaveAttribute('aria-valuenow', '3');
  await page.getByRole('button', { name: '維持這個安排', exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await openRedesignRecords(page);
  await page.getByRole('button', { name: '修改這題', exact: true }).click();
  await clockOf(page).focus(); await page.keyboard.press('End');
  await page.getByRole('button', { name: '返回已確認結果', exact: true }).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('休閒留白 3 小時');
  await page.getByRole('button', { name: '修改這題', exact: true }).click();
  await expect(clockOf(page)).toHaveAttribute('aria-valuenow', '3');
});

test('桌曆接受條件保留天數，極端條件也不推算方向', async ({ page }) => {
  await startRedesign(page, 'redesign-slot01-notice');
  const range = page.getByRole('slider', { name: '提前通知（天）', exact: true });
  await range.focus(); await page.keyboard.press('End');
  await expect(page.getByText('主辦者固定路線的提前時間：14 天', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByText('明確決策 0 / 1 題')).toBeVisible();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('提前通知 14 天');
  await expect(page.locator('.evidence-label')).toHaveText('無法對照');
});

test.describe('觸控', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 1200 } });
  test('觸控拖動鐘面產生相同時數，窄螢幕與深淺色可讀', async ({ page }) => {
    await startRedesign(page, 'redesign-slot07-saturday');
    await clockOf(page).scrollIntoViewIfNeeded();
    const from = await clockPoint(page, 4);
    const to = await clockPoint(page, 6);
    const touch = await page.context().newCDPSession(page);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 41 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...to, id: 41 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await touch.detach();
    await expect(clockOf(page)).toHaveAttribute('aria-valuenow', '5');
    await expect(page.getByText('發表日後待補：16 小時', { exact: true })).toBeVisible();
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
