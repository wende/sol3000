import { Show } from 'solid-js';
import { formatNumber, formatRate } from '../../utils/format';

/**
 * @typedef {Object} ResourceStatProps
 * @property {import('solid-js').JSX.Element} icon - Icon element
 * @property {string} label - Resource label
 * @property {number} value - Current value
 * @property {number} [rate] - Production rate per second (optional)
 * @property {string} [valueClass] - Additional CSS class for value
 * @property {string} [rateLabel] - Custom rate label (e.g., "-50% prod")
 * @property {string} [id] - Optional ID for testing
 */

/**
 * Single resource stat display with optional production rate.
 *
 * @param {ResourceStatProps} props
 */
export const ResourceStat = (props) => {
  return (
    <div>
      <div class="flex items-center gap-2 mb-1">
        {props.icon}
        <span class="text-[10px] text-gray-400 tracking-widest">{props.label}</span>
      </div>
      <div class="flex items-baseline gap-2">
        <span id={props.id} class={`text-lg font-light tabular-nums ${props.valueClass || 'text-white'}`}>
          {formatNumber(props.value)}
        </span>
        <Show when={props.rate !== undefined}>
          <span class="text-[10px] text-green-400/80 tabular-nums">
            {formatRate(props.rate)}/s
          </span>
        </Show>
        <Show when={props.rateLabel}>
          <span class="text-[10px] text-red-400/80">{props.rateLabel}</span>
        </Show>
      </div>
    </div>
  );
};
