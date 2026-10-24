import { categoryLabels, categoryOrder } from './data';
import { useRef, useState } from 'react';
import { dropValue, moveValue, rankedMembers } from './firstAct';
import { PageHeader } from './PageHeader';
import type { Category, ValueItem } from './types';
import './techo-first-act.css';

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
  /** Applies a ranking change to the latest values. */
  onArrange: (arrange: (values: readonly ValueItem[]) => ValueItem[]) => void;
  onBack: () => void;
  onNext: () => void;
}

/** First act, step 2: values are dragged into a strict order within each category. */
export function RankScreen({ values, onArrange, onBack, onNext }: RankProps) {
  const [announcement, setAnnouncement] = useState('');
  const arrange = (arrangeValues: (values: readonly ValueItem[]) => ValueItem[], id: string) => {
    const moved = arrangeValues(values).find(value => value.id === id)!;
    setAnnouncement(`「${moved.word}」在第 ${moved.rank} 位`);
    onArrange(arrangeValues);
  };
  return <section className="first-act">
    <div className="paper-card first-act-card">
      <PageHeader eyebrow="第一幕 · 02" title="排出先後。" description="在各類別裡拖曳排序，越上面越重要。就算很難分，也請排出先後。" />
      <p className="rank-hint" id="rank-hint">拖曳左邊的把手移動；用鍵盤時，選到把手後按上下鍵移動。</p>
    </div>
    {categoryOrder.map(category => <RankList key={category} category={category} values={values} onArrange={arrange} />)}
    <p className="visually-hidden" aria-live="polite">{announcement}</p>
    <nav className="actions"><button className="secondary" onClick={onBack}>返回分類</button><button className="primary" onClick={onNext}>進入情境中的取捨</button></nav>
  </section>;
}

interface Drag {
  id: string;
  startY: number;
  dy: number;
  /** Where the value would land among the other values: 0 is above the first. */
  gap: number;
}

const moveKeys: Record<string, 'up' | 'down' | 'first' | 'last'> = { ArrowUp: 'up', ArrowDown: 'down', Home: 'first', End: 'last' };

function RankList({ category, values, onArrange }: { category: Category; values: readonly ValueItem[]; onArrange: (arrange: (values: readonly ValueItem[]) => ValueItem[], id: string) => void }) {
  const [drag, setDrag] = useState<Drag>();
  const rows = useRef(new Map<string, HTMLLIElement>());
  const members = rankedMembers(values, category);
  if (members.length === 0) return null;

  const gapAt = (id: string, clientY: number) => members.filter(value => value.id !== id).filter(value => {
    const box = rows.current.get(value.id)?.getBoundingClientRect();
    return box !== undefined && box.top + box.height / 2 < clientY;
  }).length;
  const others = drag ? members.filter(value => value.id !== drag.id) : [];
  const dropBefore = drag ? others[drag.gap]?.id : undefined;
  const dropAfter = drag && drag.gap === others.length ? others[others.length - 1]?.id : undefined;

  return <section className="rank-section" aria-labelledby={`rank-${category}`}>
    <h2 id={`rank-${category}`}><span className="marker">{categoryLabels[category]}</span></h2>
    <ol className="rank-list">{members.map((value, index) => {
      const dragging = drag?.id === value.id;
      const className = ['rank-row', dragging && 'dragging', dropBefore === value.id && 'drop-before', dropAfter === value.id && 'drop-after'].filter(Boolean).join(' ');
      return <li key={value.id} ref={element => { if (element) rows.current.set(value.id, element); else rows.current.delete(value.id); }} className={className} aria-labelledby={`rank-word-${value.id}`} style={dragging ? { transform: `translateY(${drag.dy}px)` } : undefined}>
        <button type="button" className="rank-handle" aria-label={`${value.word}的順序`} aria-describedby="rank-hint"
          onKeyDown={event => { const move = moveKeys[event.key]; if (!move) return; event.preventDefault(); onArrange(current => moveValue(current, category, value.id, move), value.id); }}
          onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setDrag({ id: value.id, startY: event.clientY, dy: 0, gap: gapAt(value.id, event.clientY) }); }}
          onPointerMove={event => { if (drag?.id === value.id) setDrag({ ...drag, dy: event.clientY - drag.startY, gap: gapAt(value.id, event.clientY) }); }}
          onPointerUp={event => {
            // Read the drop point from this event: the last pointermove may not have re-rendered yet.
            // A press without movement is not a drop, so clicking the handle never changes the order.
            if (drag?.id === value.id && Math.abs(event.clientY - drag.startY) > 4) {
              const gap = gapAt(value.id, event.clientY);
              onArrange(current => dropValue(current, category, value.id, gap), value.id);
            }
            setDrag(undefined);
          }}
          onPointerCancel={() => setDrag(undefined)}>
          <svg viewBox="0 0 12 20" aria-hidden="true"><circle cx="3" cy="4" r="1.6" /><circle cx="9" cy="4" r="1.6" /><circle cx="3" cy="10" r="1.6" /><circle cx="9" cy="10" r="1.6" /><circle cx="3" cy="16" r="1.6" /><circle cx="9" cy="16" r="1.6" /></svg>
        </button>
        <span className="rank-position" data-position={index + 1}>{index + 1}</span>
        <div className="rank-name"><strong id={`rank-word-${value.id}`}>{value.word}</strong>{value.custom && <span className="rank-tags"><small className="value-tag">自訂</small></span>}</div>
      </li>;
    })}</ol>
  </section>;
}
