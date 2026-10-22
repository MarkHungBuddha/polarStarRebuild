import type { StrikeScenario } from '../types';

export const strikeScenarios: StrikeScenario[] = [{
  id: 'slot02-proposal', slotId: 'slot02', pair: ['autonomy', 'rules'], kind: 'strike', domain: '工作',
  title: '這份提案，用誰的方法？',
  setup: '假設你正準備一份內部提案。團隊共同約定使用同一份格式，讓每個人都能快速對照；你則想用自己設計的敘事方式表達觀點。兩種都能完整交代內容，主管也允許你提出例外，但採用自己的方式，就會偏離這次的共同約定。回覆只能保留一段。',
  options: [
    { id: 'own-method', label: '這次我想用自己設計的方式說明，讓觀點依我的想法展開；我知道這會偏離共同約定，也需要大家多花時間熟悉。', consequence: '保留自行決定呈現方式的空間，也接受偏離共同格式的代價。', valueId: 'autonomy' },
    { id: 'shared-format', label: '這次我先沿用共同約定的格式，讓大家可以直接對照；我會把自己的呈現方式留到另一次提案。', consequence: '維持共同約定，也放下這次自行決定呈現方式的機會。', valueId: 'rules' },
  ],
}, {
  id: 'slot02-cleaning', slotId: 'slot02', pair: ['autonomy', 'rules'], kind: 'strike', domain: '居住',
  title: '週末的打掃，照誰的時間？',
  setup: '假設你和幾位室友同住，大家約好每週六上午一起打掃公共區域，彼此方便確認進度。你則想照自己的作息，挑平日晚上把負責的區域打掃好。兩種做法都能把環境整理乾淨，室友也沒有急著要用空間；但照自己的時間，就會偏離大家約好的方式。你要在群組裡回覆，回覆只能保留一段。',
  options: [
    { id: 'own-schedule', label: '這週我想照自己的節奏，挑平日晚上把負責的區域打掃好；我知道這會偏離大家約好的週六上午，也可能讓大家多確認一次。', consequence: '保留自行安排時間的空間，也接受偏離共同約定的代價。', valueId: 'autonomy' },
    { id: 'shared-time', label: '這週我照大家約好的時間，週六上午一起打掃；平日晚上想自己安排的節奏就先放著。', consequence: '維持室友間的共同約定，也放下這次自行安排時間的機會。', valueId: 'rules' },
  ],
}, {
  id: 'slot09-quiet-hours', slotId: 'slot09', pair: ['hedonism', 'rules'], kind: 'strike', domain: '聚會',
  title: '聚會的散場時間',
  setup: '假設你參加一場在共用空間舉辦的小型聚會，借用時大家約定九點停止活動。現在氣氛正好，場地方另外允許付費延長半小時，音量也沒有問題；但團體原先的約定仍是九點散場。你要在群組裡回覆，回覆只能保留一段。',
  options: [
    { id: 'stay-longer', label: '我想多留半小時把這段相聚享受完；我願意分攤延長費，也接受明天少些休息。', consequence: '多享受這段相聚，也接受偏離原先九點散場的約定。', valueId: 'hedonism' },
    { id: 'leave-on-time', label: '我想照我們原先約好的九點散場；雖然正聊得開心，我會把後面的話留到下次。', consequence: '維持大家原先的約定，也放下今晚多相聚的愉快。', valueId: 'rules' },
  ],
}, {
  id: 'slot09-phone-free', slotId: 'slot09', pair: ['hedonism', 'rules'], kind: 'strike', domain: '生活',
  title: '無手機的晚餐',
  setup: '假設你和幾位同事小聚，大家事先約好用餐時不拿手機，今晚也沒有工作或家裡的急事。桌上來了一份難得的甜點，朋友們也都同意合照；你很想拍幾張留下今晚，但拿出手機就會偏離餐桌上的約定。回覆只能保留一段。',
  options: [
    { id: 'take-photos', label: '我想拍幾張留下今晚的愉快，再收起手機；我知道這偏離了原先的餐桌約定。', consequence: '留下今晚的愉快片刻，也接受這次偏離不拿手機的約定。', valueId: 'hedonism' },
    { id: 'keep-phone-away', label: '我先照約定把手機收著，專心吃完；這次就不留下甜點和合照了。', consequence: '維持大家的餐桌約定，也放下這次留下照片的樂趣。', valueId: 'rules' },
  ],
}, {
  id: 'slot12-project', slotId: 'slot12', pair: ['influence', 'care'], kind: 'strike', domain: '社群',
  title: '你熟悉的夥伴想主導',
  setup: '假設你和一位熟識的夥伴一起做自願的小專案，原本由你決定最後方向。這次夥伴說想練習主導，分工上也沒有任何約定衝突；兩人都會繼續投入，只差最後由誰定案。你要回覆夥伴，回覆只能保留一段。',
  options: [
    { id: 'keep-final-say', label: '這次我想保留最後定案權，讓方向依我的判斷推進；我知道這會少給你一次主導的練習。', consequence: '保有對專案方向的最後決定，也讓夥伴少一次練習主導的機會。', valueId: 'influence' },
    { id: 'hand-over', label: '這次由你定最後方向，我提供需要的支援；即使最後方案不是我最想要的，我也願意讓出這個位置。', consequence: '支持親近夥伴的成長，也放下這次由自己定案的掌握。', valueId: 'care' },
  ],
}, {
  id: 'slot12-outing', slotId: 'slot12', pair: ['influence', 'care'], kind: 'strike', domain: '朋友',
  title: '熟朋友的活動籌備',
  setup: '假設你們的朋友聚會每次都由你掌控預算與行程。這次一位親近的朋友說想試著安排，大家也沒有特殊的安全或無障礙需求。你重視自己對決定的掌握，朋友則很期待被支持去嘗試。你要回覆朋友，回覆只能保留一段。',
  options: [
    { id: 'keep-control', label: '這次預算與行程的最後決定我仍想自己掌握；你可以提建議，但我會負責定案。', consequence: '保有對預算與行程的決定權，也讓朋友少一次被支持嘗試的機會。', valueId: 'influence' },
    { id: 'let-friend-plan', label: '這次我願意讓你決定預算內的行程，配合你的安排；我會放下自己想掌握細節的習慣。', consequence: '支持親近朋友嘗試安排，也放下這次對細節的掌握。', valueId: 'care' },
  ],
}];
