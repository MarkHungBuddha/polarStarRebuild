import { useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';

export type PropKind = 'person' | 'paper' | 'phone' | 'ticket' | 'key' | 'mic' | 'clock' | 'coin';

export function SceneProp({ kind, x, y }: { kind: PropKind; x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`} className="scene-prop" fill="var(--bg)" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
    {kind === 'person' ? <><circle cy="-28" r="11" /><path d="M-17 10V-5Q-17-17 0-17Q17-17 17-5V10M-8 10V29M8 10V29M-17-5L-25 10M17-5L25 10" fill="none" /></> :
      kind === 'phone' ? <><rect x="-17" y="-30" width="34" height="60" rx="5"/><path d="M-8-21H8M-8-6H8M-8 2H5M-5 21H5"/></> :
      kind === 'key' ? <><circle cx="-9" cy="-9" r="14"/><path d="M1 1L25 25M13 13L20 6M20 20L27 13" fill="none"/></> :
      kind === 'mic' ? <><rect x="-10" y="-30" width="20" height="36" rx="10"/><path d="M-17-7V0Q-17 17 0 17Q17 17 17 0V-7M0 17V30M-12 30H12" fill="none"/></> :
      kind === 'clock' || kind === 'coin' ? <><circle r="24"/>{kind === 'clock' ? <path d="M0-16V0L12 8" fill="none"/> : <text y="7" textAnchor="middle" stroke="none" fill="currentColor" fontSize="20">$</text>}</> :
      kind === 'ticket' ? <><path d="M-29-18H29V-6Q17 0 29 6V18H-29V6Q-17 0-29-6Z"/><path d="M12-15V15" strokeDasharray="3 3"/></> : <><path d="M-21-29H10L22-17V29H-21Z"/><path d="M10-29V-17H22M-12-8H12M-12 2H12M-12 12H6"/></>}
  </g>;
}

export function SceneAction({ label, onActivate, children, className = '' }: { label: string; onActivate: () => void; children: ReactNode; className?: string }) {
  const key = (event: KeyboardEvent<SVGGElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onActivate(); } };
  return <g role="button" tabIndex={0} aria-label={label} onClick={onActivate} onKeyDown={key} aria-pressed={className.includes('chosen')} className={`scene-action ${className}`}>{children}</g>;
}

/** Pointer capture keeps touch drags within the illustration; cancelled/outside drops do not answer. */
export function TransferScene({ prop, destinations, labels, selected, onChoose }: {
  prop: PropKind; destinations: readonly [string, string]; labels: readonly [string, string]; selected: number | null; onChoose: (index: number) => void;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const position = (event: PointerEvent<SVGGElement>) => {
    const point = svg.current!.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(svg.current!.getScreenCTM()!.inverse());
  };
  const home = { x: selected === null ? 300 : selected === 0 ? 130 : 470, y: selected === null ? 260 : 167 };
  return <svg ref={svg} className="play-scene" viewBox="0 0 600 340" role="group" aria-label="拖動物件到場景中的目的地，也可直接點選目的地">
    <defs><pattern id="floor-lines" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 40H40" stroke="currentColor" opacity=".06"/></pattern></defs>
    <path d="M0 225H600V340H0Z" fill="url(#floor-lines)"/><path d="M20 225H580" stroke="currentColor" opacity=".25"/>
    {destinations.map((name, index) => <SceneAction key={name} label={labels[index]} onActivate={() => onChoose(index)} className={selected === index ? 'chosen' : ''}>
      <rect x={index === 0 ? 35 : 375} y="30" width="190" height="194" rx="2" className="destination-room"/>
      {prop === 'person' || prop === 'ticket' ? <path d={index === 0 ? 'M50 224V83H210V224' : 'M390 224V83H550V224'} fill="none" stroke="currentColor" strokeWidth="2"/> : prop === 'mic' || prop === 'key' ? <SceneProp kind="person" x={index === 0 ? 130 : 470} y={120}/> : prop === 'phone' ? index === 0 ? <><ellipse cx="130" cy="166" rx="55" ry="13" fill="none" stroke="currentColor"/><path d="M80 166V220M180 166V220" stroke="currentColor"/></> : <><rect x="416" y="95" width="108" height="125" fill="none" stroke="currentColor"/><path d="M470 95V220" stroke="currentColor"/></> : <><rect x={index === 0 ? 98 : 438} y="94" width="64" height="44" fill="none" stroke="currentColor"/><path d={index === 0 ? 'M130 138V151M109 151H151' : 'M470 138V151M449 151H491'} stroke="currentColor"/></>}
      <text x={index === 0 ? 130 : 470} y="61" textAnchor="middle" className="scene-sign">{name}</text>
      <path d={index === 0 ? 'M78 191H182M88 191V222M172 191V222' : 'M418 191H522M428 191V222M512 191V222'} stroke="currentColor" strokeWidth="3"/>
      <circle cx={index === 0 ? 200 : 540} cy="135" r="4" fill="currentColor"/>
      <text x={index === 0 ? 130 : 470} y="247" textAnchor="middle" className="scene-small">{selected === index ? '已放在這裡' : '點這裡 / 拖進來'}</text>
    </SceneAction>)}
    <path d="M250 285H190M350 285H410M198 279L190 285L198 291M402 279L410 285L402 291" fill="none" stroke="var(--accent)" strokeWidth="2"/>
    <g className="movable-prop" onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setDrag(position(event)); }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) setDrag(position(event)); }} onPointerUp={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; const p = position(event); event.currentTarget.releasePointerCapture(event.pointerId); setDrag(null); if (p.y >= 30 && p.y <= 225 && p.x >= 35 && p.x <= 225) onChoose(0); if (p.y >= 30 && p.y <= 225 && p.x >= 375 && p.x <= 565) onChoose(1); }} onPointerCancel={() => setDrag(null)}>
      <circle cx={(drag ?? home).x} cy={(drag ?? home).y} r="42" fill="var(--bg)" stroke="var(--accent)" strokeDasharray="4 5"/>
      <SceneProp kind={prop} {...(drag ?? home)} />
    </g>
    <text x="300" y="324" textAnchor="middle" className="scene-small">拖曳虛線圈裡的物件，放到目的地</text>
  </svg>;
}
