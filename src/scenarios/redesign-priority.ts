import type { InteractiveScenario } from '../interactiveTypes';

/** Accepted trial scenario; full-bank content still requires the owner's review. */
export const redesignPriority: InteractiveScenario = {
  id: 'redesign-slot06-priority', slotId: 'slot06', pair: ['stimulation', 'achievement'], domain: '進修', title: '只有三次空檔，哪些先留下？',
  setup: '這個月你有三個各兩小時的進修空檔。有些活動能讓你接觸沒試過的領域；另一些能讓你把已熟悉的攝影技能整理成一份可公開展示的作品。六件事都想做，但這個月只能排進三件，其餘延到下個月。',
  interaction: { kind: 'priority', capacity: 3, keepLabel: '本月保留', deferLabel: '延到下月', resourceUnit: '個兩小時空檔', items: [
    { id: 'wood', label: '試一堂木工課', detail: '接觸沒做過的材料與工具', valueId: 'stimulation' },
    { id: 'improv', label: '參加即興工作坊', detail: '試試陌生的表達方式', valueId: 'stimulation' },
    { id: 'sound', label: '到街上採集聲音', detail: '用不同媒介認識熟悉的地方', valueId: 'stimulation' },
    { id: 'photo', label: '重拍攝影作品', detail: '把已選好的作品拍到滿意', valueId: 'achievement' },
    { id: 'portfolio', label: '整理作品集順序', detail: '讓公開展示的成果更完整', valueId: 'achievement' },
    { id: 'caption', label: '完成攝影作品說明', detail: '把這次的作品正式發表', valueId: 'achievement' },
  ] },
};
