import { expect, test } from './support/fixtures';
import { answerRemainingScenarios, classifyAndRankValues, classifyValues, completeRemainingScenarios, expectNoHorizontalScroll } from './support/experience';

test('結果以兩份前三名開頭：第一幕自述的前三名，以及情境中最常選的價值與次數', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await completeRemainingScenarios(page);
  const conclusion = page.getByRole('region', { name: '你的前三名' });
  await expect(conclusion).toBeVisible();
  const stated = conclusion.getByRole('list').first();
  await expect(stated.getByRole('listitem')).toHaveText(['第 1自主', '第 2探索刺激', '第 3享受生活']);
  const chosen = conclusion.getByRole('list').nth(1).getByRole('listitem');
  expect(await chosen.count()).toBeGreaterThan(0);
  for (const item of await chosen.all()) await expect(item).toHaveText(/第 \d.+選了 \d+ 次／共 \d+ 題$/);
  const positions = (await chosen.allTextContents()).map(text => text.match(/第 (\d)/)![1]);
  expect(new Set(positions).size, '並列的價值合在同一列').toBe(positions.length);
  await expect(conclusion.getByText(/^自主：(在情境中選了 \d+ 次／共 \d+ 題|這次沒有能看出選邊的題目)/)).toBeVisible();
  await expect(conclusion.getByText(/改一題就可能換名次/)).toBeVisible();
  await expect(conclusion.getByText(/不在你最重視的前三名/)).toHaveCount(0);
  await expect(conclusion.getByText(/^另外在情境中常選的：/)).toHaveCount(1);
  const differing = conclusion.locator('.conclusion-differing a');
  expect(await differing.count()).toBeGreaterThan(0);
  const target = (await differing.first().getAttribute('href'))!;
  await differing.first().click();
  await expect(page.locator(target).locator('.evidence-label')).toHaveText('與第一幕不同');
  const allDiffering = await page.locator('.evidence-label', { hasText: '與第一幕不同' }).count();
  const othersNote = conclusion.getByText(/^其餘 \d+ 題/);
  const others = await othersNote.count() ? Number((await othersNote.textContent())!.match(/\d+/)![0]) : 0;
  expect(await differing.count() + others, '連結的題目加上其餘題數，就是所有標示為不同的題目').toBe(allDiffering);
  for (const link of await differing.all()) await expect(page.locator((await link.getAttribute('href'))!)).toContainText(/自主|探索刺激|享受生活/);
  await expect(page.getByText(/名次差|強度|診斷結果|真正的你/)).toHaveCount(0);
  await expectNoHorizontalScroll(page);
});

test('沒有調整排序時，自述前三名就是清單上的前三個', async ({ page }) => {
  await page.goto('/');
  await classifyValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await completeRemainingScenarios(page);
  const conclusion = page.getByRole('region', { name: '你的前三名' });
  const stated = conclusion.getByRole('list').first().getByRole('listitem');
  await expect(stated).toHaveCount(3);
  await expect(stated.nth(0)).toContainText('自主');
  await expect(stated.nth(1)).toContainText('探索刺激');
  await expect(stated.nth(2)).toContainText('享受生活');
  await expect(stated.filter({ hasText: '並列' })).toHaveCount(0);
  await expect(conclusion.getByRole('button', { name: '回第一幕調整' })).toHaveCount(0);
});

test('結果封面就顯示兩份完整的前三名，一個名次一列，不只第一名', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await classifyAndRankValues(page);
  await page.getByRole('button', { name: '進入情境中的取捨' }).click();
  await answerRemainingScenarios(page);
  await expect(page.getByRole('button', { name: '閱讀詳細報告 →' })).toBeVisible();
  const cover = page.getByRole('region', { name: '你的前三名' });
  await expect(cover.getByRole('list').first().getByRole('listitem')).toHaveText(['第 1自主', '第 2探索刺激', '第 3享受生活']);
  const chosen = cover.getByRole('list').nth(1).getByRole('listitem');
  const positions = (await chosen.allTextContents()).map(text => text.match(/第 (\d)/)![1]);
  expect(new Set(positions).size).toBe(positions.length);
  for (const item of await chosen.all()) await expect(item).toHaveText(/第 \d.+選了 \d+ 次／共 \d+ 題$/);
  await expect(page.getByText(/落差/)).toHaveCount(0);
  await expectNoHorizontalScroll(page);
});
