import { Show } from 'solid-js';
import { Zap } from 'lucide-solid';

/**
 * @typedef {Object} EnergyStatProps
 * @property {number} capacity - Total energy capacity
 * @property {number} usage - Current energy usage
 */

/**
 * Energy stat display showing available/total capacity.
 *
 * @param {EnergyStatProps} props
 */
export const EnergyStat = (props) => {
  const available = () => (props.capacity || 50) - (props.usage || 0);
  const isOverloaded = () => (props.usage || 0) > (props.capacity || 50);

  return (
    <div>
      <div class="flex items-center gap-2 mb-1">
        <Zap size={14} class="text-yellow-300" />
        <span class="text-[10px] text-gray-400 tracking-widest">ENERGY</span>
      </div>
      <div class="flex items-baseline gap-2">
        <span
          id="stats-energy-value"
          class={`text-lg font-light tabular-nums ${isOverloaded() ? 'text-red-400' : 'text-white'}`}
        >
          {available()} / {props.capacity || 50}
        </span>
        <Show when={isOverloaded()}>
          <span class="text-[10px] text-red-400/80">-50% prod</span>
        </Show>
      </div>
    </div>
  );
};
