import { Show, createMemo } from 'solid-js';

/**
 * @typedef {Object} SystemProgressRingProps
 * @property {number} radius - Circle radius
 * @property {number} [progress] - Progress percentage (0-100). Defaults to 100.
 * @property {string} [stroke] - Stroke color. Defaults to the owned-system ring color.
 * @property {number} [strokeWidth] - Stroke width. Defaults to 1.
 * @property {number} [opacity] - Opacity (0-1). Defaults to 0.5.
 * @property {string} [class] - Optional class name.
 * @property {string|Object} [style] - Optional inline style.
 */

/**
 * System ring that can render as either a full ownership circle (100%)
 * or a partial progress ring (e.g. while scanning).
 *
 * Uses SVG stroke-dasharray with a normalized path length.
 *
 * @param {SystemProgressRingProps} props
 */
export const SystemProgressRing = (props) => {
  const progress = createMemo(() => Math.min(100, Math.max(0, props.progress ?? 100)));
  const stroke = () => props.stroke ?? 'rgba(255, 255, 255, 0.3)';
  const strokeWidth = () => props.strokeWidth ?? 1;
  const opacity = () => props.opacity ?? 0.5;

  return (
    <Show when={progress() > 0}>
      <Show
        when={progress() >= 100}
        fallback={(
          <circle
            r={props.radius}
            fill="none"
            stroke={stroke()}
            stroke-width={strokeWidth()}
            opacity={opacity()}
            class={props.class}
            style={props.style}
            pathLength={100}
            stroke-dasharray={`${progress()} 100`}
            transform="rotate(-90)"
          />
        )}
      >
        {/* Render a normal circle at 100% to match the owned-system ring exactly */}
        <circle
          r={props.radius}
          fill="none"
          stroke={stroke()}
          stroke-width={strokeWidth()}
          opacity={opacity()}
          class={props.class}
          style={props.style}
        />
      </Show>
    </Show>
  );
};
