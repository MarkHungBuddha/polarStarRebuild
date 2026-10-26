import type { CalendarInteraction } from './redesignTypes';
import { useObjectDrag } from './useObjectDrag';

/** A day stores its actual activity. Moving an occupied day swaps both arrangements. */
export function CalendarControl({ interaction, placements, onChange }: {
  interaction: CalendarInteraction; placements: readonly number[]; onChange: (placements: number[]) => void;
}) {
  const drag = useObjectDrag((token, target) => {
    const next = [...placements];
    const from = token.startsWith('day:') ? Number(token.slice(4)) : -1;
    if (target === 'tray') { if (from < 0) return; next[from] = -1; }
    else {
      const at = Number(target.slice(4));
      if (from >= 0) [next[from], next[at]] = [next[at], next[from]];
      else next[at] = Number(token);
    }
    onChange(next);
  });
  return <div className="calendar-control">
    <p>把行程卡放到每天的空格。排好的卡可以交換，也能移回卡片區。先選卡片、再選目的地也可以；按 Esc 取消拿取。</p>
    <div className="calendar-palette">
      {interaction.sides.map((side, index) => <div key={side.id}><button {...drag.source(String(index), side.label)}>{side.label}</button><p>{side.detail}</p></div>)}
      <button {...drag.destination('tray')}>移回卡片區</button>
    </div>
    {drag.feedback}
    <p role="status">還有 {placements.filter(side => side < 0).length} 天未安排</p>
    <div className="calendar-days" aria-label="旅行行事曆">{placements.map((side, index) => {
      const label = `${interaction.slots[index]}：${side < 0 ? '尚未安排' : interaction.sides[side].label}`;
      return <button key={interaction.slots[index]} aria-label={label} {...(side < 0 ? drag.destination(`day:${index}`) : drag.source(`day:${index}`, label, `day:${index}`))}>
        <span>{interaction.slots[index]}</span><strong>{side < 0 ? '把行程放進來' : interaction.sides[side].label}</strong>
      </button>;
    })}</div>
  </div>;
}
