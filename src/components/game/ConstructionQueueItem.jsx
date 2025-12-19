import { Show } from 'solid-js';
import { ProgressBar } from '../common/ProgressBar';

/**
 * @typedef {Object} ConstructionQueueItemProps
 * @property {Object} item - Construction queue item
 * @property {boolean} isActive - Whether this is the currently building item
 * @property {number} now - Current timestamp for progress calculation
 */

/**
 * Single item in the construction queue.
 *
 * @param {ConstructionQueueItemProps} props
 */
export const ConstructionQueueItem = (props) => {
  const elapsed = () => props.now - props.item.startTime;
  const progress = () => Math.min(100, (elapsed() / props.item.duration) * 100);
  const remaining = () => Math.max(0, props.item.duration - elapsed()) / 1000;

  const displayName = () => {
    const target = props.item.target;
    if (target === 'colonyShip') return 'Colony Ship';
    if (target === 'oreMine') return 'Ore Mine';
    if (target === 'solarPlant') return 'Solar Plant';
    if (target === 'tradeHub') return 'Trade Hub';
    if (target === 'shipyard') return 'Shipyard';
    return target.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div style={{
      padding: '12px',
      'margin-bottom': '8px',
      background: 'rgba(255,255,255,0.02)'
    }}>
      <div style={{
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        'margin-bottom': props.isActive ? '8px' : '0'
      }}>
        <span style={{ 'font-size': '12px' }}>{displayName()}</span>
        <Show when={!props.isActive}>
          <span style={{ 'font-size': '10px', color: '#6b7280' }}>Queued</span>
        </Show>
      </div>
      <Show when={props.isActive}>
        <ProgressBar progress={progress()} variant="glass" label={`${Math.floor(remaining())}s`} />
      </Show>
    </div>
  );
};
