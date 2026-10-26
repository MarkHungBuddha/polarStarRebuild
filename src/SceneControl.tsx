import type { SceneInteraction } from './redesignTypes';
import type { CSSProperties } from 'react';
import { useObjectDrag } from './useObjectDrag';
import './scene.css';

/** Valid destinations represent actions; the transition area carries no direction. */
export function SceneControl({ interaction, locationId, onChange }: {
  interaction: SceneInteraction; locationId?: string; onChange: (locationId?: string) => void;
}) {
  const transition = interaction.transitionLabel ?? '待放置區';
  const location = interaction.locations.find(item => item.id === locationId);
  const drag = useObjectDrag((_token, target) => {
    if (target !== 'scene-transition' && !interaction.locations.some(item => item.id === target)) return;
    onChange(target === 'scene-transition' ? undefined : target);
  });
  const position = (index: number, isTransition = false, mobileRow = index + 1) => ({
    '--scene-column': isTransition ? '1 / -1' : index % 2 + 1,
    '--scene-row': Math.floor(index / 2) + 1,
    '--scene-mobile-row': mobileRow,
  } as CSSProperties);
  const transitionPosition = position(Math.ceil(interaction.locations.length / 2) * 2, true, interaction.locations.length + 1);
  const actor = <button className="scene-object" aria-label={`移動${interaction.object}，目前在${location?.label ?? transition}`} {...drag.source('scene-object', interaction.object)}>
    <span className="scene-person" aria-hidden="true" /><strong>{interaction.object}</strong>
  </button>;
  return <div className="scene-control">
    <p>把{interaction.object}移到情境中的位置，看看安排怎麼改變。也可以先拿起物件，再選目的地；按 Esc 取消拿取。還沒想好時，可以移回{transition}。</p>
    {drag.feedback}
    <div className="scene-floor" aria-label="情境位置">
      <div className="scene-rooms">{interaction.locations.map((item, index) => <section style={position(index)} data-object-drop={item.id} className={`scene-room${locationId === item.id ? ' scene-room-occupied' : ''}`} key={item.id}>
        <h2>{item.label}</h2>
        <p>{item.consequence}</p>
        <div className="scene-occupant" />
        <button className="scene-destination" {...drag.destination(item.id)}>{item.action ?? `移到${item.label}`}</button>
      </section>)}</div>
      <section style={transitionPosition} className="scene-transition" data-object-drop="scene-transition">
        <h2>{transition}</h2>
        <div className="scene-occupant" />
        <button {...drag.destination('scene-transition')}>移回{transition}</button>
      </section>
      <div className={`scene-actor-position${location ? '' : ' scene-actor-transition'}`} style={location ? position(interaction.locations.indexOf(location)) : transitionPosition}>{actor}</div>
    </div>
    <p role="status">{location ? `目前在${location.label}：${location.consequence}` : `目前在${transition}，還沒決定要去哪裡。`}</p>
  </div>;
}
