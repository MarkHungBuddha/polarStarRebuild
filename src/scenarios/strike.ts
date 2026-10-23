import type { StrikeScenario } from '../types';

export const strikeScenarios: StrikeScenario[] = [{
  id: 'slot02-proposal', slotId: 'slot02', pair: ['autonomy', 'rules'], kind: 'strike', domain: '工作',
  title: '這份提案，用誰的方法？',
  setup: '假設你在準備一份內部提案。團隊約好用同一份格式，方便大家對照；你想用自己設計的方式，把觀點說清楚。兩種方式都能完整交代內容，主管也允許例外。不過，用自己的格式，就沒有照這次的共同約定，大家也得多花時間熟悉。你會怎麼回覆？',
  options: [
    { id: 'own-method', label: '這次我想用自己設計的方式說明觀點。我知道這沒照共同約定，大家也得多花點時間熟悉。', consequence: '照自己的方式呈現，也讓大家多花時間對照。', valueId: 'autonomy' },
    { id: 'shared-format', label: '這次我先用大家約好的格式，方便直接對照；我自己的寫法留到下次提案再試。', consequence: '照共同約定走，也放下這次用自己方式呈現的機會。', valueId: 'rules' },
  ],
}, {
  id: 'slot02-cleaning', slotId: 'slot02', pair: ['autonomy', 'rules'], kind: 'strike', domain: '居住',
  title: '週末的打掃，照誰的時間？',
  setup: '假設你和室友約好，每週六上午一起打掃公共區域，方便彼此確認進度。你想改在平日晚上，照自己的作息打掃負責的區域。兩種做法都能打掃乾淨，室友也不急著用空間；但改時間，就沒有照原本的約定，大家可能得另外確認進度。你會在群組裡怎麼回覆？',
  options: [
    { id: 'own-schedule', label: '這週我想照自己的作息，挑平日晚上把負責的區域打掃好。我知道這沒照週六上午的約定，大家可能也得多確認一次。', consequence: '自己安排打掃時間，也沒照室友間的約定。', valueId: 'autonomy' },
    { id: 'shared-time', label: '這週我照約好的時間，週六上午一起打掃；想照自己作息的事先放著。', consequence: '照室友間的約定走，也放下這次自己排時間的機會。', valueId: 'rules' },
  ],
}, {
  id: 'slot09-quiet-hours', slotId: 'slot09', pair: ['hedonism', 'rules'], kind: 'strike', domain: '聚會',
  title: '聚會的散場時間',
  setup: '假設你參加一場在共用空間辦的小聚會，大家借場地時約好九點散場。現在聊得正開心，場地方說可以付費再留半小時，音量也沒問題。不過，你們原本的約定還是九點結束。你會在群組裡怎麼回覆？',
  options: [
    { id: 'stay-longer', label: '我想多留半小時，把話聊完。延長費我願意分攤，明天少睡一點也沒關係。', consequence: '多聊半小時，也沒照原本九點散場的約定。', valueId: 'hedonism' },
    { id: 'leave-on-time', label: '我們就照原本約好的九點散場吧；雖然正聊得開心，剩下的話下次再說。', consequence: '照大家原本的約定走，也少了今晚多聊一會兒的開心。', valueId: 'rules' },
  ],
}, {
  id: 'slot09-phone-free', slotId: 'slot09', pair: ['hedonism', 'rules'], kind: 'strike', domain: '生活',
  title: '無手機的晚餐',
  setup: '假設你和同事聚餐，事先約好吃飯時不拿手機，今晚也沒有工作或家裡的急事。桌上來了一份難得吃到的甜點，朋友們也都同意合照。你想拍幾張照片，但拿出手機就沒有遵守原來的約定。你會怎麼回覆？',
  options: [
    { id: 'take-photos', label: '我想拍幾張照片留下今晚，拍完就收起來。我知道這沒照吃飯不拿手機的約定。', consequence: '留下今晚的照片，也沒照不拿手機的約定。', valueId: 'hedonism' },
    { id: 'keep-phone-away', label: '我照約定把手機收著，專心吃完；這次就不拍甜點和合照了。', consequence: '照大家的約定吃飯，也少了留下照片的樂趣。', valueId: 'rules' },
  ],
}, {
  id: 'slot12-project', slotId: 'slot12', pair: ['influence', 'care'], kind: 'strike', domain: '社群',
  title: '你熟悉的夥伴想主導',
  setup: '假設你和一位熟識的夥伴自願一起做小專案，原本由你決定最後方向。這次夥伴想練習主導，分工上的約定也允許這樣調整。不管由誰定案，你們都會繼續投入。你會怎麼回覆夥伴？',
  options: [
    { id: 'keep-final-say', label: '這次最後方向還是由我來定，照我的判斷做；我知道這樣你就少一次練習主導的機會。', consequence: '自己保有最後決定權，也讓夥伴少一次練習主導的機會。', valueId: 'influence' },
    { id: 'hand-over', label: '這次由你決定最後方向，我在旁邊幫忙；就算結果不是我最想要的，我也願意讓你來。', consequence: '支持夥伴練習主導，也放下這次自己定案的機會。', valueId: 'care' },
  ],
}, {
  id: 'slot12-outing', slotId: 'slot12', pair: ['influence', 'care'], kind: 'strike', domain: '朋友',
  title: '熟朋友的活動籌備',
  setup: '假設朋友聚會的預算和行程，一直都由你決定。這次一位親近的朋友想試著安排，大家也沒有特殊的安全或無障礙需求。你希望保留最後決定權，朋友則希望你支持他試一次。你會怎麼回覆？',
  options: [
    { id: 'keep-control', label: '這次預算和行程還是由我來決定；你可以提建議，最後由我定案。', consequence: '保有預算和行程的決定權，也讓朋友少一次試著安排的機會。', valueId: 'influence' },
    { id: 'let-friend-plan', label: '這次預算內的行程就交給你安排，我來配合；細節我會試著不插手。', consequence: '支持親近朋友嘗試安排，也放下這次對細節的掌握。', valueId: 'care' },
  ],
}];
