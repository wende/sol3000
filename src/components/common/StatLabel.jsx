import { Show } from 'solid-js';

/**
 * Standard display for a single statistic label/value pair.
 * 
 * @param {Object} props
 * @param {string} props.label - The label (e.g., "POPULATION")
 * @param {string|number|import('solid-js').JSX.Element} props.value - The value to display
 * @param {string} [props.subtext] - Optional text below the value
 * @param {boolean} [props.large=false] - Whether to use large text for the value (text-lg)
 * @param {string} [props.size] - Explicit size: 'sm', 'lg', 'xl'
 * @param {string} [props.valueClass] - Additional classes for the value (e.g. text color)
 * @param {string} [props.class] - Container classes
 * @param {string} [props.id] - ID for testing
 */
export const StatLabel = (props) => {
  const valueSize = () => {
    if (props.size === 'xl') return 'text-xl';
    if (props.size === 'lg' || props.large) return 'text-lg';
    return 'text-sm';
  };

  return (
    <div class={`flex flex-col ${props.class || ''}`}>
      <span class="text-[10px] text-gray-400 tracking-widest uppercase mb-1">{props.label}</span>
      <span 
        id={props.id} 
        class={`${valueSize()} ${props.valueClass || 'text-white'} leading-tight`}
      >
        {props.value}
      </span>
      <Show when={props.subtext}>
        <span class="text-[10px] text-gray-500 mt-1">{props.subtext}</span>
      </Show>
    </div>
  );
};
