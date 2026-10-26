import { test, expect } from './support/fixtures';
import { startRedesign, openRedesignRecords } from './support/redesign';
import { expectNoHorizontalScroll, expectTouchTargets } from './support/experience';

async function splitResources(page: import('@playwright/test').Page, left: number) {
  for (let token = 1; token <= 6; token++) {
    await page.getByRole('button', { name: `時間籌碼 ${token}`, exact: true }).click();
    await page.getByRole('button', { name: token <= left ? '放進家裡的準備簿' : '放進社區的資訊簿', exact: true }).click();
  }
}

test('時間籌碼可分配、取回及重分，確認紀錄保留每枚去向', async ({ page }) => {
  await startRedesign(page, 'redesign-slot14-preparation');
  await expect(page.getByRole('heading', { name: '六個小時，先準備哪一些？' })).toBeVisible();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  for (let token = 1; token <= 6; token++) {
    await page.getByRole('button', { name: `時間籌碼 ${token}`, exact: true }).click();
    await page.getByRole('button', { name: token <= 4 ? '放進家裡的準備簿' : '放進社區的資訊簿', exact: true }).click();
  }
  await expect(page.getByText('家裡的準備簿：4 小時', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '時間籌碼 1', exact: true }).click();
  await page.getByRole('button', { name: '放回未分配區', exact: true }).click();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '撤回最近一步', exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('時間籌碼 1：家裡的準備簿');
  await expect(page.locator('.evidence-quote')).toContainText('時間籌碼 6：社區的資訊簿');
  await expect(page.getByText('明確決策 1 / 1 題')).toBeVisible();
});

test('零分配與均分保留原始去向，草稿修改不覆寫已確認答案', async ({ page }) => {
  await startRedesign(page, 'redesign-slot14-preparation');
  await splitResources(page, 0);
  await expect(page.getByRole('button', { name: /^時間籌碼 \d$/ })).toHaveCount(6);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('家裡的準備簿 0 小時');
  await page.getByRole('button', { name: '修改這題', exact: true }).click();
  await splitResources(page, 3);
  await page.getByRole('button', { name: '返回已確認結果', exact: true }).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('家裡的準備簿 0 小時');
  await page.getByRole('button', { name: '修改這題', exact: true }).click();
  await expect(page.getByText('社區的資訊簿：6 小時', { exact: true })).toBeVisible();
  await splitResources(page, 3);
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByText('明確決策 0 / 1 題')).toBeVisible();
});

test('初始安排須明確維持，重設與無法決定不會自動提交', async ({ page }) => {
  await startRedesign(page, 'redesign-slot14-preparation-initial');
  const confirm = page.getByRole('button', { name: '確認答案', exact: true });
  await expect(confirm).toBeDisabled();
  await page.getByRole('button', { name: '維持這個安排', exact: true }).click();
  await expect(confirm).toBeEnabled();
  await page.getByRole('button', { name: '重設草稿', exact: true }).click();
  await expect(confirm).toBeDisabled();
  await page.getByRole('button', { name: '維持這個安排', exact: true }).click();
  await confirm.click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('維持原本安排。');
  await page.getByRole('button', { name: '修改這題', exact: true }).click();
  await page.getByRole('button', { name: '目前無法決定', exact: true }).click();
  await expect(page.getByRole('heading', { name: '原本排好的六小時，要調整嗎？' })).toBeVisible();
  await confirm.click();
  await expect(page.getByText('明確決策 0 / 1 題')).toBeVisible();
});

test('滑鼠拖曳與鍵盤能重分同一籌碼，Esc 可取消拿取', async ({ page }) => {
  await startRedesign(page, 'redesign-slot14-preparation');
  const token = page.getByRole('button', { name: '時間籌碼 1', exact: true });
  await token.dragTo(page.getByRole('button', { name: '放進家裡的準備簿', exact: true }));
  await expect(page.getByText('家裡的準備簿：1 小時', { exact: true })).toBeVisible();
  await token.dragTo(page.getByRole('button', { name: '放進社區的資訊簿', exact: true }));
  await expect(page.getByText('家裡的準備簿：0 小時', { exact: true })).toBeVisible();
  await token.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Escape');
  await expect(token).toHaveAttribute('aria-pressed', 'false');
  await token.focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '放回未分配區', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('未分配：6 小時', { exact: true })).toBeVisible();
});

test.describe('觸控', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 1600 } });
  test('可拖曳、先拿取再捲動放下，320px 深淺色保持可用', async ({ page }) => {
    await startRedesign(page, 'redesign-slot14-preparation');
    const token = page.getByRole('button', { name: '時間籌碼 1', exact: true });
    const target = page.getByRole('button', { name: '放進家裡的準備簿', exact: true });
    await token.scrollIntoViewIfNeeded();
    const from = (await token.boundingBox())!;
    const to = (await target.boundingBox())!;
    const touch = await page.context().newCDPSession(page);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x + from.width / 2, y: from.y + from.height / 2 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: to.x + to.width / 2, y: to.y + to.height / 2 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await touch.detach();
    await expect(page.getByText('家裡的準備簿：1 小時', { exact: true })).toBeVisible();
    await token.tap();
    await page.setViewportSize({ width: 320, height: 600 });
    await page.getByRole('button', { name: '放進社區的資訊簿', exact: true }).scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: '放進社區的資訊簿', exact: true }).tap();
    await expect(page.getByText('社區的資訊簿：1 小時', { exact: true })).toBeVisible();
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      await expectNoHorizontalScroll(page);
      await expectTouchTargets(page.locator('.scenario-page'));
    }
  });
});
