import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
import { expectNoClippedText, expectNoHorizontalScroll, expectTouchTargets } from './support/experience';
import { interactiveScenarios } from '../src/interactiveScenarios';
import { expectSlotContent } from './support/interactive-content';
import {
  allocationCells, answerInteractiveByTitle, choiceCards, confirmButton, keepButton, priorityRows, questionHeading, resultHeading,
  startInteractiveScenarios, undecidedButton, type InteractiveDecision,
} from './support/interactive';

test('第 1–5 組各恰有三個互動變體，沿用藍圖配對，三種互動各用五次，題面不寫出價值名稱也不催時間', () => {
  expectSlotContent(['slot01', 'slot02', 'slot03', 'slot04', 'slot05']);
  expect(interactiveScenarios.map(scenario => scenario.id).filter(id => id.includes('sample')), 'the AI-draft samples are gone').toEqual([]);
});

/** One draw of slots 1–5: the decision for each of its titles, and the second-act rows those decisions give. */
interface Draw { scenarioRandom: number; decisions: Record<string, InteractiveDecision>; rows: string[]; decided: number }

// scenarioRandom 0, 0.5 and 0.99 draw the first, second and third variant of every slot. Every other slot is answered
// 目前無法決定, so the rows come from slots 1–5 alone.
const draws: Draw[] = [{
  scenarioRandom: 0,
  decisions: {
    '六天的旅程，哪幾天自己排？': { allocate: [4, 2] },
    '這份提案，用誰的方法？': '選 B',
    '這個月的週末下午，照原本排的嗎？': '維持初始安排',
    '這兩週，要去新團隊支援嗎？': '選 A',
    '四天連假，照原本排的過嗎？': { allocate: [1, 3] },
  },
  rows: ['第 1｜自主｜2 次／3 題', '並列第 2｜傳承、探索刺激、遵守規範｜1 次／3 題'],
  decided: 5,
}, {
  scenarioRandom: 0.5,
  decisions: {
    '明年的合作，照草案走嗎？': { allocate: [3, 1] },
    '六週的共學，讀哪一章？': '平均分配',
    '空出來的週六，給誰？': '選 B',
    '四個週末，照原本排的走嗎？': '維持初始安排',
    '冬至聚會的六道菜，怎麼做？': { allocate: [6, 0] },
  },
  rows: ['並列第 1｜安全穩定、探索刺激、照顧身邊的人、自主｜1 次／3 題'],
  decided: 4,
}, {
  scenarioRandom: 0.99,
  decisions: {
    '這次租約，續住還是搬家？': '選 B',
    '這個月的打掃，照原本的約定嗎？': '維持初始安排',
    '這三週的晚上，留給哪件事？': { allocate: [2, 4] },
    '六堂工作坊，選哪一種？': { allocate: [5, 1] },
    '同一天，去工藝日還是新體驗？': '目前無法決定',
  },
  rows: ['並列第 1｜安全穩定、探索刺激、照顧身邊的人、遵守規範｜1 次／3 題'],
  decided: 4,
}];

/** Sets and confirms the current question with the keyboard alone: focus moves to a control, Enter, Space or the arrows act on it. */
async function confirmByKeyboard(page: Page, decision: InteractiveDecision) {
  if (decision === '目前無法決定' || decision === '維持初始安排') {
    await (decision === '目前無法決定' ? undecidedButton(page) : keepButton(page)).focus();
    await page.keyboard.press('Enter');
  } else if (decision === '選 A' || decision === '選 B') {
    await choiceCards(page).first().focus();
    await page.keyboard.press('Space');
    if (decision === '選 B') await page.keyboard.press('ArrowDown');
  } else {
    const cells = await allocationCells(page).all();
    const [a] = decision === '平均分配' ? [cells.length / 2] : decision.allocate;
    for (const [index, cell] of cells.entries()) {
      await cell.getByRole('button').nth(index < a ? 0 : 1).focus();
      await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
    }
  }
  await confirmButton(page).focus();
  await page.keyboard.press('Enter');
}

for (const { scenarioRandom, decisions, rows, decided } of draws) {
  const titles = Object.keys(decisions);
  test.describe(`第 1–5 組的第 ${draws.findIndex(draw => draw.scenarioRandom === scenarioRandom) + 1} 個變體`, () => {
    test.use({ scenarioRandom });

    test('只靠點選，依標題完成每一題，算出的次數正確', async ({ page }) => {
      await startInteractiveScenarios(page);
      const answered = await answerInteractiveByTitle(page, decisions, '目前無法決定');
      expect(answered.slice(0, 5)).toEqual(titles);
      expect(await priorityRows(page)).toEqual(rows);
      await expect(page.getByText(`明確決策 ${decided} / ${answered.length} 題`, { exact: true })).toBeVisible();
    });

    test('只用鍵盤也能完成每一題，算出的次數跟點選相同', async ({ page }) => {
      await startInteractiveScenarios(page);
      while (!await resultHeading(page).isVisible()) {
        const title = (await questionHeading(page).textContent())!;
        await confirmByKeyboard(page, decisions[title] ?? '目前無法決定');
        await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(0);
      }
      expect(await priorityRows(page)).toEqual(rows);
    });

    test('手機寬度下每題的操作區不溢出、不橫向捲動，控制項夠大', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await startInteractiveScenarios(page);
      for (const title of titles) {
        await expect(questionHeading(page)).toHaveText(title);
        const mechanic = page.locator('.scenario-mechanic');
        await expectNoHorizontalScroll(page);
        await expectNoClippedText(mechanic);
        await expectTouchTargets(mechanic);
        await confirmByKeyboard(page, '目前無法決定');
      }
    });
  });
}
