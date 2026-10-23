import type { PropKind } from './GameScene';

export const choiceStages: Record<string, { prop: PropKind; destinations: readonly [string, string]; instruction: string }> = {
  'slot02-proposal': { prop: 'paper', destinations: ['我的提案桌', '共同格式桌'], instruction: '把提案放到你要採用的工作桌上。' },
  'slot02-cleaning': { prop: 'clock', destinations: ['平日晚上', '週六上午'], instruction: '把打掃時鐘放到你想採用的時間。' },
  'slot04-work': { prop: 'person', destinations: ['新團隊', '原團隊'], instruction: '拖著自己走進下週要工作的房間。' },
  'slot04-weekend': { prop: 'person', destinations: ['陌生小鎮', '熟悉街區'], instruction: '把自己帶到這次假日想去的地方。' },
  'slot05-festival': { prop: 'ticket', destinations: ['聲音體驗入口', '傳統工藝入口'], instruction: '把手上的入場券交給其中一個入口。' },
  'slot05-holiday': { prop: 'ticket', destinations: ['戶外體驗入口', '老技藝入口'], instruction: '把連假入場券交給你想參加的活動。' },
  'slot08-evening': { prop: 'person', destinations: ['電影院', '朋友的客廳'], instruction: '今晚往哪裡去？拖著自己走進去。' },
  'slot08-day-off': { prop: 'person', destinations: ['展覽入口', '朋友的家'], instruction: '把自己移到這半天想待的地方。' },
  'slot09-quiet-hours': { prop: 'person', destinations: ['留下再聊', '九點離場'], instruction: '把自己留在聚會裡，或走到出口。' },
  'slot09-phone-free': { prop: 'phone', destinations: ['拿出來拍照', '收進置物櫃'], instruction: '把手機拿到餐桌上，或放回置物櫃。' },
  'slot11-fund': { prop: 'key', destinations: ['我的規劃桌', '居民共議桌'], instruction: '把預算的決定權鑰匙放到定案的那張桌上。' },
  'slot11-event': { prop: 'paper', destinations: ['我的規劃桌', '代表共議桌'], instruction: '把議程交到你希望負責安排的桌上。' },
  'slot12-project': { prop: 'key', destinations: ['我的工作桌', '夥伴的工作桌'], instruction: '這把鑰匙代表最後定案權。留在自己桌上，或交給夥伴。' },
  'slot12-outing': { prop: 'paper', destinations: ['我的規劃桌', '朋友的規劃桌'], instruction: '把行程本交到這次負責定案的人手邊。' },
  'slot13-club': { prop: 'paper', destinations: ['我的新流程', '傳下來的儀式'], instruction: '把今年的活動本放到要採用的流程桌上。' },
  'slot13-exhibition': { prop: 'paper', destinations: ['我的策展桌', '師傅的策展桌'], instruction: '把展覽安排交到這次採用的策展桌上。' },
  'slot15-meeting': { prop: 'mic', destinations: ['輪值主持人', '資深主持人'], instruction: '把麥克風交給這次要主持的人。' },
  'slot15-reuse': { prop: 'paper', destinations: ['公用餐具桌', '家傳器皿桌'], instruction: '把今年的用餐名牌放到要使用的餐桌上。' },
};
