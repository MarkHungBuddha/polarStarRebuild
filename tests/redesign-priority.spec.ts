import { test, expect } from './support/fixtures';
import { startRedesign, openRedesignRecords } from './support/redesign';
import { expectNoHorizontalScroll, expectTouchTargets } from './support/experience';
import { dragWithTouch } from './support/object-drag';

test('排序跨過容量界線後，確認及回顧保留完整先後', async ({ page }) => {
  await startRedesign(page, 'redesign-slot05-priority');
  await expect(page.getByRole('heading', { name: '只有三次空檔，哪些先留下？' })).toBeVisible();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '將重拍攝影作品往前移' }).click();
  await expect(page.getByRole('region', { name: '本月保留' })).toContainText('重拍攝影作品');
  await expect(page.getByRole('region', { name: '延到下月' })).toContainText('到街上採集聲音');
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  const evidence = await openRedesignRecords(page);
  await expect(evidence).toContainText('本月保留：試一堂木工課、參加即興工作坊、重拍攝影作品');
  await expect(evidence).toContainText('延到下月：到街上採集聲音、整理作品集順序、完成攝影作品說明');
  await expect(page.getByText('明確決策 1 / 1 題')).toBeVisible();
  await page.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('button', { name: '將重拍攝影作品往前移' }).click();
  await page.getByRole('button', { name: '返回已確認結果' }).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('本月保留：試一堂木工課、參加即興工作坊、重拍攝影作品');
});

test('維持、撤回、重設和無法決定都須確認，首尾有移動界線', async ({ page }) => {
  await startRedesign(page, 'redesign-slot05-priority');
  await expect(page.getByRole('button', { name: '將試一堂木工課往前移' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '將完成攝影作品說明往後移' })).toBeDisabled();
  await page.getByRole('button', { name: '維持初始順序' }).click();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: '撤回最近一步' }).click();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  const move = page.getByRole('button', { name: '將重拍攝影作品往前移' });
  await move.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: '本月保留' })).toContainText('重拍攝影作品');
  await page.getByRole('button', { name: '重設草稿' }).click();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '目前無法決定', exact: true }).click();
  await page.getByRole('button', { name: '撤回最近一步' }).click();
  await expect(page.getByRole('button', { name: '目前無法決定', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: '維持初始順序' }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('維持初始順序；本月保留：試一堂木工課、參加即興工作坊、到街上採集聲音');
  await page.getByRole('button', { name: '修改這題' }).click();
  await page.getByRole('button', { name: '目前無法決定', exact: true }).click();
  await page.getByRole('button', { name: '確認答案', exact: true }).click();
  await expect(page.getByText('明確決策 0 / 1 題')).toBeVisible();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toHaveText('目前無法決定');
});

test('滑鼠拖曳和先選再放保持相同先後，無效放置不改安排', async ({ page }) => {
  await startRedesign(page, 'redesign-slot05-priority');
  const photo = page.getByRole('button', { name: /4\. 重拍攝影作品/ });
  const sound = page.getByRole('button', { name: /3\. 到街上採集聲音/ });
  await photo.dragTo(sound);
  await expect(page.getByRole('region', { name: '本月保留' }).locator('li')).toHaveCount(3);
  await expect(page.getByRole('button', { name: /3\. 重拍攝影作品/ })).toBeVisible();
  await page.getByRole('button', { name: /3\. 重拍攝影作品/ }).dragTo(page.getByRole('heading', { name: '只有三次空檔，哪些先留下？' }));
  await expect(page.getByRole('button', { name: /3\. 重拍攝影作品/ })).toBeVisible();
  await page.getByRole('button', { name: /4\. 到街上採集聲音/ }).click();
  await page.getByRole('button', { name: /3\. 重拍攝影作品/ }).click();
  await expect(page.getByRole('button', { name: /3\. 到街上採集聲音/ })).toBeVisible();
});

test.describe('排序觸控', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 1600 } });
  test('實際觸控跨過容量界線，窄螢幕深淺色均可操作', async ({ page }) => {
    await startRedesign(page, 'redesign-slot05-priority');
    await dragWithTouch(page, page.getByRole('button', { name: /4\. 重拍攝影作品/ }), page.getByRole('button', { name: /3\. 到街上採集聲音/ }));
    await expect(page.getByRole('region', { name: '本月保留' })).toContainText('重拍攝影作品');
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme });
        await expectNoHorizontalScroll(page);
        await expectTouchTargets(page.locator('.scenario-page'));
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'test-results/priority-dark-390.png', fullPage: true });
  });
});
