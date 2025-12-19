import { Show } from 'solid-js';
import { Shield } from 'lucide-solid';

/**
 * @typedef {Object} TetherInfoPanelProps
 * @property {Object} tether - The selected tether { id, source, target, distance }
 * @property {Object} gameState - The game state object
 */

/**
 * Tether Info Panel - displays FTL route information and actions
 *
 * @param {TetherInfoPanelProps} props
 */
export const TetherInfoPanel = (props) => {
  return (
    <>
      {/* FTL Route Stats */}
      <div class="pb-6">
        <span class="text-[10px] text-gray-500 tracking-widest block mb-3">FTL ROUTE INFO</span>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-white/5 rounded">
            <span class="text-[10px] text-gray-500 tracking-widest block mb-1">DISTANCE</span>
            <span class="text-xl font-light">{props.tether.distance} LY</span>
          </div>
          <div class="p-4 bg-white/5 rounded">
            <span class="text-[10px] text-gray-500 tracking-widest block mb-1">TRAVEL TIME</span>
            <span class="text-xl font-light">6s</span>
          </div>
        </div>
      </div>

      {/* Connected Systems */}
      <div class="pb-6">
        <span class="text-[10px] text-gray-500 tracking-widest block mb-3">CONNECTED SYSTEMS</span>
        <div class="space-y-3">
          {/* Source System */}
          <div class="p-4 bg-white/5 rounded flex items-center justify-between">
            <div>
              <span class="text-[10px] text-gray-500 tracking-widest block mb-1">FROM</span>
              <span class="text-lg font-light">{props.tether.source.name}</span>
            </div>
            <Shield
              size={16}
              class={props.tether.source.owner === 'Player' ? 'text-white' : props.tether.source.owner === 'Enemy' ? 'text-red-400' : 'text-gray-400'}
            />
          </div>

          {/* Target System */}
          <div class="p-4 bg-white/5 rounded flex items-center justify-between">
            <div>
              <span class="text-[10px] text-gray-500 tracking-widest block mb-1">TO</span>
              <span class="text-lg font-light">{props.tether.target.name}</span>
            </div>
            <Shield
              size={16}
              class={props.tether.target.owner === 'Player' ? 'text-white' : props.tether.target.owner === 'Enemy' ? 'text-red-400' : 'text-gray-400'}
            />
          </div>
        </div>
      </div>

      {/* Route Description */}
      <div>
        <span class="text-[10px] text-gray-500 tracking-widest block mb-3">DATA LOG</span>
        <p class="text-sm text-gray-300 leading-relaxed">
          FTL corridor connecting {props.tether.source.name} to {props.tether.target.name}.
          Ships can traverse this route using hyperspace jump technology.
        </p>
      </div>

      {/* Build FTL Action */}
      <div class="space-y-3 pt-4">
        <Show
          when={!props.gameState.builtFTLs().has(props.tether.id)}
          fallback={
            <div class="p-4 bg-green-500/10 rounded">
              <p class="text-xs text-green-300 text-center">FTL ROUTE ESTABLISHED</p>
            </div>
          }
        >
          <button
            class="w-full bg-white text-black py-3 text-xs tracking-[0.2em] font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => props.gameState.buildFTL(props.tether.id)}
            disabled={props.gameState.resources().credits < 20}
          >
            BUILD FTL (20 CR)
          </button>
        </Show>
      </div>
    </>
  );
};
