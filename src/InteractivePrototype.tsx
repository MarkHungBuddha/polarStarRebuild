// Throwaway single-question prototype requested for local review. No answers are persisted.
import { useState } from 'react';
import { ThemeControl } from './ThemeControl';
import { StarIcon } from './StarIcon';
import './interactive-prototype.css';

type Plan = 'zine' | 'friend';
type Answer = { slots: (Plan | null)[]; undecided: boolean };
const evenings = ['第一週・週二', '第一週・週四', '第二週・週二', '第二週・週四', '第三週・週二', '第三週・週四'];
const activities = { zine: { title: '做自己的攝影小誌', short: '攝影小誌', symbol: '▧' }, friend: { title: '陪朋友練習面試', short: '陪朋友練面試', symbol: '☏' } };
const empty = (): (Plan | null)[] => Array.from({ length: 6 }, () => null);

export default function InteractivePrototype() {
  const [screen, setScreen] = useState<'question' | 'result'>('question');
  const [slots, setSlots] = useState<(Plan | null)[]>(empty);
  const [selected, setSelected] = useState<Plan>('zine');
  const [undecided, setUndecided] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [note, setNote] = useState('');
  const [baseline, setBaseline] = useState<'autonomy' | 'care'>('autonomy');
  const [dragged, setDragged] = useState<number | null>(null);
  const zine = slots.filter(slot => slot === 'zine').length;
  const friend = slots.filter(slot => slot === 'friend').length;
  const remaining = 6 - zine - friend;
  const confirmedZine = answer?.slots.filter(slot => slot === 'zine').length ?? 0;
  const confirmedFriend = answer?.slots.filter(slot => slot === 'friend').length ?? 0;
  const winner = !answer || answer.undecided || confirmedZine === confirmedFriend ? null : confirmedZine > confirmedFriend ? 'autonomy' : 'care';
  const winnerLabel = winner === 'autonomy' ? '自主' : '照顧身邊的人';
  const baselineLabel = baseline === 'autonomy' ? '自主' : '照顧身邊的人';
  const place = (index: number, plan: Plan) => { setSlots(current => current.map((slot, i) => i === index ? plan : slot)); setUndecided(false); };
  const navigate = (next: 'question' | 'result') => { setScreen(next); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const confirm = () => { if (remaining === 0 || undecided) { setAnswer({ slots: [...slots], undecided }); navigate('result'); } };
  const edit = () => { if (answer) { setSlots([...answer.slots]); setUndecided(answer.undecided); } navigate('question'); };

  return <main className="app-shell ip-shell">
    <header className="masthead"><a href="./"><StarIcon />北極星</a><span className="notebook-stamp">單題試玩</span></header>
    <ThemeControl />
    <aside className="ip-demo"><strong>互動提案 · 本機試玩版</strong><span>只有一題，重新整理會清空試玩答案。</span></aside>
    {screen === 'question' ? <>
      <div className="ip-heading"><span className="eyebrow">第二幕 · 情境中的取捨</span><span>01 / 01</span></div>
      <section className="ip-story">
        <span className="ip-kicker">三週，六個晚上。</span>
        <h1>這些時間，<br />你想留給誰？</h1>
        <p>假設接下來三週，你有六個空閒的晚上，每晚兩小時。你想照自己的想法做一本攝影小誌；一位朋友也想請你陪他練習面試。</p>
        <p>朋友另有人協助，沒有急事。每個晚上只能安排一件事：留給小誌的時間多一些，陪朋友的時間就少一些。兩件事都可以留到之後繼續。</p>
      </section>
      <section className="ip-workspace" aria-labelledby="schedule-title">
        <div className="ip-section-title"><h2 id="schedule-title">攤開你的行事曆</h2><span>不計時，慢慢安排</span></div>
        <p className="ip-help">先選一張活動卡，再點選晚上的空格。也可以把卡片拖進去；已排好的晚上隨時能換。</p>
        <div className="ip-palette" role="group" aria-label="選擇要安排的活動">{(['zine', 'friend'] as const).map(plan => <button key={plan} className={`ip-activity ip-${plan}`} aria-pressed={selected === plan} draggable onDragStart={event => { event.dataTransfer.setData('text/plain', plan); setSelected(plan); setDragged(null); }} onClick={() => setSelected(plan)}><span aria-hidden="true" className="ip-icon">{activities[plan].symbol}</span><span>{activities[plan].title}<small>{plan === 'zine' ? '留下自己創作的時間' : '一起練習、給彼此回饋'}</small></span><span aria-hidden="true">{selected === plan ? '✓' : '＋'}</span></button>)}</div>
        <div className="ip-calendar">{evenings.map((evening, index) => <div key={evening} className={`ip-slot ${slots[index] ? `ip-${slots[index]}` : ''}`} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const plan = event.dataTransfer.getData('text/plain'); if (plan === 'zine' || plan === 'friend') { if (dragged !== null && dragged !== index) { setSlots(current => current.map((slot, i) => i === dragged ? current[index] : i === index ? plan : slot)); setUndecided(false); } else place(index, plan); } setDragged(null); }}>
          <span className="ip-day">{evening}</span>
          <button className="ip-slot-action" aria-label={`${evening}：${slots[index] ? activities[slots[index]].short : '尚未安排'}，放入${activities[selected].short}`} draggable={slots[index] !== null} onDragStart={event => { if (slots[index]) { event.dataTransfer.setData('text/plain', slots[index]); setDragged(index); } }} onDragEnd={() => setDragged(null)} onClick={() => place(index, selected)}><span className="ip-slot-symbol" aria-hidden="true">{slots[index] ? activities[slots[index]].symbol : '＋'}</span><strong>{slots[index] ? activities[slots[index]].short : '放入一個安排'}</strong><small>19:00 — 21:00</small></button>
          {slots[index] && <button className="ip-remove" aria-label={`清空${evening}`} onClick={() => { setSlots(current => current.map((slot, i) => i === index ? null : slot)); setUndecided(false); }}>移除</button>}
        </div>)}</div>
        <div className="ip-live" role="status" aria-live="polite"><strong>你目前留了這些時間</strong><div className="ip-totals"><span>攝影小誌 <b>{zine}</b> 晚 · {zine * 2} 小時</span><span>陪朋友 <b>{friend}</b> 晚 · {friend * 2} 小時</span></div><div className="ip-meter" aria-hidden="true"><span style={{ flex: zine }} /><span style={{ flex: friend }} /><span style={{ flex: remaining }} /></div><p>{remaining ? `還有 ${remaining} 晚沒有安排。` : zine === friend ? '兩件事各留了三晚；還沒做完的部分，留到這三週之後。' : zine > friend ? '你把較多晚上留給自己的小誌，陪朋友練習的時間就少一些。' : '你把較多晚上留給朋友，自己的小誌就得慢一點進行。'}</p></div>
      </section>
      <label className="ip-undecided"><input type="checkbox" checked={undecided} onChange={event => setUndecided(event.target.checked)} />目前無法決定，這題先不判方向</label>
      {undecided && <p role="status">這次會記錄「目前無法決定」，不把行事曆上的草稿當成答案。</p>}
      <div className="ip-actions"><button className="secondary" onClick={() => { setSlots(empty()); setUndecided(false); }}>重新安排</button><button className="primary" disabled={remaining > 0 && !undecided} onClick={confirm}>確認答案，看這次結果 →</button></div>
      <p className="ip-help">{remaining && !undecided ? '把六個晚上安排好後，就能確認答案。' : '確認前都可以修改，這裡沒有標準答案。'}</p>
    </> : <>
      <div className="ip-heading"><span className="eyebrow">回看這次選擇</span><span>單題結果</span></div>
      <h1>你在意的，<br />遇上生活裡的取捨。</h1>
      <p className="ip-lead">先看你怎麼安排，再回頭看你原先重視的事。</p>
      <aside className="ip-demo">第一幕使用示範資料，並非你的實際排序。只有一題，不能產生完整的十項價值排名。</aside>
      <div className="ip-result-grid">
        <section className="ip-result-card"><span className="ip-kicker">第一幕 · 示範排序</span><h2>你認為重要的</h2><ol className="ip-ranking"><li>{baselineLabel}</li><li>{baseline === 'autonomy' ? '照顧身邊的人' : '自主'}</li><li>安全穩定</li></ol><label className="ip-baseline">試看另一種對照<select value={baseline} onChange={event => setBaseline(event.target.value as 'autonomy' | 'care')}><option value="autonomy">示範：自主排在照顧之前</option><option value="care">示範：照顧排在自主之前</option></select></label></section>
        <section className="ip-result-card"><span className="ip-kicker">第二幕 · 你的這題決策</span><h2>這次優先保留的</h2>{winner ? <><p className="ip-winner">{winnerLabel}</p><p>優先保留 <strong>1 次</strong> / 本題出現 1 次</p><p className="ip-help">{winner === 'autonomy' ? '照顧身邊的人' : '自主'}：本題未優先保留（0 次）</p></> : <><p className="ip-winner">{answer?.undecided ? '目前無法決定' : '兩邊各留三晚'}</p><p>這題不判方向，也不產生排名。</p></>}<p className="ip-help">已確認 1 題 · 明確方向 {winner ? 1 : 0} 題<br />另外八個價值尚未出題，不能當成 0 次。</p></section>
      </div>
      <section className="ip-evidence"><span className="ip-kicker">把兩幕放在一起看</span><h2>{winner ? winner === baseline ? '這次安排，與原先排序一致。' : '這個情境裡，你先顧了另一件事。' : '先保留這個答案，不急著比較。'}</h2><p>{answer?.undecided ? '你確認目前無法決定；行事曆草稿沒有列入這次結果。' : `你留了 ${confirmedZine} 晚做攝影小誌，${confirmedFriend} 晚陪朋友練面試。`}</p>{winner ? <p>示範排序中，「{baselineLabel}」排得較前；這題你把較多時間留給「{winnerLabel}」。{winner !== baseline ? '這值得回想，但不代表你言行不一。' : '這描述的是這次選擇，不代表每個情境都會相同。'}</p> : <p>{answer?.undecided ? '無法決定不等於兩邊都不重要。' : '平均分配不等於兩個價值在所有情境都一樣重要。'}</p>}
        <details><summary>查看這題的完整安排</summary>{answer?.undecided ? <p>已確認：目前無法決定。</p> : <ul className="ip-answer-list">{evenings.map((evening, i) => <li key={evening}><span>{evening}</span><strong>{answer?.slots[i] ? activities[answer.slots[i]].short : '未安排'}</strong></li>)}</ul>}</details>
        <button className="text-button" onClick={edit}>回到這題，試試另一種安排 →</button>
      </section>
      <section className="ip-reflection"><span className="ip-kicker">留一句給自己 · 可以略過</span><h2>你想帶走什麼？</h2><p>是什麼條件讓你這樣安排？原先的排序還適合你嗎？下次遇到類似情況，想維持還是調整？</p><label htmlFor="ip-note">我的反思</label><textarea id="ip-note" value={note} onChange={event => setNote(event.target.value)} placeholder="例如：朋友不是沒有其他幫助，但這次我還是想多陪他一點。" rows={4} /><small>試玩筆記只留在這個頁面，重新整理就會清空。</small></section>
      <details className="ip-rules"><summary>結果怎麼整理</summary><p>本題把六個同樣長的晚上分給兩件事，分得較多的一側記一次優先保留。四比二和六比零都只記一次，差距不代表偏好強度。平均分配與目前無法決定不判方向。</p><p>正式版每個價值會出現三題，同次數並列。這份單題試玩只呈現本題證據；第一幕是示範資料，沒有讀取你的作答紀錄。</p></details>
      <div className="ip-actions"><button className="primary" onClick={edit}>再試一種安排</button><a href="./">回到目前網站</a></div>
    </>}
    <footer className="ip-footer">北極星 · 把答案留給自己，把選擇看清楚。</footer>
  </main>;
}
