import { Show } from 'solid-js';

/**
 * Standard container for a block of statistics.
 * 
 * @param {Object} props
 * @param {string} [props.label] - Optional header label for the block (e.g., "SYSTEM CONTROL")
 * @param {string} [props.class] - Additional classes for the container
 * @param {import('solid-js').JSX.Element} props.children
 */
export const StatBlock = (props) => {
  return (
    <div class={`pb-6 ${props.class || ''}`}>
      <Show when={props.label}>
        <span class="text-[10px] text-gray-500 tracking-widest block mb-3 uppercase">
          {props.label}
        </span>
      </Show>
      {props.children}
    </div>
  );
};
