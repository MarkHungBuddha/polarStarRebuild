import { test, expect } from './support/fixtures';
import { startRedesign, openRedesignRecords } from './support/redesign';
import { expectNoHorizontalScroll, expectTouchTargets } from './support/experience';
import { baseValues } from '../src/data';
import { redesignSlots06To10 } from '../src/scenarios/redesign-slots-06-10';
import { redesignScenarios } from '../src/redesignRegistry';
import { blueprint } from './support/blueprint';
import type { Page } from '@playwright/test';

/** Question, mechanism and the raw decision shown in the records; written independently of the data under test. */
const bank = [
  { id: 'interactive-slot06-sessions', slotId: 'slot06', kind: 'priority', title: '三次進修空檔，先排哪些？' },
  { id: 'interactive-slot06-project', slotId: 'slot06', kind: 'scene', title: '下一季，把工作牌放在哪張桌？' },
  { id: 'interactive-slot06-community', slotId: 'slot06', kind: 'calendar', title: '這個月的四個週六，活動卡怎麼放？' },
  { id: 'interactive-slot07-weekends', slotId: 'slot07', kind: 'calendar', title: '六個週末，作品和休息怎麼分？' },
  { id: 'interactive-slot07-bonus', slotId: 'slot07', kind: 'resources', title: '這筆獎金的六張預算券，放在哪裡？' },
  { id: 'interactive-slot07-study', slotId: 'slot07', kind: 'linked', title: '八週的週六下午，留多少給課程？' },
  { id: 'interactive-slot08-afternoons', slotId: 'slot08', kind: 'calendar', title: '四個週六下午，行事曆放什麼？' },
  { id: 'interactive-slot08-evening', slotId: 'slot08', kind: 'scene', title: '電影只剩今晚，你走向哪裡？' },
  { id: 'interactive-slot08-unpacking', slotId: 'slot08', kind: 'resources', title: '四個晚上，原本的安排要調整嗎？' },
  { id: 'interactive-slot09-rooftop', slotId: 'slot09', kind: 'linked', title: '十點到了，你想在頂樓待到幾點？' },
  { id: 'interactive-slot09-phone-free', slotId: 'slot09', kind: 'scene', title: '甜點上桌，手機放在哪裡？' },
  { id: 'interactive-slot09-quiet-hours', slotId: 'slot09', kind: 'message', title: '讀書會還想多聊，你會留下哪些話？' },
  { id: 'interactive-slot10-contest', slotId: 'slot10', kind: 'resources', title: '最後六天，工作籌碼放在哪張桌？' },
  { id: 'interactive-slot10-accessible', slotId: 'slot10', kind: 'linked', title: '加做另一種版本，你願意多留幾週？' },
  { id: 'interactive-slot10-notes', slotId: 'slot10', kind: 'priority', title: '分享前四晚，先保留哪些工作？' },
] as const;

test('第6–10組題庫契約：識別、次序、配對與各機制必要資料', () => {
  expect(redesignSlots06To10.map(({ id, slotId, interaction, title }) => ({ id, slotId, kind: interaction.kind, title })))
    .toEqual(bank.map(({ id, slotId, kind, title }) => ({ id, slotId, kind, title })));
  const registry = redesignScenarios.map(scenario => scenario.id);
  expect(new Set(registry).size).toBe(registry.length);
  expect(new Set(redesignScenarios.map(scenario => scenario.title)).size).toBe(redesignScenarios.length);
  // The 15 questions stay contiguous and in order inside the review bank.
  const first = registry.indexOf(bank[0].id);
  expect(registry.slice(first, first + 15)).toEqual(bank.map(item => item.id));
  const words = baseValues.map(value => value.word);
  for (const scenario of redesignSlots06To10) {
    const { id, interaction } = scenario;
    expect([...scenario.pair], id).toEqual(blueprint[scenario.slotId]);
    expect(id.startsWith(`interactive-${scenario.slotId}-`), id).toBe(true);
    expect(scenario.title, id).toMatch(/？$/);
    expect(scenario.setup, id).not.toMatch(/？$/);
    expect(scenario.setup.length, id).toBeGreaterThan(80);
    const shown = JSON.stringify([scenario.title, scenario.setup, interaction]);
    for (const word of words) expect(shown, `${id} reveals ${word}`).not.toContain(word);
    expect(shown, id).not.toMatch(/倒數|計時|限時|趕快/);
    expect(shown, id).not.toMatch(/[软视质户络库]/);
    if (interaction.kind === 'priority') {
      expect(interaction.items.length, id).toBeGreaterThan(interaction.capacity);
      expect(interaction.resourceUnit, id).toBeTruthy();
      expect(new Set(interaction.items.map(item => item.id)).size, id).toBe(interaction.items.length);
      expect(interaction.items.filter(item => item.valueId === scenario.pair[0]), id).toHaveLength(interaction.items.length / 2);
      expect(interaction.items.filter(item => item.valueId === scenario.pair[1]), id).toHaveLength(interaction.items.length / 2);
    }
    if (interaction.kind === 'scene') {
      expect(interaction.locations.map(location => location.valueId), id).toEqual([...scenario.pair]);
      for (const location of interaction.locations) { expect(location.action, id).toBeTruthy(); expect(location.consequence.length, id).toBeGreaterThan(15); }
    }
    if (interaction.kind === 'calendar') {
      expect(interaction.slots.length % 2, id).toBe(0);
      expect(interaction.sides.map(side => side.valueId), id).toEqual([...scenario.pair]);
    }
    if (interaction.kind === 'resources') {
      expect(interaction.objects.length % 2, id).toBe(0);
      expect(interaction.sides.map(side => side.valueId), id).toEqual([...scenario.pair]);
      if (interaction.initial) expect(interaction.initial, id).toHaveLength(interaction.objects.length);
    }
    if (interaction.kind === 'calendar' || interaction.kind === 'resources') for (const side of interaction.sides) expect(side.detail, `${id} ${side.id}`).toMatch(/也|就/);
    if (interaction.kind === 'linked') {
      expect(interaction.min, id).toBeLessThan(interaction.max);
      expect(interaction.initial, id).toBeGreaterThanOrEqual(interaction.min);
      expect(interaction.initial, id).toBeLessThanOrEqual(interaction.max);
      // A direction exists only for an explicitly fixed total of one resource.
      if (interaction.resourceSides) {
        expect(interaction.resourceTotal, id).toBe(interaction.max);
        expect(interaction.min, id).toBe(0);
        expect(interaction.resourceSides.map(side => side.valueId), id).toEqual([...scenario.pair]);
      }
    }
    if (interaction.kind === 'message') expect(interaction.sentences.length, id).toBeGreaterThanOrEqual(5);
  }
  const directional = redesignSlots06To10.filter(scenario => scenario.interaction.kind === 'linked' && !scenario.interaction.resourceSides).map(scenario => scenario.id);
  expect(directional).toEqual(['interactive-slot09-rooftop', 'interactive-slot10-accessible']);
});

const confirm = (page: Page) => page.getByRole('button', { name: '確認答案', exact: true }).click();
const scene = async (page: Page, action: string) => { await page.locator('.scene-object').click(); await page.getByRole('button', { name: action, exact: true }).click(); };
const calendar = async (page: Page, noun: string, picks: readonly string[]) => {
  for (const [index, side] of picks.entries()) {
    await page.getByRole('button', { name: side, exact: true }).first().click();
    await page.getByRole('button', { name: `第${index + 1}個${noun}：尚未安排`, exact: true }).click();
  }
};
const tokens = async (page: Page, names: readonly string[], destinations: readonly string[]) => {
  for (const [index, name] of names.entries()) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.getByRole('button', { name: `放進${destinations[index]}`, exact: true }).click();
  }
};
const budget = ['預算券 1', '預算券 2', '預算券 3', '預算券 4', '預算券 5', '預算券 6'];
const rest = '放鬆假期的安排';
const prep = '專業實作的準備';
const days = ['工作籌碼 1', '工作籌碼 2', '工作籌碼 3', '工作籌碼 4', '工作籌碼 5', '工作籌碼 6'];

/** Each case acts through the visible controls, then states the record and whether the answer leans (the direction rule). */
const flows: Record<string, { act: (page: Page) => Promise<void>; send?: string; evidence: string[]; decided: 0 | 1 }> = {
  'interactive-slot06-sessions': { act: async page => { await page.getByRole('button', { name: '維持初始順序', exact: true }).click(); },
    evidence: ['維持初始順序；這個月先做：試一堂木工課、重拍攝影作品、參加即興工作坊', '延到下個月：整理作品集順序、到街上採集聲音、完成攝影作品說明'], decided: 1 },
  'interactive-slot06-project': { act: page => scene(page, '選擇陌生案子'), evidence: ['選擇陌生案子：'], decided: 1 },
  'interactive-slot06-community': { act: page => calendar(page, '週六', ['去體驗場試新活動', '去練習班準備展示', '去體驗場試新活動', '去體驗場試新活動']),
    evidence: ['第1個週六：去體驗場試新活動', '第2個週六：去練習班準備展示', '第4個週六：去體驗場試新活動'], decided: 1 },
  'interactive-slot07-weekends': { act: page => calendar(page, '週末', ['去共學做作品', '去共學做作品', '留給自己休息', '去共學做作品', '留給自己休息', '留給自己休息']),
    evidence: ['第1個週末：去共學做作品', '第3個週末：留給自己休息', '第6個週末：留給自己休息'], decided: 0 },
  'interactive-slot07-bonus': { act: page => tokens(page, budget, [rest, rest, rest, rest, prep, prep]),
    evidence: ['放鬆假期的安排 4 張', '專業實作的準備 2 張', '預算券 1：放鬆假期的安排', '預算券 6：專業實作的準備'], decided: 1 },
  'interactive-slot07-study': { act: async page => { const clock = page.getByRole('slider', { name: '休閒留白的安排', exact: true }); await clock.focus(); await page.keyboard.press('ArrowRight'); await expect(clock).toHaveAttribute('aria-valuenow', '4'); },
    evidence: ['休閒留白 4 小時', '八週投入課程 16 小時', '結業前還缺 20 小時'], decided: 1 },
  'interactive-slot08-afternoons': { act: page => calendar(page, '週六', ['陪好友逛市場、組家具', '陪好友逛市場、組家具', '陪好友逛市場、組家具', '陪好友逛市場、組家具']),
    evidence: ['第1個週六：陪好友逛市場、組家具', '第4個週六：陪好友逛市場、組家具'], decided: 1 },
  'interactive-slot08-evening': { act: page => scene(page, '走進影廳'), evidence: ['走進影廳：'], decided: 1 },
  'interactive-slot08-unpacking': { act: async page => { await page.getByRole('button', { name: '維持這個安排', exact: true }).click(); },
    evidence: ['維持原本安排。', '原本的休閒安排 4 晚', '陪弟弟拆箱 0 晚', '週四晚上：原本的休閒安排'], decided: 1 },
  'interactive-slot09-rooftop': { act: async page => { const clock = page.getByRole('slider', { name: '十點後多待的安排', exact: true }); await clock.focus(); await page.keyboard.press('ArrowRight'); await expect(clock).toHaveAttribute('aria-valuenow', '0.5'); },
    evidence: ['十點後多待 0.5 小時', '超過公約關閉時間 30 分鐘'], decided: 0 },
  'interactive-slot09-phone-free': { act: page => scene(page, '拿出手機拍照'), evidence: ['拿出手機拍照：'], decided: 1 },
  'interactive-slot09-quiet-hours': { act: async page => { await page.getByRole('button', { name: '延長費我願意跟大家分攤。', exact: true }).click(); await page.getByRole('button', { name: '想多聊的人，下次可以另外約。', exact: true }).click(); }, send: '傳送這段訊息',
    evidence: ['傳送的訊息：我記得我們原本約好九點結束。今天聊得很盡興，我想多聊一會兒。場地方說可以現場付費延長半小時。你們覺得要不要延長？如果大家想照原本的約定，我們九點準時散。'], decided: 0 },
  'interactive-slot10-contest': { act: page => tokens(page, days, days.map(() => '打磨主要功能')), evidence: ['打磨主要功能 6 天', '做多語和報讀支援 0 天', '工作籌碼 6：打磨主要功能'], decided: 1 },
  'interactive-slot10-accessible': { act: async page => { const range = page.getByRole('slider', { name: '額外準備時間（週）', exact: true }); await range.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); },
    evidence: ['額外準備時間 3 週', '發表日往後延 3 週'], decided: 0 },
  'interactive-slot10-notes': { act: async page => { await page.getByRole('button', { name: '維持初始順序', exact: true }).click(); },
    evidence: ['維持初始順序；這次四晚先做：修改作品的開場、整理觀察筆記的目錄、調整作品的結構、補上資料的來源說明', '分享後再做：練習現場的講述、統一資料的格式'], decided: 0 },
};

for (const { id, title } of bank) test(`${title} 可操作、確認、回看、修改與重測`, async ({ page }) => {
  const flow = flows[id];
  await startRedesign(page, id);
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await flow.act(page);
  await page.getByRole('button', { name: flow.send ?? '確認答案', exact: true }).click();
  await expect(page.getByText(`明確決策 ${flow.decided} / 1 題`)).toBeVisible();
  await openRedesignRecords(page);
  for (const text of flow.evidence) await expect(page.locator('.evidence-quote')).toContainText(text);
  await page.getByRole('button', { name: '修改這題', exact: true }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: '返回已確認結果', exact: true }).click();
  await openRedesignRecords(page);
  for (const text of flow.evidence) await expect(page.locator('.evidence-quote')).toContainText(text);
  await page.getByRole('button', { name: '重新開始', exact: true }).click();
  await expect(page.getByRole('button', { name: '開始這次反思', exact: true })).toBeVisible();
});

test('刪稿全部劃掉後可以這次不傳，且不等於無法決定', async ({ page }) => {
  await startRedesign(page, 'interactive-slot09-quiet-hours');
  for (const sentence of await page.locator('.message-sentence').allTextContents()) await page.getByRole('button', { name: sentence, exact: true }).click();
  await page.getByRole('button', { name: '這次不傳', exact: true }).click();
  await expect(page.getByText('明確決策 0 / 1 題')).toBeVisible();
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toHaveText('這次不傳訊息');
});

test('鍵盤能拿起預算券並放進目的地，初始安排須明確維持', async ({ page }) => {
  await startRedesign(page, 'interactive-slot07-bonus');
  const token = page.getByRole('button', { name: '預算券 1', exact: true });
  await token.focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: `放進${rest}`, exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByText(`${rest}：1 張`, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
});

test('四晚的初始安排沒有明確維持就不能確認', async ({ page }) => {
  await startRedesign(page, 'interactive-slot08-unpacking');
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '維持這個安排', exact: true }).click();
  await expect(page.getByRole('button', { name: '確認答案', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: '週四晚上', exact: true }).click();
  await page.getByRole('button', { name: '放進陪弟弟拆箱', exact: true }).click();
  await confirm(page);
  await openRedesignRecords(page);
  await expect(page.locator('.evidence-quote')).toContainText('陪弟弟拆箱 1 晚');
  await expect(page.locator('.evidence-quote')).not.toContainText('維持原本安排');
});

test.describe('手機與觸控', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 1400 } });
  test('15 題在 320px 與 390px、淺色與深色下沒有橫向溢出，觸控目標足夠', async ({ page }) => {
    test.setTimeout(240000);
    for (const { id } of bank) {
      await startRedesign(page, id);
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 844 });
        for (const colorScheme of ['light', 'dark'] as const) {
          await page.emulateMedia({ colorScheme });
          await expectNoHorizontalScroll(page);
          await expectTouchTargets(page.locator('.scenario-page'));
        }
      }
    }
  });

  test('觸控點選能在行事曆放入活動卡並確認', async ({ page }) => {
    await startRedesign(page, 'interactive-slot06-community');
    await page.getByRole('button', { name: '去練習班準備展示', exact: true }).tap();
    await page.getByRole('button', { name: '第1個週六：尚未安排', exact: true }).tap();
    await expect(page.getByRole('button', { name: '第1個週六：去練習班準備展示', exact: true })).toBeVisible();
  });
});
