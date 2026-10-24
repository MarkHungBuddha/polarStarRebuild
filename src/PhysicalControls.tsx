import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { SceneProp } from './GameScene';

export function PiggyBank({ value, max, onChange }: { value: number; max: number; onChange: (value: number) => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [deposit, setDeposit] = useState(0);
  const point = (event: PointerEvent<SVGGElement>) => { const p = svg.current!.createSVGPoint(); p.x = event.clientX; p.y = event.clientY; return p.matrixTransform(svg.current!.getScreenCTM()!.inverse()); };
  const add = () => { if (value < max) { onChange(value + 1); setDeposit(count => count + 1); } };
  return <div className="piggy-layout"><svg ref={svg} className="play-scene piggy-scene" viewBox="0 0 600 350" role="group" aria-label="拖曳硬幣存入小豬撲滿">
    <ellipse cx="408" cy="286" rx="143" ry="10" fill="currentColor" opacity=".07"/>
    <g className="pig-body" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
      <path d="M291 151C310 109 354 99 399 112L428 84L442 126Q468 135 487 163L520 164V213L489 216Q478 247 451 257L449 284H422L413 264H355L345 284H319L319 253Q281 230 283 193Q267 192 259 181Q247 161 263 157Q278 154 270 176"/>
      <ellipse cx="503" cy="189" rx="19" ry="25"/><path d="M364 122H408" strokeWidth="6" strokeLinecap="round"/><circle cx="461" cy="161" r="4" fill="currentColor"/><path d="M501 183V193M510 183V193"/>
    </g>
    <text x="384" y="192" textAnchor="middle" className="pig-count">{value}</text><text x="384" y="220" textAnchor="middle" className="scene-small pig-unit">個月生活費</text>
    <path d="M180 170Q230 72 350 83" fill="none" stroke="var(--accent)" strokeDasharray="5 6"/><path d="M339 75L353 83L341 91" fill="none" stroke="var(--accent)"/>
    <text x="386" y="60" textAnchor="middle" className="scene-small">拖進這裡 ↓</text>
    {deposit > 0 && <g key={deposit} className="deposit-coin" aria-hidden="true"><SceneProp kind="coin" x={386} y={83}/></g>}
    <g role="button" tabIndex={0} aria-label="放入一個月生活費" aria-disabled={value >= max} className="pig-coin" onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); add(); } }} onClick={() => { if (!suppressClick.current) add(); suppressClick.current = false; }} onPointerDown={event => { suppressClick.current = false; start.current = point(event); event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => { if (start.current && event.currentTarget.hasPointerCapture(event.pointerId)) { const p = point(event); if (Math.hypot(p.x - start.current.x, p.y - start.current.y) > 5) { suppressClick.current = true; setDrag(p); } } }} onPointerUp={event => { const p = point(event); if (suppressClick.current && p.x >= 280 && p.x <= 525 && p.y >= 60 && p.y <= 280) add(); start.current = null; setDrag(null); }} onPointerCancel={() => { start.current = null; setDrag(null); suppressClick.current = true; }}>
      {/* Invisible ring that keeps the coin at least 44px across on a 320px screen. */}
      <circle className="pig-coin-hit" cx={drag?.x ?? 110} cy={drag?.y ?? 190} r="52" fill="transparent"/>
      <circle cx={drag?.x ?? 110} cy={drag?.y ?? 190} r="42" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2"/>
      <SceneProp kind="coin" x={drag?.x ?? 110} y={drag?.y ?? 190}/>
    </g>
    <text x="110" y="263" textAnchor="middle" className="scene-sign">一份生活費</text><text x="110" y="288" textAnchor="middle" className="scene-small">點一下，或拖進撲滿</text>
    <text x="400" y="324" textAnchor="middle" className="scene-small">{value === max ? '撲滿存滿了' : `最多存 ${max} 個月`}</text>
  </svg><div className="scene-tools"><button onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0}>取回一份</button><button onClick={() => onChange(0)}>不準備備用金</button></div></div>;
}

export function DragClock({ value, max, onChange }: { value: number | null; max: number; onChange: (value: number | null) => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const before = useRef<number | null>(null);
  const current = value ?? 0;
  const angle = current / 12 * Math.PI * 2 - Math.PI / 2;
  const move = (event: PointerEvent<SVGSVGElement>) => {
    const p = svg.current!.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
    const local = p.matrixTransform(svg.current!.getScreenCTM()!.inverse());
    if (Math.hypot(local.x - 200, local.y - 190) < 35) return;
    let hours = (Math.atan2(local.y - 190, local.x - 200) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2) * 12;
    if (hours < .5 && current > 6) hours = 12;
    onChange(Math.min(max, Math.max(0, Math.round(hours))));
  };
  return <div className="clock-layout"><svg ref={svg} className="real-clock" viewBox="0 0 400 400" role="slider" tabIndex={0} aria-label="拖曳時針安排休閒時間" aria-valuemin={0} aria-valuemax={max} aria-valuenow={current} aria-valuetext={`${current} 小時休閒`} onPointerDown={event => { event.preventDefault(); event.currentTarget.focus(); before.current = value; event.currentTarget.setPointerCapture(event.pointerId); move(event); }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event); }} onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => onChange(before.current)} onKeyDown={event => { const next = event.key === 'Home' ? 0 : event.key === 'End' ? max : ['ArrowRight', 'ArrowUp'].includes(event.key) ? Math.min(max, current + 1) : ['ArrowLeft', 'ArrowDown'].includes(event.key) ? Math.max(0, current - 1) : null; if (next !== null) { event.preventDefault(); onChange(next); } }}>
    <circle cx="200" cy="194" r="171" fill="currentColor" opacity=".08"/><circle className="clock-face" cx="200" cy="190" r="168" stroke="currentColor" strokeWidth="3"/>
    <circle cx="200" cy="190" r="99" fill="none" stroke="var(--accent)" opacity=".1" strokeWidth="90" strokeDasharray={`${current / 12 * 622} 622`} transform="rotate(-90 200 190)"/>
    {Array.from({ length: 60 }, (_, i) => { const a = i / 60 * Math.PI * 2; return <line key={i} x1={200 + Math.sin(a) * (i % 5 ? 151 : 143)} y1={190 - Math.cos(a) * (i % 5 ? 151 : 143)} x2={200 + Math.sin(a) * 157} y2={190 - Math.cos(a) * 157} stroke="currentColor" strokeWidth={i % 5 ? 1 : 3}/>; })}
    {Array.from({ length: 12 }, (_, i) => { const a = (i + 1) / 12 * Math.PI * 2; return <text key={i} x={200 + Math.sin(a) * 124} y={198 - Math.cos(a) * 124} textAnchor="middle" className="clock-hour">{i + 1}</text>; })}
    <path d={`M200 190L${200 + Math.cos(angle) * 99} ${190 + Math.sin(angle) * 99}`} stroke="var(--accent)" strokeWidth="8" strokeLinecap="round"/>
    <circle cx={200 + Math.cos(angle) * 99} cy={190 + Math.sin(angle) * 99} r="13" fill="var(--accent)" stroke="var(--bg)" strokeWidth="3"/>
    <circle cx="200" cy="190" r="9" fill="var(--ink)"/>
    <text x="200" y="256" textAnchor="middle" className="clock-readout">{current} 小時</text>
    <text x="200" y="392" textAnchor="middle" className="scene-small">拖曳時針 · 0–{max} 小時</text>
  </svg><div className="scene-tools"><button onClick={() => onChange(0)}>不保留休閒時間</button></div></div>;
}
