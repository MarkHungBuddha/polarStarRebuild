import type { Page } from '@playwright/test';
import { test, expect } from './support/fixtures';
import { startRedesign, openRedesignRecords } from './support/redesign';
import { expectFocusRing, expectNoClippedText, expectNoHorizontalScroll, expectTouchTargets } from './support/experience';
import { dragWithTouch } from './support/object-drag';
import { expectSlotContent } from './support/interactive-content';
import { redesignSlots01To05 } from '../src/scenarios/redesign-slots-01-05';
import { redesignScenarios } from '../src/redesignRegistry';
import { blueprint } from './support/blueprint';

const slotIds = ['slot01', 'slot02', 'slot03', 'slot04', 'slot05'];
const confirm = (page: Page) => page.getByRole('button', { name: '確認答案', exact: true });

test('題庫契約：第 1–5 組各三題，配對與識別固定，次序在審閱清單中不變', () => {
  expectSlotContent(slotIds, redesignSlots01To05);
  expect(redesignSlots01To05.map(scenario => scenario.id)).toEqual([
    'interactive-slot01-trip', 'interactive-slot01-work', 'interactive-slot01-home',
    'interactive-slot02-proposal', 'interactive-slot02-reading', 'interactive-slot02-cleaning',
    'interactive-slot03-afternoons', 'interactive-slot03-moving', 'interactive-slot03-evenings',
    'interactive-slot04-work', 'interactive-slot04-weekends', 'interactive-slot04-workshops',
    'interactive-slot05-holiday', 'interactive-slot05-winter', 'interactive-slot05-festival',
  ]);
  const listed = redesignScenarios.map(scenario => scenario.id);
  expect(new Set(listed).size).toBe(listed.length);
  expect(redesignSlots01To05.every(scenario => listed.includes(scenario.id))).toBe(true);
  expect(new Set(redesignScenarios.map(scenario => scenario.title)).size).toBe(redesignScenarios.length);
  // Mechanisms come from the decision, not a fixed rotation: each mechanism's data carries what its control shows.
  const kinds = new Set(redesignSlots01To05.map(scenario => scenario.interaction.kind));
  expect([...kinds].sort()).toEqual(['calendar', 'message', 'priority', 'resources', 'scene']);
  for (const { interaction, pair, slotId } of redesignSlots01To05) {
    expect([...pair]).toEqual(blueprint[slotId]);
    if (interaction.kind === 'calendar') expect(interaction.slots.length).toBeGreaterThanOrEqual(4);
    if (interaction.kind === 'resources') expect(interaction.objects.length % 2 === 0).toBe(true);
    if (interaction.kind === 'priority') expect(interaction.items.length).toBeGreaterThan(interaction.capacity);
    if (interaction.kind === 'scene') expect(interaction.locations.map(location => location.valueId)).toEqual([pair[0], pair[1]]);
  }
});

for (const scenario of redesignSlots01To05) {
  const { interaction } = scenario;
  test(`${scenario.id}：操作、確認、看回原始決策、回改不覆寫，且可重設`, async ({ page }) => {
    await startRedesign(page, scenario.id);
    await expect(page.getByRole('heading', { name: scenario.title, exact: true })).toBeVisible();
    if (interaction.kind !== 'message') await expect(confirm(page)).toBeDisabled();
    let expectedQuote: string | RegExp;
    let counted = '明確決策 1 / 1 題';
    if (interaction.kind === 'calendar') {
      for (const [index] of interaction.slots.entries()) {
        await page.getByRole('button', { name: interaction.sides[0].label, exact: true }).click();
        await page.getByRole('button', { name: `${interaction.slots[index]}：尚未安排`, exact: true }).click();
      }
      expectedQuote = interaction.slots.map(slot => `${slot}：${interaction.sides[0].label}`).join('；');
    } else if (interaction.kind === 'resources') {
      const { initial } = interaction;
      if (initial) {
        await expect(confirm(page)).toBeDisabled();
        await page.getByRole('button', { name: '維持這個安排', exact: true }).click();
        await expect(confirm(page)).toBeEnabled();
        expectedQuote = new RegExp(`^維持原本安排。${interaction.sides.map((side, index) => `${side.label} ${initial.filter(at => at === index).length} ${interaction.unit}`).join('.*')}`);
      } else {
        for (const object of interaction.objects) {
          await page.getByRole('button', { name: object, exact: true }).click();
          await page.getByRole('button', { name: `放進${interaction.sides[0].label}`, exact: true }).click();
        }
        expectedQuote = new RegExp(`${interaction.sides[0].label} ${interaction.objects.length} ${interaction.unit}`);
      }
    } else if (interaction.kind === 'scene') {
      const location = interaction.locations[1];
      await page.getByRole('button', { name: `移動${interaction.object}，目前在${interaction.transitionLabel}`, exact: true }).click();
      await page.getByRole('button', { name: location.action!, exact: true }).click();
      expectedQuote = `${location.action}：${location.consequence}`;
    } else if (interaction.kind === 'message') {
      const dropped = interaction.sentences[2];
      await page.getByRole('button', { name: dropped.text, exact: true }).click();
      await expect(page.getByRole('status', { name: '訊息預覽' })).toContainText(`會傳出 ${interaction.sentences.length - 1} 句`);
      await page.getByRole('button', { name: '傳送這段訊息', exact: true }).click();
      expectedQuote = `傳送的訊息：${interaction.sentences.filter(sentence => sentence !== dropped).map(sentence => sentence.text).join('')}`;
      counted = '明確決策 0 / 1 題';
    } else if (interaction.kind === 'priority') {
      await page.getByRole('button', { name: '維持初始順序', exact: true }).click();
      expectedQuote = `維持初始順序；${interaction.keepLabel}：${interaction.items.slice(0, interaction.capacity).map(item => item.label).join('、')}；${interaction.deferLabel}：${interaction.items.slice(interaction.capacity).map(item => item.label).join('、')}`;
    } else throw new Error('unexpected mechanism');
    if (interaction.kind !== 'message') await confirm(page).click();
    const records = await openRedesignRecords(page);
    if (typeof expectedQuote === 'string') await expect(records.locator('.evidence-quote')).toHaveText(expectedQuote);
    else await expect(records.locator('.evidence-quote')).toHaveText(expectedQuote);
    await expect(page.getByText(counted, { exact: true })).toBeVisible();
    // Editing is a draft: an unconfirmed undecided draft and a reset leave the confirmed record untouched.
    await page.getByRole('button', { name: '修改這題', exact: true }).click();
    await page.getByRole('button', { name: '目前無法決定', exact: true }).click();
    await page.getByRole('button', { name: '返回已確認結果', exact: true }).click();
    const again = await openRedesignRecords(page);
    if (typeof expectedQuote === 'string') await expect(again.locator('.evidence-quote')).toHaveText(expectedQuote);
    else await expect(again.locator('.evidence-quote')).toHaveText(expectedQuote);
    await page.getByRole('button', { name: '修改這題', exact: true }).click();
    await page.getByRole('button', { name: '重設草稿', exact: true }).click();
    if (interaction.kind !== 'message') await expect(confirm(page)).toBeDisabled();
  });
}

test('方向規則：均分、混合訊息與同次數都不計數，明確一側才計一次', async ({ page }) => {
  await startRedesign(page, 'interactive-slot03-evenings');
  const evenings = ['第一週・週二', '第一週・週四', '第二週・週二', '第二週・週四', '第三週・週二', '第三週・週四'];
  for (const [index, evening] of evenings.entries()) {
    await page.getByRole('button', { name: evening, exact: true }).click();
    await page.getByRole('button', { name: index < 3 ? '放進做攝影小誌' : '放進陪朋友練面試', exact: true }).click();
  }
  await confirm(page).click();
  await expect(page.getByText('明確決策 0 / 1 題', { exact: true })).toBeVisible();
  await openRedesignRecords(page);
  await page.getByRole('button', { name: '修改這題', exact: true }).click();
  await page.getByRole('button', { name: '第三週・週四', exact: true }).click();
  await page.getByRole('button', { name: '放進做攝影小誌', exact: true }).click();
  await confirm(page).click();
  await expect(page.getByText('明確決策 1 / 1 題', { exact: true })).toBeVisible();
  await expect((await openRedesignRecords(page)).locator('.evidence-quote')).toContainText('做攝影小誌 4 晚');
});

test('場景：鑰匙落在場景外不自動選邊，放進續約文件區才形成決策', async ({ page }) => {
  await startRedesign(page, 'interactive-slot01-home');
  const key = () => page.getByRole('button', { name: /^移動鑰匙，目前在/ });
  await key().dragTo(page.getByRole('heading', { name: scenarioTitle('interactive-slot01-home'), exact: true }));
  await expect(confirm(page)).toBeDisabled();
  await key().dragTo(page.getByRole('heading', { name: '續約文件區', exact: true }));
  await expect(page.getByRole('button', { name: '移動鑰匙，目前在續約文件區', exact: true })).toBeVisible();
  await confirm(page).click();
  await expect(page.getByText('明確決策 1 / 1 題', { exact: true })).toBeVisible();
  await expect((await openRedesignRecords(page)).locator('.evidence-quote')).toContainText('續簽三年不調租');
});

test('鍵盤可完成排序與刪稿代表題', async ({ page }) => {
  await startRedesign(page, 'interactive-slot04-workshops');
  const move = page.getByRole('button', { name: '將專案時程管理（開過多期）往前移' });
  await page.keyboard.press('Tab');
  await move.focus();
  await expectFocusRing(move);
  for (let step = 0; step < 5; step++) await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: '這期上課' })).toContainText('專案時程管理（開過多期）');
  await confirm(page).press('Enter');
  await expect(page.getByText('明確決策 1 / 1 題', { exact: true })).toBeVisible();
  await (await openRedesignRecords(page)).getByRole('button', { name: '修改這題' }).press('Enter');
  await expect(page.getByRole('region', { name: '這期上課' })).toContainText('專案時程管理（開過多期）');
});

test('刪稿：全刪須明確選擇這次不傳，不當成無法決定', async ({ page }) => {
  await startRedesign(page, 'interactive-slot02-cleaning');
  const bubble = page.getByRole('group', { name: '尚未傳送的訊息' });
  for (const sentence of await bubble.getByRole('button').all()) await sentence.click();
  await expect(page.getByRole('status', { name: '訊息預覽' })).toContainText('會傳出 0 句');
  await page.getByRole('button', { name: '這次不傳', exact: true }).click();
  await expect(page.getByText('明確決策 0 / 1 題', { exact: true })).toBeVisible();
  await expect((await openRedesignRecords(page)).locator('.evidence-quote')).toHaveText('這次不傳訊息');
});

const scenarioTitle = (id: string) => redesignSlots01To05.find(scenario => scenario.id === id)!.title;

test.describe('手機觸控與窄螢幕', () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 1600 } });
  test('真實觸控可拖卡片進行事曆、鑰匙進場景、課程進保留區', async ({ page }) => {
    await startRedesign(page, 'interactive-slot01-trip');
    await dragWithTouch(page, page.getByRole('button', { name: '自己排行程', exact: true }), page.getByRole('button', { name: '第1天：尚未安排', exact: true }));
    await expect(page.getByRole('button', { name: '第1天：自己排行程', exact: true })).toBeVisible();
    await startRedesign(page, 'interactive-slot01-home');
    await dragWithTouch(page, page.getByRole('button', { name: '移動鑰匙，目前在玄關桌', exact: true }), page.getByRole('heading', { name: '新住處的交屋區', exact: true }));
    await expect(page.getByRole('button', { name: '移動鑰匙，目前在新住處的交屋區', exact: true })).toBeVisible();
    await startRedesign(page, 'interactive-slot04-workshops');
    await dragWithTouch(page, page.getByRole('button', { name: /4\. 簡報架構/ }), page.getByRole('button', { name: /3\. 即興戲劇體驗/ }));
    await expect(page.getByRole('region', { name: '這期上課' })).toContainText('簡報架構（開過多期）');
  });

  for (const scenario of redesignSlots01To05) {
    test(`${scenario.id}：320、390、桌面與深淺色皆可閱讀`, async ({ page }) => {
      await startRedesign(page, scenario.id);
      for (const width of [320, 390, 1100]) {
        await page.setViewportSize({ width, height: 900 });
        for (const colorScheme of ['light', 'dark'] as const) {
          await page.emulateMedia({ colorScheme });
          await expectNoHorizontalScroll(page);
          await expectNoClippedText(page.locator('.scenario-page'));
          await expectTouchTargets(page.locator('.scenario-page'));
        }
      }
    });
  }
});
