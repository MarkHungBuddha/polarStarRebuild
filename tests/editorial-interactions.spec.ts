import { expect, test } from './support/fixtures';
import { classifyAndRankValues, expectNoHorizontalScroll } from './support/experience';

for (const variant of [0, 0.999]) {
  test.describe(`場景版本 ${variant}`, () => {
    test.use({ scenarioRandom: variant });
    test('註解改版：直接分類、實體操作、行程與分頁結果', async ({ page }) => {
      await page.setViewportSize({ width: variant === 0 ? 390 : 1440, height: 1000 });
      await page.goto('/');
      await classifyAndRankValues(page);
      await page.getByRole('button', { name: '進入情境中的取捨' }).click();
      for (let question = 1; question <= 15; question++) {
        await expect(page.getByRole('radio')).toHaveCount(0);
        await expect(page.getByRole('spinbutton')).toHaveCount(0);
        const confirm = page.getByRole('button', { name: '確認答案', exact: true });
        await expect(confirm).toBeDisabled();
        if (question === 1 && variant === 0) {
          const board = page.locator('.piggy-scene');
          await board.scrollIntoViewIfNeeded();
          const bounds = (await board.boundingBox())!;
          await page.mouse.move(bounds.x + 110 / 600 * bounds.width, bounds.y + 190 / 350 * bounds.height);
          await page.mouse.down();
          await page.mouse.move(bounds.x + 386 / 600 * bounds.width, bounds.y + 122 / 350 * bounds.height, { steps: 12 });
          await page.mouse.up();
          await expect(page.locator('.scene-feedback')).toContainText('1 個月生活費');
          await page.getByRole('button', { name: '放入一個月生活費', exact: true }).click();
          await expect(page.locator('.scene-feedback')).toContainText('2 個月生活費');
          await page.getByRole('button', { name: '取回一份', exact: true }).click();
          await expect(page.locator('.scene-feedback')).toContainText('1 個月生活費');
        } else if (question === 1 || question === 10) {
          await page.getByRole('button', { name: '往後翻一頁' }).click();
          await expect(page.getByRole('button', { name: /^選定 1 / })).toBeVisible();
          await page.getByRole('button', { name: '往前翻一頁' }).click();
          await expect(page.getByRole('button', { name: /^選定 0 / })).toBeVisible();
        } else if (question === 7) {
          const clock = page.getByRole('slider', { name: '拖動時針安排休閒時間' });
          await clock.scrollIntoViewIfNeeded();
          const bounds = (await clock.boundingBox())!;
          await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 91 / 400 * bounds.height); await page.mouse.down();
          await page.mouse.move(bounds.x + 299 / 400 * bounds.width, bounds.y + 190 / 400 * bounds.height, { steps: 12 }); await page.mouse.up();
          await expect(clock).toHaveAttribute('aria-valuenow', '3');
          await clock.focus(); await page.keyboard.press('ArrowRight');
          await expect(clock).toHaveAttribute('aria-valuenow', '4');
        } else if ([3, 6, 14].includes(question)) {
          const slots = page.locator('[data-planner-slot]');
          const total = await slots.count();
          const source = page.locator('.planner-activities button').nth(1);
          await source.evaluate(element => element.scrollIntoView({ block: 'center' }));
          const start = (await source.boundingBox())!; const end = (await slots.first().boundingBox())!;
          await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2); await page.mouse.down();
          await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 12 }); await page.mouse.up();
          await expect(slots.first()).toHaveClass(/activity-1/);
          for (let i = 1; i < total; i++) {
            await slots.nth(i).click();
            if (i < total - 1) await expect(confirm).toBeDisabled();
          }
          await page.locator('.planner-activities button').first().click();
          await slots.first().click();
          await expect(slots.first()).toHaveClass(/activity-0/);
        } else {
          await page.locator('.play-scene .scene-action').first().click();
        }
        await expectNoHorizontalScroll(page);
        if ([1, 3, 7, 10].includes(question)) await page.locator('.scenario-page').screenshot({ path: `test-results/revision-${variant}-${question}.png` });
        await confirm.click();
      }
      await expect(page.getByRole('heading', { name: '情境中的取捨', exact: true })).toHaveCount(0);
      await page.screenshot({ path: `test-results/summary-${variant}.png`, fullPage: true });
      await page.getByRole('button', { name: '閱讀詳細報告 →' }).click();
      await expect(page.getByRole('heading', { name: '情境中的取捨', exact: true })).toBeVisible();
      await page.getByRole('button', { name: '← 返回簡短結論' }).click();
      await expect(page.getByRole('heading', { name: '情境中的取捨', exact: true })).toHaveCount(0);
      await page.getByRole('button', { name: '閱讀詳細報告 →' }).click();
      await page.getByRole('button', { name: '修改這題', exact: true }).nth(2).click();
      await expect(page.locator('[data-planner-slot]').first()).toHaveClass(/activity-0/);
      await expect(page.locator('[data-planner-slot]').nth(1)).toHaveClass(/activity-1/);
      await page.getByRole('button', { name: '確認答案', exact: true }).click();
      await expect(page.getByRole('heading', { name: '情境中的取捨', exact: true })).toBeVisible();
    });
  });
}
