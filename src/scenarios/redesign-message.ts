import type { InteractiveScenario } from '../interactiveTypes';

/** Accepted exhibition-message trial; its retained wording can express both concerns, so no direction is inferred. */
export const redesignMessage: InteractiveScenario = {
  id: 'redesign-slot02-exhibition', slotId: 'slot02', pair: ['autonomy', 'rules'], domain: '一起做展覽', title: '這段訊息，你會留下哪些話？',
  setup: '你和社群夥伴一起辦攝影小展，先前約好大家都用同一種版型。你想讓自己的作品有不同的排列方式，夥伴傳訊息問你明天能不能交稿。你打好一段回覆，還沒傳出去。',
  interaction: { kind: 'message', sentences: [
    { id: 'delivery', text: '明天我會先交一版。' },
    { id: 'story', text: '我想試試看把照片排成一段故事。' },
    { id: 'difference', text: '這樣不會跟大家的版型完全一樣。' },
    { id: 'agreement', text: '我記得我們先前約好要用同一種版型。' },
    { id: 'adjust', text: '如果要維持一致，我可以再調整。' },
    { id: 'discuss', text: '也想請你看看這種排法，再一起討論。' },
    { id: 'work', text: '多出來的排版工作，我可以自己處理。' },
  ] },
};
