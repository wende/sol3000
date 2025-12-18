import { Show } from 'solid-js';

/**
 * @typedef {Object} ProgressBarProps
 * @property {number} progress - Progress percentage (0-100)
 * @property {string} [color] - Fill color (default: "#ffffff")
 * @property {number} [height] - Height in pixels (default: 4)
 * @property {boolean} [glow] - Whether to add glow effect
 * @property {'default' | 'glass'} [variant] - Style variant
 * @property {string} [label] - Custom label for glass variant
 */

/**
 * Progress bar component with multiple style variants.
 *
 * @param {ProgressBarProps} props
 */
export const ProgressBar = (props) => {
  const progress = () => Math.min(100, Math.max(0, props.progress));
  const color = () => props.color || '#ffffff';
  const height = () => props.height || 4;
  const label = () => props.label ?? `${Math.round(progress())}%`;

  return (
    <Show
      when={props.variant === 'glass'}
      fallback={
        <div style={{
          width: '100%',
          height: `${height()}px`,
          background: 'rgba(255,255,255,0.1)',
          'border-radius': '9999px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              width: `${progress()}%`,
              background: color(),
              transition: 'width 0.1s ease',
              'box-shadow': props.glow ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
            }}
          />
        </div>
      }
    >
      <div
        style={{
          width: '100%',
          height: '24px',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.3)',
          overflow: 'hidden',
          'box-shadow': progress() > 0 ? '0 0 10px rgba(255,255,255,0.05)' : 'none'
        }}
      >
        {/* Fill bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${progress()}%`,
            background: 'linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.3))',
            transition: 'width 0.1s ease',
            'box-shadow': progress() > 0 ? 'inset 0 0 10px rgba(255,255,255,0.1), 0 0 15px rgba(255,255,255,0.1)' : 'none'
          }}
        />
        {/* Glow edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'rgba(255,255,255,0.8)',
            left: `calc(${progress()}% - 1px)`,
            opacity: progress() > 0 && progress() < 100 ? 1 : 0,
            transition: 'left 0.1s ease, opacity 0.1s ease',
            'box-shadow': '0 0 8px rgba(255,255,255,0.8), 0 0 15px rgba(255,255,255,0.4)'
          }}
        />
        {/* Label */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center'
          }}
        >
          <span
            style={{
              'font-size': '10px',
              'font-weight': '500',
              'letter-spacing': '0.05em',
              color: 'rgba(255,255,255,0.7)',
              'text-transform': 'uppercase',
              'text-shadow': '0 0 10px rgba(0,0,0,0.5)'
            }}
          >
            {label()}
          </span>
        </div>
      </div>
    </Show>
  );
};
