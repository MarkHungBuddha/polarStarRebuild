import { useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';

/** Pointer dragging plus pick-then-place for touch and keyboard. No native HTML drag dependency. */
export function useObjectDrag(transfer: (token: string, target: string) => void) {
  const [picked, setPicked] = useState<{ token: string; label: string }>();
  const [ghost, setGhost] = useState<{ label: string; x: number; y: number }>();
  const pointer = useRef<{ token: string; label: string; x: number; y: number; moved: boolean } | undefined>(undefined);
  const suppressClick = useRef(false);
  const place = (target: string) => {
    if (picked) { transfer(picked.token, target); setPicked(undefined); }
  };
  const end = () => { pointer.current = undefined; setGhost(undefined); };
  const pickOrPlace = (token: string, label: string, target?: string) => {
    if (picked && target && picked.token !== token) place(target);
    else setPicked(picked?.token === token ? undefined : { token, label });
  };
  const source = (token: string, label: string, target?: string) => ({
    'aria-pressed': picked?.token === token,
    'data-drag-token': token,
    'data-object-drop': target,
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      if (event.pointerType === 'touch') event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      pointer.current = { token, label, x: event.clientX, y: event.clientY, moved: false };
      suppressClick.current = false;
    },
    onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const current = pointer.current;
      if (!current) return;
      if (Math.hypot(event.clientX - current.x, event.clientY - current.y) > 6) current.moved = true;
      if (current.moved) setGhost({ label, x: event.clientX, y: event.clientY });
    },
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const current = pointer.current;
      if (current?.moved) {
        const destination = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-object-drop]')?.dataset.objectDrop;
        if (destination) transfer(current.token, destination);
        suppressClick.current = true;
        setPicked(undefined);
      } else if (current && event.pointerType === 'touch') {
        pickOrPlace(token, label, target);
        suppressClick.current = true;
      }
      end();
    },
    onPointerCancel: end,
    onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape') { setPicked(undefined); end(); }
    },
    onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
      pickOrPlace(token, label, target);
    },
  });
  const destination = (target: string) => ({
    'data-object-drop': target,
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => { if (event.pointerType === 'touch') event.preventDefault(); suppressClick.current = false; },
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => { if (event.pointerType === 'touch') { place(target); suppressClick.current = true; } },
    onClick: (event: ReactMouseEvent<HTMLButtonElement>) => { if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; } place(target); },
    onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape') setPicked(undefined);
    },
  });
  const feedback = <>
    {picked && <p className="object-picked" role="status">已拿起「{picked.label}」。請選目的地。<button className="text-button" onClick={() => setPicked(undefined)}>放下</button></p>}
    {ghost && <div className="object-drag-ghost" style={{ left: ghost.x, top: ghost.y }} aria-hidden="true">{ghost.label}</div>}
  </>;
  return { source, destination, feedback, clear: () => setPicked(undefined) };
}

