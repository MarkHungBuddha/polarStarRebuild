import { useId } from 'react';
import { maxSharedCustomValues } from './resultLink';
import type { ValueItem } from './types';

/**
 * 也分享自訂價值: none is shared until the sharer checks it, and at most ten fit in one result link. `custom` is in first-act order;
 * `selected` holds the checked ids.
 */
export function ShareCustomValues({ custom, selected, onChange }: {
  custom: readonly ValueItem[]; selected: readonly string[]; onChange: (selected: string[]) => void;
}) {
  const hintId = useId();
  const atLimit = selected.length >= maxSharedCustomValues;
  if (custom.length === 0) return null;
  return <fieldset aria-describedby={hintId}>
    <legend>也分享自訂價值</legend>
    <p id={hintId}>預設不分享。勾選的項目會放進結果連結；結果圖最多放 3 個，其餘寫成「另有 N 個自訂價值」。{atLimit && `最多 ${maxSharedCustomValues} 個。`}</p>
    {custom.map(value => <label className="share-custom-value" key={value.id}>
      <input type="checkbox" checked={selected.includes(value.id)} disabled={atLimit && !selected.includes(value.id)} onChange={event => onChange(event.target.checked ? [...selected, value.id] : selected.filter(id => id !== value.id))} />
      <span>{value.word}</span>
    </label>)}
  </fieldset>;
}
