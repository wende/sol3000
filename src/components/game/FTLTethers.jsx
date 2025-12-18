import { For } from 'solid-js';

/**
 * @typedef {Object} FTLTethersProps
 * @property {Array} routes - Array of tether routes to render
 */

/**
 * Renders FTL tether lines (connections from 2-hop systems to unseen 3-hop systems)
 * with fade-out effect towards the direction they're pointing
 *
 * @param {FTLTethersProps} props
 */
export const FTLTethers = (props) => {
  return (
    <For each={props.routes}>
      {(tether) => (
        <line
          x1={tether.source.x}
          y1={tether.source.y}
          x2={tether.target.x}
          y2={tether.target.y}
          class="ftl-line"
          opacity="0.2"
        />
      )}
    </For>
  );
};
