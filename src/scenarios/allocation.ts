import type { AllocationScenario } from '../types';

export const allocationScenarios: AllocationScenario[] = [{
  id: 'slot03-evenings', slotId: 'slot03', pair: ['autonomy', 'care'], kind: 'allocate', domain: '生活',
  title: '六個晚上，留給哪些事？',
  setup: '假設接下來三週，你有六個可以自由安排的晚上，每晚兩小時。你想做一本自己規劃的攝影小誌，也有一位正在轉職的好友想請你陪練面試。朋友另有其他人幫忙，沒有急事。每多一晚做小誌，就少一晚陪練，反過來也一樣。請把六晚排完，也可以全部安排同一件事。',
  total: 6, unit: '晚',
  options: [
    { id: 'zine', label: '自己的攝影小誌', consequence: '照自己的想法做小誌，陪朋友練習的時間就少一些。', valueId: 'autonomy' },
    { id: 'interview', label: '陪朋友練面試', consequence: '多陪朋友準備面試，自己的小誌就做得慢一些。', valueId: 'care' },
  ],
}, {
  id: 'slot03-afternoons', slotId: 'slot03', pair: ['autonomy', 'care'], kind: 'allocate', domain: '生活',
  title: '四個下午，留給誰？',
  setup: '假設接下來一個月，你有四個空閒的週末下午。你想選一條路線，做自己的散步紀錄；一位熟識的長輩也想請你陪著學整理手機相片。長輩平常有人協助，沒有急事，只是很珍惜和你一起學習的時間。兩件事都能延後，但一個下午只能做一件。請把四個下午排完，也可以全部安排同一件事。',
  total: 4, unit: '個下午',
  options: [
    { id: 'walk', label: '自選路線的散步紀錄', consequence: '照自己的想法走走、記錄，陪長輩的時間就少一些。', valueId: 'autonomy' },
    { id: 'photos', label: '陪長輩整理手機相片', consequence: '陪長輩學整理相片，散步紀錄就晚一點做。', valueId: 'care' },
  ],
}, {
  id: 'slot06-learning', slotId: 'slot06', pair: ['stimulation', 'achievement'], kind: 'allocate', domain: '學習',
  title: '六次進修，往哪裡走？',
  setup: '假設接下來一個月，你有六次進修的空檔，每次兩小時。你可以去上沒試過的木工、即興或聲音採集短課，也可以練習熟悉的工作技能，完成一份自己在意、能公開展示的作品。兩邊都得認真投入，也不能同時進行。多上一堂新課，就少一次練作品的時間。請把六次空檔排完。',
  total: 6, unit: '次',
  options: [
    { id: 'new-courses', label: '嘗試陌生領域短課', consequence: '多試幾種沒碰過的活動，練作品的時間就少一些。', valueId: 'stimulation' },
    { id: 'portfolio', label: '完成熟悉技能的作品', consequence: '把作品做得更完整，上新課的機會就少一些。', valueId: 'achievement' },
  ],
}, {
  id: 'slot06-community', slotId: 'slot06', pair: ['stimulation', 'achievement'], kind: 'allocate', domain: '社群',
  title: '活動名額，留給嘗試還是成果？',
  setup: '假設一個開放社群讓你報名六個活動時段，每個時段的費用和時間都一樣。你可以每次嘗試沒接觸過的活動，也可以持續練一項已有基礎的技能，準備月底自己期待的成果展示。這不是工作要求，兩種活動都有人帶領，也都需要投入。每個時段只能選一種，請把六個時段排完。',
  total: 6, unit: '個時段',
  options: [
    { id: 'try', label: '輪流嘗試新活動', consequence: '每次試不同的活動，準備成果展示的時間就少一些。', valueId: 'stimulation' },
    { id: 'showcase', label: '練習月底成果展示', consequence: '專心準備月底的展示，能試的新活動就少一些。', valueId: 'achievement' },
  ],
}, {
  id: 'slot14-preparation', slotId: 'slot14', pair: ['security', 'fairness'], kind: 'allocate', domain: '社區',
  title: '六小時的準備，先顧哪些事？',
  setup: '假設你有六個一小時的空檔。你可以整理自己的備援資料、緊急聯絡清單和防災物品，為生活中的意外做準備；也可以幫社區整理多語與無障礙防災資訊，讓不熟悉中文或行動不便的人更容易取得資訊。目前沒有災情，兩件事都能延後，社區的工作也不是你的義務。每小時只能做一件，請把六小時排完。',
  total: 6, unit: '小時',
  options: [
    { id: 'backup', label: '整理自己的備援與用品', consequence: '自己的生活多一分準備，幫社區整理資訊的時間就少一些。', valueId: 'security' },
    { id: 'accessible-info', label: '整理多語與無障礙資訊', consequence: '讓更多人拿得到防災資訊，自己的準備就晚一點做。', valueId: 'fairness' },
  ],
}, {
  id: 'slot14-workflow', slotId: 'slot14', pair: ['security', 'fairness'], kind: 'allocate', domain: '工作',
  title: '六個改善時段，怎麼安排？',
  setup: '假設你有六個一小時的空檔，可以改善工作上的安排。你可以整理自己負責工作的備援和交接流程，減少臨時中斷的影響；也可以把公開活動資訊改成易讀版本，方便有不同閱讀需求的人參加。主管同意兩件事都能做，都不是規定要做的工作，也沒有緊急期限。每個時段只能做一件，請把六個時段排完。',
  total: 6, unit: '個時段',
  options: [
    { id: 'handover', label: '建立備援與交接流程', consequence: '工作臨時中斷時比較不慌，整理易讀資訊的時間就少一些。', valueId: 'security' },
    { id: 'easy-read', label: '整理公開活動易讀資訊', consequence: '讓有不同閱讀需求的人都能看懂，自己的交接流程就晚一點整理。', valueId: 'fairness' },
  ],
}];
