import type { InteractiveScenario } from '../interactiveTypes';

/** Accepted room-movement trial; its full-bank counterparts still need content review. */
export const redesignScene: InteractiveScenario = {
  id: 'redesign-slot08-evening', slotId: 'slot08', pair: ['hedonism', 'care'], domain: '朋友', title: '今晚，你想走向哪裡？',
  setup: '你原本留了今晚看一部期待很久的電影。熟朋友傳訊息來，想聊聊最近的工作轉換；他沒有遇到緊急狀況，也能找別人聊。今晚只夠完整做一件事：回沙發看電影，或到餐桌坐下來陪他通話。電影和這段完整談話，都可以改約另一天。',
  interaction: { kind: 'scene', object: '自己', transitionLabel: '走廊', locations: [
    { id: 'sofa', label: '沙發區', action: '走進沙發區', consequence: '今晚好好看電影，和朋友另約時間。', valueId: 'hedonism' },
    { id: 'table', label: '餐桌區', action: '走進餐桌區', consequence: '今晚留給朋友，電影改到另一天。', valueId: 'care' },
  ] },
};
