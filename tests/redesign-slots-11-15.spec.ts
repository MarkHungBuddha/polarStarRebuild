import { expect, test } from './support/fixtures';
import type { Page } from '@playwright/test';
import { redesignScenarios } from '../src/redesignRegistry';
import { redesignSlots11To15 } from '../src/scenarios/redesign-slots-11-15';
import { expectMechanismData, expectSlotContent, variantsOf } from './support/interactive-content';
import { openRedesignRecords, startRedesign } from './support/redesign';
import { expectNoHorizontalScroll, expectTouchTargets } from './support/experience';

const slots = ['slot11', 'slot12', 'slot13', 'slot14', 'slot15'] as const;

// The mechanism each variant uses, written out independently of the data (registry order, three variants per slot).
const mechanisms = [
  ['interactive-slot11-fund', 'resources'], ['interactive-slot11-event', 'message'], ['interactive-slot11-office', 'scene'],
  ['interactive-slot12-outing', 'calendar'], ['interactive-slot12-project', 'message'], ['interactive-slot12-flat', 'linked'],
  ['interactive-slot13-club', 'calendar'], ['interactive-slot13-alumni', 'scene'], ['interactive-slot13-exhibition', 'message'],
  ['interactive-slot14-preparation', 'resources'], ['interactive-slot14-bonus', 'scene'], ['interactive-slot14-workflow', 'priority'],
  ['interactive-slot15-meeting', 'calendar'], ['interactive-slot15-dinner', 'message'], ['interactive-slot15-reuse', 'resources'],
] as const;

test('第 11–15 組各恰有三個變體，沿用藍圖配對與原有識別次序，每題的機制資料完整，題面不寫出價值名稱也不催時間', () => {
  expectSlotContent(slots, redesignSlots11To15);
  expect(redesignSlots11To15.map(scenario => [scenario.id, scenario.interaction.kind])).toEqual(mechanisms);
  // The review bank keeps these 15 contiguous and in order, with ids and titles unique across the whole bank.
  const registry = redesignScenarios.map(scenario => scenario.id);
  const first = registry.indexOf(mechanisms[0][0]);
  expect(registry.slice(first, first + 15)).toEqual(mechanisms.map(([id]) => id));
  expect(new Set(registry).size).toBe(registry.length);
  expect(new Set(redesignScenarios.map(scenario => scenario.title)).size).toBe(redesignScenarios.length);
  for (const variant of redesignSlots11To15) {
    expectMechanismData(variant);
    expect([variant.title, variant.setup].join(''), variant.id).not.toMatch(/刪掉|劃掉|排完|分完/);
  }
});

test('只有訊息題不判方向，其餘機制的兩側依序對應價值配對', () => {
  for (const variant of slots.flatMap(slotId => variantsOf(slotId, redesignSlots11To15))) {
    const { interaction } = variant;
    if (interaction.kind === 'message') expect(JSON.stringify(interaction), variant.id).not.toContain('valueId');
    if (interaction.kind === 'priority') {
      // Six candidates, three for each value: keeping four can split 2:2 and so lean to neither.
      expect(interaction.items.filter(item => item.valueId === variant.pair[0]), variant.id).toHaveLength(3);
      expect(interaction.items.filter(item => item.valueId === variant.pair[1]), variant.id).toHaveLength(3);
    }
  }
});

const confirm = (page: Page) => page.getByRole('button', { name: '確認答案', exact: true });
const send = (page: Page) => page.getByRole('button', { name: '傳送這段訊息', exact: true });

/** One representative decision per question, the evidence line the result must then show and whether the decision leans (1) or not (0). */
interface Case { id: string; title: string; decide: (page: Page) => Promise<void>; evidence: string | RegExp; counted: 0 | 1 }

async function placeResources(page: Page, objects: readonly string[], destinations: readonly string[]) {
  for (const [index, object] of objects.entries()) {
    await page.getByRole('button', { name: object, exact: true }).click();
    await page.getByRole('button', { name: `放進${destinations[index]}`, exact: true }).click();
  }
}
async function placeCalendar(page: Page, slotNames: readonly string[], cards: readonly string[]) {
  for (const [index, slot] of slotNames.entries()) {
    await page.getByRole('button', { name: cards[index], exact: true }).click();
    await page.getByRole('button', { name: `${slot}：尚未安排`, exact: true }).click();
  }
}
const moveScene = async (page: Page, from: string, action: string) => {
  await page.getByRole('button', { name: from, exact: true }).click();
  await page.getByRole('button', { name: action, exact: true }).click();
};

const cases: Case[] = [
  {
    id: 'interactive-slot11-fund', title: '六場社區活動，最後由誰決定？', counted: 1,
    decide: page => placeResources(page, ['三月場決定牌', '五月場決定牌', '七月場決定牌', '九月場決定牌', '十月場決定牌', '十二月場決定牌'], ['我的企劃桌', '我的企劃桌', '我的企劃桌', '我的企劃桌', '居民代表桌', '居民代表桌']),
    evidence: /三月場決定牌：我的企劃桌.*十月場決定牌：居民代表桌/,
  },
  {
    id: 'interactive-slot11-event', title: '給代表們的回覆，你想傳哪些話？', counted: 0,
    decide: async page => { await page.getByRole('button', { name: '這場分享會的主題和報名名額，由我負責最後定案。', exact: true }).click(); await send(page).click(); },
    evidence: /^傳送的訊息：謝謝你們來信，說明各自需要什麼。議程我已經擬好/,
  },
  {
    id: 'interactive-slot11-office', title: '新辦公區的茶水間，最後由誰定案？', counted: 1,
    decide: async page => { await moveScene(page, '移動配置草案，目前在待定區', '放進同事代表區'); await expect(page.getByRole('status').filter({ hasText: '目前在同事代表區' })).toBeVisible(); },
    evidence: '放進同事代表區：茶水間由幾位同事代表共同定案，用得順手的人更多，你也就不能照自己的草案決定。',
  },
  {
    id: 'interactive-slot12-outing', title: '接下來四次聚會，誰來籌備？', counted: 1,
    decide: page => placeCalendar(page, ['第一次聚會', '第二次聚會', '第三次聚會', '第四次聚會'], ['由我籌備', '由我籌備', '由我籌備', '交給朋友籌備']),
    evidence: '第一次聚會：由我籌備；第二次聚會：由我籌備；第三次聚會：由我籌備；第四次聚會：交給朋友籌備',
  },
  {
    id: 'interactive-slot12-project', title: '給夥伴的回覆，你想傳哪些話？', counted: 0,
    decide: async page => { for (const text of ['原本說好由我定案，這次我想照自己的判斷決定方向。', '如果由你定案，我會在旁邊配合你的方向。']) await page.getByRole('button', { name: text, exact: true }).click(); await send(page).click(); },
    evidence: '傳送的訊息：我們各有一個方向，我覺得兩個都值得認真看。你想練習主導，我願意支持。最後選哪個方向，我想週三前先跟你一起討論。不管誰定案，我都會一起把企劃做完。',
  },
  {
    id: 'interactive-slot12-flat', title: '下個月的家務，由你排幾週？', counted: 1,
    decide: async page => { await page.getByRole('slider').fill('3'); await expect(page.getByText('讓室友排：1 週', { exact: true })).toBeVisible(); await confirm(page).click(); },
    evidence: /由我排的週數 3 週；讓室友排 1 週/,
  },
  {
    id: 'interactive-slot13-club', title: '今年四場例行活動，各照誰的安排？', counted: 0,
    decide: page => placeCalendar(page, ['春季聚會', '夏季出遊', '秋季成果展', '年終聚餐'], ['照我的新安排', '沿用傳下來的流程', '照我的新安排', '沿用傳下來的流程']),
    evidence: '春季聚會：照我的新安排；夏季出遊：沿用傳下來的流程；秋季成果展：照我的新安排；年終聚餐：沿用傳下來的流程',
  },
  {
    id: 'interactive-slot13-alumni', title: '返校日的開場，放在哪一邊？', counted: 1,
    decide: page => moveScene(page, '移動開場流程卷，目前在籌備桌', '放到老榕樹下'),
    evidence: /^放到老榕樹下：當天照例唱校歌/,
  },
  {
    id: 'interactive-slot13-exhibition', title: '給師傅們的信，你想寫哪些話？', counted: 0,
    decide: async page => { await send(page).click(); },
    evidence: /^傳送的訊息：展區我看過了.*當面跟你們確認細節。$/,
  },
  {
    id: 'interactive-slot14-preparation', title: '六個小時的防災準備，先做哪邊？', counted: 1,
    decide: page => placeResources(page, ['第一週・週一', '第一週・週三', '第一週・週五', '第二週・週一', '第二週・週三', '第二週・週五'], ['社區的防災資訊', '社區的防災資訊', '社區的防災資訊', '社區的防災資訊', '自己的防災準備', '自己的防災準備']),
    evidence: /第一週・週一：社區的防災資訊.*第二週・週五：自己的防災準備/,
  },
  {
    id: 'interactive-slot14-bonus', title: '多出來的五千元，放在哪裡？', counted: 1,
    decide: page => moveScene(page, '移動五千元信封，目前在桌面', '投進交通補助捐款箱'),
    evidence: /^投進交通補助捐款箱：遠方的孩子上學方便一些/,
  },
  {
    id: 'interactive-slot14-workflow', title: '六件改善工作，這個月先做哪四件？', counted: 1,
    // Moving 補上簡章的多語摘要 and 替活動影片補上字幕 forward keeps three fairness items among the four kept ones.
    decide: async page => {
      await page.getByRole('button', { name: '將替活動影片補上字幕往前移', exact: true }).click();
      await page.getByRole('button', { name: '將替活動影片補上字幕往前移', exact: true }).click();
      await page.getByRole('button', { name: '將補上簡章的多語摘要往前移', exact: true }).click();
      await page.getByRole('button', { name: '將補上簡章的多語摘要往前移', exact: true }).click();
      await page.getByRole('button', { name: '將補上簡章的多語摘要往前移', exact: true }).click();
      await confirm(page).click();
    },
    evidence: /^這個月做：.*；延到下個月：/,
  },
  {
    id: 'interactive-slot15-meeting', title: '今年四場年度聚會，誰來主持？', counted: 1,
    decide: page => placeCalendar(page, ['新春團拜', '創社紀念', '年中旅行', '年終晚會'], ['照新約定輪流主持', '照新約定輪流主持', '照新約定輪流主持', '照慣例由資深成員主持']),
    evidence: '新春團拜：照新約定輪流主持；創社紀念：照新約定輪流主持；年中旅行：照新約定輪流主持；年終晚會：照慣例由資深成員主持',
  },
  {
    id: 'interactive-slot15-dinner', title: '給部門的訊息，你想傳哪些話？', counted: 0,
    decide: async page => { for (const text of ['部門以前有大家一起請新人第一餐的習慣。', '其他人的部分，照新約定平分。']) await page.getByRole('button', { name: text, exact: true }).click(); await send(page).click(); },
    evidence: '傳送的訊息：週五聚餐的結帳方式，我先說明一下。我們這個月剛約好，聚餐費用以平分為原則。這次新同事的那一份，我想照老習慣由大家一起出。如果有人覺得不妥，歡迎直接跟我說，我們再調整。',
  },
  {
    id: 'interactive-slot15-reuse', title: '節慶聚會的四餐，初稿要調整嗎？', counted: 1,
    decide: async page => { await page.getByRole('button', { name: '維持這個安排', exact: true }).click(); await confirm(page).click(); },
    evidence: /^維持原本安排。用公用餐具 3 餐.*開幕晚宴：帶家裡的器皿/,
  },
];

for (const { id, title, decide, evidence, counted } of cases) {
  test(`${title}：本機清單可作答、確認，結果保留具體安排`, async ({ page }) => {
    await startRedesign(page, id);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    // Everything except a message (whose full draft can be sent as it is) needs an arrangement before it can be confirmed.
    if (!mechanisms.some(([key, kind]) => key === id && kind === 'message')) await expect(confirm(page)).toBeDisabled();
    await decide(page);
    if (await confirm(page).isVisible()) await confirm(page).click();
    const records = await openRedesignRecords(page);
    await expect(records.locator('.evidence-quote')).toHaveText(evidence);
    await expect(page.getByText(`明確決策 ${counted} / 1 題`, { exact: true })).toBeVisible();
  });
}

test('排序題只在容量內的內容形成比較時才判方向，維持初始順序是均分而不計次', async ({ page }) => {
  await startRedesign(page, 'interactive-slot14-workflow');
  await expect(page.getByText('可保留 4 個下午，其餘 2 項延後。')).toBeVisible();
  await page.getByRole('button', { name: '維持初始順序', exact: true }).click();
  await confirm(page).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('維持初始順序；這個月做：整理工作交接流程、把活動簡章改成易讀版、替重要檔案多備一份、替活動影片補上字幕');
  await expect(page.getByText('明確決策 0 / 1 題', { exact: true })).toBeVisible();
});

test('調整題與資源題的初始安排須明確維持；每週交給室友的週數保留逐週結果', async ({ page }) => {
  await startRedesign(page, 'interactive-slot15-reuse');
  await expect(confirm(page)).toBeDisabled();
  await expect(page.getByText('用公用餐具：3 餐', { exact: true })).toBeVisible();
  await expect(page.getByText('帶家裡的器皿：1 餐', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '開幕晚宴', exact: true }).click();
  await page.getByRole('button', { name: '放進用公用餐具', exact: true }).click();
  await expect(page.getByText('用公用餐具：4 餐', { exact: true })).toBeVisible();
  await confirm(page).click();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).not.toContainText('維持原本安排');
  await expect(page.getByText('明確決策 1 / 1 題', { exact: true })).toBeVisible();
});

test('均分的行事曆不計次，確認後返回修改能還原原本的逐項安排', async ({ page }) => {
  await startRedesign(page, 'interactive-slot12-outing');
  await placeCalendar(page, ['第一次聚會', '第二次聚會', '第三次聚會', '第四次聚會'], ['由我籌備', '交給朋友籌備', '由我籌備', '交給朋友籌備']);
  await confirm(page).click();
  await expect(page.getByText('明確決策 0 / 1 題', { exact: true })).toBeVisible();
  await (await openRedesignRecords(page)).getByRole('button', { name: '修改這題' }).click();
  await expect(page.getByRole('button', { name: '第二次聚會：交給朋友籌備', exact: true })).toBeVisible();
  await expect(page.getByText('還有 0 次未安排')).toBeVisible();
});

test('訊息題可以全刪後選擇這次不傳，與目前無法決定分開記錄', async ({ page }) => {
  await startRedesign(page, 'interactive-slot15-dinner');
  const bubble = page.getByRole('group', { name: '尚未傳送的訊息' });
  for (const sentence of await bubble.getByRole('button').all()) await sentence.click();
  await expect(page.getByRole('status', { name: '訊息預覽' })).toContainText('會傳出 0 句');
  await page.getByRole('button', { name: '這次不傳', exact: true }).click();
  await expect((await openRedesignRecords(page)).locator('.evidence-quote')).toHaveText('這次不傳訊息');
});

test('鍵盤可完成物件分配與訊息題', async ({ page }) => {
  await startRedesign(page, 'interactive-slot11-fund');
  for (const [index, object] of ['三月場決定牌', '五月場決定牌', '七月場決定牌', '九月場決定牌', '十月場決定牌', '十二月場決定牌'].entries()) {
    await page.getByRole('button', { name: object, exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: index < 4 ? '放進我的企劃桌' : '放進居民代表桌', exact: true }).focus();
    await page.keyboard.press('Enter');
  }
  await confirm(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('明確決策 1 / 1 題', { exact: true })).toBeVisible();
  await startRedesign(page, 'interactive-slot12-project');
  const first = page.getByRole('group', { name: '尚未傳送的訊息' }).getByRole('button').first();
  await first.focus();
  await page.keyboard.press('Space');
  await expect(first).toHaveAttribute('aria-pressed', 'false');
  await send(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('明確決策 0 / 1 題', { exact: true })).toBeVisible();
});

test.describe('手機觸控', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  for (const id of ['interactive-slot14-workflow', 'interactive-slot13-alumni', 'interactive-slot12-flat', 'interactive-slot13-club']) {
    test(`${id} 在 390px 沒有橫向捲動，觸控目標夠大`, async ({ page }) => {
      await startRedesign(page, id);
      await expectNoHorizontalScroll(page);
      await expectTouchTargets(page);
    });
  }
});
