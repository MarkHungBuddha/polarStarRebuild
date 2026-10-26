import type { ResourceInteraction } from './redesignTypes';
import { useObjectDrag } from './useObjectDrag';

/** Each resource exists exactly once; moving changes its destination, never the total. */
export function ResourceControl({ interaction, placements, onChange }: {
  interaction: ResourceInteraction; placements: readonly number[]; onChange: (placements: number[]) => void;
}) {
  const drag = useObjectDrag((token, target) => {
    const index = Number(token);
    const next = [...placements];
    next[index] = target === 'tray' ? -1 : Number(target);
    onChange(next);
  });
  const objectsAt = (side: number) => interaction.objects.map((label, index) => placements[index] === side
    ? <button key={label} className="resource-token" aria-label={label} {...drag.source(String(index), label)}>{label}<small>1 {interaction.unit}</small></button> : null);
  return <div className="resource-control">
    <p>每枚籌碼是 1 {interaction.unit}，共 {interaction.objects.length} {interaction.unit}。拖進準備簿、移到另一邊，或移回未分配區；也能先選籌碼，捲動後再選放置位置。</p>
    {drag.feedback}
    <section className="resource-tray" aria-label="未分配資源">
      <p role="status">未分配：{placements.filter(side => side < 0).length} {interaction.unit}</p>
      <div className="resource-tokens">{objectsAt(-1)}</div>
      <button {...drag.destination('tray')}>放回未分配區</button>
    </section>
    <div className="resource-destinations">{interaction.sides.map((side, index) => <section key={side.id} aria-label={side.label}>
      <h2>{side.label}</h2><p>{side.detail}</p>
      <p role="status">{side.label}：{placements.filter(at => at === index).length} {interaction.unit}</p>
      <button {...drag.destination(String(index))}>放進{side.label}</button>
      <div className="resource-tokens">{objectsAt(index)}</div>
    </section>)}</div>
  </div>;
}
