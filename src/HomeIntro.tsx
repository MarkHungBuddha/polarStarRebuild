import { useId, useState, type ReactNode } from 'react';

/** Home page: a short introduction on one paper card, the start or resume actions, and the expandable "about these questions" limits. */
export function HomeIntro({ actions }: { actions: ReactNode }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutId = useId();
  return <section className="hero">
    <div className="paper-card">
      <p className="eyebrow">一份關於選擇的自我反思</p>
      <h1>你重視什麼，<br />會怎麼選？</h1>
      <p className="lead">先排出你在意的事，再試著安排時間、做幾個日常決定。當兩件事不能兼顧，你會<span className="marker">先顧哪一件</span>？</p>
      <ol className="intro-steps">
        <li><div><b>第一幕 · 你重視的</b><p>把十個價值分類，再排出先後。</p></div></li>
        <li><div><b>第二幕 · 情境中的取捨</b><p>試著做出選擇，再和剛才的排序對照。</p></div></li>
      </ol>
      <p className="intro-meta">
        <span><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>約十五分鐘</span>
        <span><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>答案只保存在這個瀏覽器</span>
      </p>
    </div>
    <div className="intro-bottom">
      {actions}
      <p className="disclaimer">這是參考 Schwartz 價值理論設計的自編反思工具，不是診斷。</p>
      <button type="button" className="about-toggle" aria-expanded={aboutOpen} aria-controls={aboutId} onClick={() => setAboutOpen(open => !open)}><span>關於這份題目</span></button>
      <div id={aboutId} className="about-panel" hidden={!aboutOpen}>
        <p>這是參考 Schwartz 價值理論設計的自編反思工具，題目與解讀尚未驗證。兩幕都是在假設情境下的自我回報，不是診斷，也不代表真實行為。</p>
        <p>第二幕有十五個情境，每題都有兩件你可能在意、卻無法完全兼顧的事。</p>
        <p>約十五分鐘完成；這是設計時的估計，尚未實測。</p>
        <p>答案、排序與自訂價值只保存在這個瀏覽器。分享題目連結時，不會帶上你的答案。</p>
      </div>
    </div>
  </section>;
}
