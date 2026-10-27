import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { LinkedInteraction } from './redesignTypes';
import { linkedArrangement, linkedMetricValue } from './linkedArrangement';

export function LinkedControl({ interaction, value, onChange, onDragStart, onDragValue }: {
  interaction: LinkedInteraction; value: number; onChange: (value: number) => void; onDragStart: () => void; onDragValue: (value: number) => void;
}) {
  const active = useRef(false);
  const clamp = (next: number) => Math.max(interaction.min, Math.min(interaction.max, Math.round((next - interaction.min) / interaction.step) * interaction.step + interaction.min));
  const startHour = interaction.presentation?.kind === 'clock' ? interaction.presentation.startHour : 0;
  const point = (hours: number, radius: number) => ({ x: 120 + radius * Math.sin((startHour + hours) * Math.PI / 6), y: 120 - radius * Math.cos((startHour + hours) * Math.PI / 6) });
  const hand = point(value, 74);
  const pointerValue = (event: ReactPointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left - box.width / 2;
    const y = event.clientY - box.top - box.height / 2;
    if (Math.hypot(x, y) < box.width * .12) return;
    const hours = ((Math.atan2(x, -y) * 6 / Math.PI - startHour) % 12 + 12) % 12;
    // The unused arc maps to the closest endpoint, rather than wrapping to an unrelated hour.
    onDragValue(clamp(hours > interaction.max && hours > (interaction.max + 12) / 2 ? interaction.min : hours));
  };
  return <div className="linked-control">
    <div className="linked-object">
      {interaction.presentation?.kind === 'clock' ? <>
        <p>從 {startHour}:00 到 {startHour + interaction.max}:00，可安排 {interaction.max} {interaction.unit}</p>
        <svg className="linked-clock" viewBox="0 0 240 240" role="slider" tabIndex={0} aria-label={`${interaction.label}的安排`} aria-valuemin={interaction.min} aria-valuemax={interaction.max} aria-valuenow={value} aria-valuetext={linkedArrangement(interaction, value)}
          onPointerDown={event => { if (event.button !== 0) return; event.preventDefault(); active.current = true; event.currentTarget.setPointerCapture(event.pointerId); onDragStart(); pointerValue(event); }}
          onPointerMove={event => { if (active.current) pointerValue(event); }} onPointerUp={() => { active.current = false; }} onPointerCancel={() => { active.current = false; }}
          onKeyDown={event => {
            if (!['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault(); onChange(clamp(event.key === 'Home' ? interaction.min : event.key === 'End' ? interaction.max : value + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? interaction.step : -interaction.step)));
          }}>
          <circle className="linked-face" cx="120" cy="120" r="111" />
          {Array.from({ length: 12 }, (_, at) => { const p = point(at - startHour, 94); return <text key={at} x={p.x} y={p.y + 5} textAnchor="middle">{at === 0 ? 12 : at}</text>; })}
          <line className="linked-hand" x1="120" y1="120" x2={hand.x} y2={hand.y} />
          <circle className="linked-handle" cx={hand.x} cy={hand.y} r="12" />
          <circle className="linked-pin" cx="120" cy="120" r="5" />
        </svg>
        <p>拖動時針，或聚焦鐘面後按方向鍵；Home、End 移到兩端。</p>
      </> : <div className="linked-calendar" aria-label={`${interaction.label}桌曆`}><span>{interaction.label}</span><strong>{value}</strong><span>{interaction.unit}</span></div>}
      <label>{interaction.label}（{interaction.unit}）<input type="range" min={interaction.min} max={interaction.max} step={interaction.step} value={value} onChange={event => onChange(Number(event.target.value))} /></label>
      <p>範圍 {interaction.min}–{interaction.max} {interaction.unit}，每次 {interaction.step} {interaction.unit}。</p>
    </div>
    <div className="linked-feedback" aria-live="polite">
      <p>{interaction.label}：{value} {interaction.unit}</p>
      {interaction.resourceSides && interaction.resourceTotal !== undefined && <>
        <p>{interaction.resourceSides[1].label}：{interaction.resourceTotal - value} {interaction.unit}</p>
        <div className="linked-time-strip">{value > 0 && <span style={{ flex: value }}>{interaction.resourceSides[0].label}</span>}{interaction.resourceTotal > value && <span style={{ flex: interaction.resourceTotal - value }}>{interaction.resourceSides[1].label}</span>}</div>
      </>}
      {(interaction.metrics ?? []).map(metric => <p key={metric.label}>{metric.label}：{linkedMetricValue(interaction, metric, value)} {metric.unit}</p>)}
      <p>{interaction.consequence}</p>
    </div>
  </div>;
}
