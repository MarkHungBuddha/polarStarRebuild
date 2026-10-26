import type { Scenario } from '../types';

/**
 * Slots 1–5 for the five-step preference catalog (#50); the slot-4 work demo lives in ./preference.ts.
 * Option order follows the slot pair (A = pair[0]); valueId is the only source of direction.
 * AI-drafted content, reviewed for matching trade-off conditions in docs/preference-content/slots-01-05.md;
 * not a human-authored or psychometrically validated item set.
 */
export const preferenceSlots01To05: Scenario[] = [{
  id: 'preference-slot01-work', slotId: 'slot01', pair: ['autonomy', 'security'], kind: 'preference', domain: '工作',
  title: '固定薪水，還是自己接案？',
  setup: '假設你現在領固定薪水，工作時間和做法大多由公司安排。你也可以轉為接案，自己決定接什麼工作、怎麼排時間，但每月收入會有起伏。你已存好半年的生活費，兩種工作都能發揮你的能力。不用照你目前的處境回答。',
  options: [
    { id: 'freelance', label: '轉為接案，自己安排工作', consequence: '接什麼、怎麼排都由自己決定，也接受每月收入說不準。', valueId: 'autonomy' },
    { id: 'salaried', label: '留在公司，領固定薪水', consequence: '每月收入穩定可預期，工作怎麼做也照公司的安排。', valueId: 'security' },
  ],
}, {
  id: 'preference-slot01-home', slotId: 'slot01', pair: ['autonomy', 'security'], kind: 'preference', domain: '居住',
  title: '這次租約，續住還是搬家？',
  setup: '假設你在比較兩間都租得起的房子。現在的住處可以續簽三年、房租不調，但房間怎麼布置、空間怎麼用，都得照房東的規定。新住處可以自己安排工作區和生活空間，只是租約一年一簽，續約時可能漲租。兩間的通勤和大小都差不多。',
  options: [
    { id: 'move', label: '搬到能自己安排空間的新住處', consequence: '照自己的方式布置生活，也接受續約時房租可能調漲。', valueId: 'autonomy' },
    { id: 'renew', label: '續簽三年不調租的現住處', consequence: '房租和租期都有保障，空間怎麼用仍照房東的規定。', valueId: 'security' },
  ],
}, {
  id: 'preference-slot01-trip', slotId: 'slot01', pair: ['autonomy', 'security'], kind: 'preference', domain: '旅行',
  title: '五天的旅程，誰來排？',
  setup: '假設你要去一座以前去過的城市玩五天，兩種走法的花費差不多。你可以自己訂住宿、排每天的行程，想在哪裡多待就多待，但臨時狀況得自己處理。也可以參加行程固定的團，交通、住宿和緊急聯絡都有人安排好，只是每天去哪裡、待多久都照團的時間表。',
  options: [
    { id: 'self-planned', label: '自己安排每天的行程', consequence: '每天去哪裡由自己決定，也得自己應付臨時狀況。', valueId: 'autonomy' },
    { id: 'tour', label: '參加行程固定的團', consequence: '交通住宿和突發狀況都有人照應，也照團的時間表走。', valueId: 'security' },
  ],
}, {
  id: 'preference-slot02-proposal', slotId: 'slot02', pair: ['autonomy', 'rules'], kind: 'preference', domain: '工作',
  title: '這份提案，用誰的方法？',
  setup: '假設你在準備一份內部提案。團隊約好用同一份格式，方便大家對照；你想用自己設計的方式，把觀點說清楚。兩種方式都能完整交代內容，主管也允許例外。不過，用自己的格式，就沒有照這次的共同約定，大家也得多花時間熟悉。',
  options: [
    { id: 'own-method', label: '用自己設計的方式寫提案', consequence: '照自己的方式把觀點說清楚，也沒照共同約定，大家得多花時間熟悉。', valueId: 'autonomy' },
    { id: 'shared-format', label: '照團隊約好的格式寫', consequence: '方便大家直接對照，自己的寫法留到下次再試。', valueId: 'rules' },
  ],
}, {
  id: 'preference-slot02-cleaning', slotId: 'slot02', pair: ['autonomy', 'rules'], kind: 'preference', domain: '居住',
  title: '週末的打掃，照誰的時間？',
  setup: '假設你和室友約好，每週六上午一起打掃公共區域，方便彼此確認進度。你想改在平日晚上，照自己的作息打掃負責的區域。兩種做法都能打掃乾淨，室友也不急著用空間；但改時間，就沒有照原本的約定，大家可能得另外確認進度。',
  options: [
    { id: 'own-schedule', label: '平日晚上照自己的作息打掃', consequence: '照自己的時間把負責的區域打掃好，也沒照週六上午的約定。', valueId: 'autonomy' },
    { id: 'shared-time', label: '照約定週六上午一起打掃', consequence: '照室友間的約定走，也放下這次自己排時間的機會。', valueId: 'rules' },
  ],
}, {
  id: 'preference-slot02-reading', slotId: 'slot02', pair: ['autonomy', 'rules'], kind: 'preference', domain: '學習',
  title: '這週的共學，讀哪一章？',
  setup: '假設你參加一個線上共學小組，大家約好每週讀同一章，聚會時照章節討論。你最近想先讀後面一章自己更有興趣的主題，照自己的順序也能讀完整本。小組沒有強制規定，只是照約好的進度，大家比較好一起討論。',
  options: [
    { id: 'own-order', label: '照自己的順序先讀想深入的主題', consequence: '先讀自己有興趣的部分，也沒照小組約好的進度。', valueId: 'autonomy' },
    { id: 'group-pace', label: '照小組約好的進度讀', consequence: '和大家讀同一章、一起討論，自己想先讀的主題就往後放。', valueId: 'rules' },
  ],
}, {
  id: 'preference-slot03-evenings', slotId: 'slot03', pair: ['autonomy', 'care'], kind: 'preference', domain: '生活',
  title: '這三週的晚上，留給哪件事？',
  setup: '假設接下來三週，你有六個可以自由安排的晚上。你想做一本自己規劃的攝影小誌，也有一位正在轉職的好友想請你陪練面試。朋友另有其他人幫忙，沒有急事。兩件事沒辦法都做好，這三週得選一件當主要安排，另一件只能偶爾顧到。',
  options: [
    { id: 'zine', label: '把晚上留給自己的攝影小誌', consequence: '照自己的想法把小誌做出來，陪朋友練習的時間就少很多。', valueId: 'autonomy' },
    { id: 'interview', label: '把晚上留給朋友練面試', consequence: '多陪朋友準備面試，自己的小誌就得往後延。', valueId: 'care' },
  ],
}, {
  id: 'preference-slot03-afternoons', slotId: 'slot03', pair: ['autonomy', 'care'], kind: 'preference', domain: '生活',
  title: '這個月的週末下午，留給誰？',
  setup: '假設接下來一個月，你有四個空閒的週末下午。你想選一條路線，做自己的散步紀錄；一位熟識的長輩也想請你陪著學整理手機相片。長輩平常有人協助，沒有急事，只是很珍惜和你一起學習的時間。兩件事都能延後，但這個月得選一件當主要安排。',
  options: [
    { id: 'walk', label: '走自己選的路線，做散步紀錄', consequence: '照自己的想法走走、記錄，陪長輩的時間就少很多。', valueId: 'autonomy' },
    { id: 'photos', label: '陪長輩整理手機相片', consequence: '陪長輩學整理相片，散步紀錄就晚一點做。', valueId: 'care' },
  ],
}, {
  id: 'preference-slot03-moving', slotId: 'slot03', pair: ['autonomy', 'care'], kind: 'preference', domain: '居住',
  title: '空出來的週六，給誰？',
  setup: '假設你終於空出一整個週六，打算照自己的計畫重新整理房間、改排書櫃和工作角落。一位熟朋友這週剛搬家，問你能不能去幫忙拆箱、整理廚房。朋友找了搬家公司，也有其他人會去，只是希望你也在。兩件事都能改到下週，但這個週六只能做一件。',
  options: [
    { id: 'own-room', label: '照自己的計畫整理房間', consequence: '這天照自己的步調安排，也沒去幫朋友整理新家。', valueId: 'autonomy' },
    { id: 'help-move', label: '去幫朋友整理新家', consequence: '朋友搬家這天你在身邊，自己的整理計畫就往後延。', valueId: 'care' },
  ],
}, {
  id: 'preference-slot04-weekend', slotId: 'slot04', pair: ['stimulation', 'security'], kind: 'preference', domain: '生活',
  title: '這次週末，要換條路嗎？',
  setup: '你有一天可以自由安排的假日，交通和預算都準備好了。你可以去陌生小鎮參加一日體驗，活動有基本介紹，但當天行程還沒確定；也可以走熟悉的路線、散步吃飯，照預計的時間回家。兩種安排都能休息，也沒有非去不可的人情或工作。',
  options: [
    { id: 'explore', label: '去陌生小鎮體驗一天', consequence: '去新地方試新活動，也接受當天行程說不準。', valueId: 'stimulation' },
    { id: 'familiar', label: '照熟悉的路線過一天', consequence: '假日照自己知道的步調過，也放下這次去新地方的機會。', valueId: 'security' },
  ],
}, {
  id: 'preference-slot04-course', slotId: 'slot04', pair: ['stimulation', 'security'], kind: 'preference', domain: '學習',
  title: '晚上的課，選哪一門？',
  setup: '假設公司補助一門晚間課程，兩門課的學費和上課時間都一樣。一門是你從沒接觸過的領域，課程第一次開，內容和進度會邊上邊調整；另一門屬於你熟悉的領域，已經開過很多期，課表和作業都排得清清楚楚。兩門課都不影響工作考核。',
  options: [
    { id: 'new-field', label: '選從沒接觸過的新領域', consequence: '學點完全陌生的東西，也接受課程內容和進度說不準。', valueId: 'stimulation' },
    { id: 'known-field', label: '選課表已排好的熟悉領域', consequence: '照清楚的課表一步步上，也放下這次接觸新領域的機會。', valueId: 'security' },
  ],
}, {
  id: 'preference-slot05-festival', slotId: 'slot05', pair: ['stimulation', 'tradition'], kind: 'preference', domain: '社群',
  title: '同一天，兩場活動。',
  setup: '假設你熟悉的社區每年都有傳統工藝日。你參加了很多年，跟老師傅做竹編，聽大家聊這門手藝的由來。今年同一天，還有一場只辦一次的聲音採集與即興創作體驗，都是你沒試過的活動。兩場只能去一場，都沒有工作要做，也沒有人要求你一定要去。',
  options: [
    { id: 'new-experience', label: '去只辦一次的新體驗', consequence: '試試從沒接觸過的活動，也錯過今年的工藝日。', valueId: 'stimulation' },
    { id: 'craft-day', label: '照往年參加工藝日', consequence: '照往年做竹編、聽大家聊手藝，也錯過只辦一次的新體驗。', valueId: 'tradition' },
  ],
}, {
  id: 'preference-slot05-holiday', slotId: 'slot05', pair: ['stimulation', 'tradition'], kind: 'preference', domain: '生活',
  title: '這次連假，怎麼過？',
  setup: '假設你有四天連假，可以自己安排，也沒有需要陪伴或照顧的人。你可以去沒去過的地區，參加新型態的戶外體驗；也可以回到熟悉的節慶活動，跟長輩學糊燈籠、醒獅鼓法等傳下來的技藝。兩種安排花費差不多，也差不多累。',
  options: [
    { id: 'unfamiliar-trip', label: '去沒去過的地方體驗新活動', consequence: '去新地方換換環境，也少一次跟長輩學老技藝的機會。', valueId: 'stimulation' },
    { id: 'festival-craft', label: '回熟悉的節慶學老技藝', consequence: '把節慶的老技藝接著學下去，也放下這次去新地方的機會。', valueId: 'tradition' },
  ],
}, {
  id: 'preference-slot05-winter', slotId: 'slot05', pair: ['stimulation', 'tradition'], kind: 'preference', domain: '飲食',
  title: '今年冬至，煮什麼？',
  setup: '假設今年由你負責朋友間的冬至聚會。這群朋友每年都照上一輩傳下來的做法，一起搓湯圓、煮鹹湯圓。今年你也可以改辦一場料理實驗，大家一起試從沒做過的異國食譜。兩種準備起來差不多花時間和錢，朋友們也都說照你的安排。',
  options: [
    { id: 'new-recipes', label: '改辦一場異國料理實驗', consequence: '和大家試沒做過的料理，今年就不照老做法搓湯圓。', valueId: 'stimulation' },
    { id: 'tangyuan', label: '照老做法搓湯圓、煮鹹湯圓', consequence: '把傳下來的做法再延續一年，也放下這次試新料理的機會。', valueId: 'tradition' },
  ],
}];
