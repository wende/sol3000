import { mergeProps, Show } from 'solid-js';
import { ResourceIcon } from './ResourceIcon';
import { formatNumber, formatRate } from '../../utils/format';

/**
 * @typedef {Object} ResourceProps
 * @property {string} type - Resource type (e.g., 'metals', 'credits')
 * @property {number} value - Current value
 * @property {number} [rate] - Production rate per second
 * @property {string} [label] - Custom label (defaults to type)
 * @property {number} [size] - Icon size (default: 24)
 * @property {boolean} [showLabel] - Whether to show the text label (default: true)
 * @property {boolean} [animate] - Whether to pulse on value change (default: false)
 * @property {string} [class] - Additional CSS classes
 */

/**
 * Standardized Resource display component.
 * Combines the ResourceIcon with value formatting and optional animations.
 * 
 * @param {ResourceProps} props 
 */
export const Resource = (props) => {
  const merged = mergeProps({ 
    size: 24, 
    showLabel: true,
    animate: false,
    class: '' 
  }, props);

  return (
    <div class={`inline-flex flex-col ${merged.class}`}>
      <style>
        {`
          @keyframes resourceTick {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          .animate-resource-tick {
            animation: resourceTick 0.3s ease-in-out;
          }
        `}
      </style>
      
      <div class="flex items-center gap-2 mb-1">
        <ResourceIcon type={merged.type} size={merged.size} class={merged.type === 'credits' ? 'text-blue-400' : 'text-gray-400'} />
        <Show when={merged.showLabel}>
          <span class="text-[10px] text-gray-400 tracking-widest uppercase">
            {merged.label || merged.type}
          </span>
        </Show>
      </div>
      
      <div class="flex items-baseline gap-2">
        <span 
          class={`text-lg font-light tabular-nums text-white ${merged.animate ? 'animate-resource-tick' : ''}`}
        >
          {formatNumber(merged.value)}
        </span>
        
        <Show when={merged.rate !== undefined}>
          <span class="text-[10px] tabular-nums text-green-400/80">
            {formatRate(merged.rate)}/s
          </span>
        </Show>
      </div>
    </div>
  );
};
