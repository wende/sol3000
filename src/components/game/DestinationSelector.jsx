import { Show, For } from 'solid-js';
import { Rocket, MapPin } from 'lucide-solid';

/**
 * @typedef {Object} DestinationOption
 * @property {Object} system - The destination system
 * @property {number} hops - Number of hops to reach destination
 */

/**
 * @typedef {Object} DestinationSelectorProps
 * @property {DestinationOption[]} destinations - Available destinations
 * @property {(destinationId: string) => void} onSelect - Callback when destination is selected
 */

/**
 * Destination selection UI for launching colony ships.
 *
 * @param {DestinationSelectorProps} props
 */
export const DestinationSelector = (props) => {
  const resourceClass = (resources) => {
    if (resources === 'Rich') return 'text-green-400';
    if (resources === 'Poor') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div class="space-y-4">
      <div class="text-center mb-6">
        <Rocket size={32} class="mx-auto text-green-400 mb-2" />
        <h3 class="text-lg tracking-widest">SELECT DESTINATION</h3>
        <p class="text-xs text-gray-500 mt-1">Choose an unclaimed system to colonize</p>
      </div>

      <Show when={props.destinations.length === 0}>
        <div class="text-center py-8 text-gray-500">
          <MapPin size={24} class="mx-auto mb-2 opacity-50" />
          <p class="text-sm">No reachable unclaimed systems</p>
        </div>
      </Show>

      <For each={props.destinations}>
        {({ system: dest, hops }) => (
          <button
            onClick={() => props.onSelect(dest.id)}
            class="w-full p-4 hover:bg-green-500/10 rounded transition-all text-left"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="text-sm font-medium">{dest.name}</span>
                <div class="flex items-center gap-3 mt-1">
                  <span class={`text-[10px] ${resourceClass(dest.resources)}`}>
                    {dest.resources}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs text-gray-400">{hops} hops</span>
                <div class="text-[10px] text-gray-500">{hops * 60}s travel</div>
              </div>
            </div>
          </button>
        )}
      </For>
    </div>
  );
};
