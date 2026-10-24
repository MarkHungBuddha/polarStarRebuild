import { categoryLabels, categoryOrder } from './data';
import { positionCount } from './firstAct';
import { PageHeader } from './PageHeader';
import type { Category, ValueItem } from './types';

interface ClassifyProps {
  values: readonly ValueItem[];
  customWord: string;
  notice: string;
  onCustomWordChange: (word: string) => void;
  onAddCustom: () => void;
  onCategory: (id: string, category: Category) => void;
  onBack: () => void;
  onNext: () => void;
}

/** First act, step 1: each value gets one of the three importance categories; custom values can be added here. */
export function ClassifyScreen({ values, customWord, notice, onCustomWordChange, onAddCustom, onCategory, onBack, onNext }: ClassifyProps) {
  return <section className="first-act">
    <div className="paper-card first-act-card">
      <PageHeader eyebrow="第一幕 · 01" title="哪些事，對你重要？" description="照你現在的想法，把每個價值放進適合的類別。沒有標準答案。" />
      <form className="custom-row" onSubmit={event => { event.preventDefault(); onAddCustom(); }}><label htmlFor="custom-value">自訂價值</label><input id="custom-value" value={customWord} onChange={event => onCustomWordChange(event.target.value)} maxLength={24} placeholder="也可以加入自己的詞" /><button className="secondary">新增價值</button></form>
      {notice && <p role="status" className="first-act-notice">{notice}</p>}
    </div>
    <div className="value-list">{values.map(value => <article className="value-row" key={value.id}>
      <div className="value-text"><h2>{value.word}</h2><p>{value.description}</p>{value.custom && <small className="value-tag">自訂價值 · 獨立呈現</small>}</div>
      <fieldset className="value-segments"><legend>{value.word}的重要性</legend><div>{categoryOrder.map(category => <button type="button" key={category} aria-pressed={value.category === category} onClick={() => onCategory(value.id, category)}>{categoryLabels[category]}</button>)}</div></fieldset>
    </article>)}</div>
    <nav className="actions"><button className="secondary" onClick={onBack}>返回說明</button><button className="primary" disabled={values.some(value => !value.category)} onClick={onNext}>下一步：排出順序</button></nav>
  </section>;
}

interface RankProps {
  values: readonly ValueItem[];
  onRank: (id: string, rank: number) => void;
  onBack: () => void;
  onNext: () => void;
}

/** First act, step 2: positions are chosen within each category; values on the same position are tied. */
export function RankScreen({ values, onRank, onBack, onNext }: RankProps) {
  return <section className="first-act">
    <div className="paper-card first-act-card">
      <PageHeader eyebrow="第一幕 · 02" title="排個順序，也可以並列。" description="在各類別裡排出順序，數字越小越重要。一樣重要的，就選相同的位置。" />
    </div>
    {categoryOrder.map(category => {
      const members = values.filter(value => value.category === category).sort((a, b) => a.rank - b.rank);
      return <section className="rank-section" key={category}><h2><span className="marker">{categoryLabels[category]}</span></h2>{members.map(value => {
        const tied = members.some(other => other !== value && other.rank === value.rank);
        return <article className="rank-row" key={value.id}>
          <div className="rank-name"><strong>{value.word}</strong>{(value.custom || tied) && <span className="rank-tags">{value.custom && <small className="value-tag">自訂</small>}{tied && <small className="value-tag">並列</small>}</span>}</div>
          <label className="select-label">位置<select aria-label={`${value.word}的位置`} value={value.rank} onChange={event => onRank(value.id, Number(event.target.value))}>{Array.from({ length: positionCount(values, category) }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
        </article>;
      })}</section>;
    })}
    <nav className="actions"><button className="secondary" onClick={onBack}>返回分類</button><button className="primary" onClick={onNext}>進入情境中的取捨</button></nav>
  </section>;
}
