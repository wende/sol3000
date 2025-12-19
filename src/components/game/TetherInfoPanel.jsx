import { Show, createMemo } from 'solid-js';
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
  // Check if both systems are scanned (Player-owned)
  const bothScanned = createMemo(() => {
    return props.tether.source.owner === 'Player' && props.tether.target.owner === 'Player';
  });

  // Check if player has enough credits
  const hasCredits = createMemo(() => {
    return props.gameState.resources().credits >= 20;
  });

  // Check if this tether is under construction
  const isUnderConstruction = createMemo(() => {
    const construction = props.gameState.ftlConstruction();
    if (!construction) return false;
    return construction.tetherId === props.tether.id;
  });

  // Check if any FTL is being constructed (blocks building another)
  const isConstructingAny = createMemo(() => {
    return props.gameState.ftlConstruction() !== null;
  });

  // Get construction duration in seconds for CSS animation
  const constructionDurationSec = () => {
    const construction = props.gameState.ftlConstruction();
    if (!construction || construction.tetherId !== props.tether.id) return 0;
    return construction.duration / 1000;
  };

  // Check if button should be disabled
  const isDisabled = createMemo(() => {
    return !bothScanned() || !hasCredits() || isConstructingAny();
  });

  // Handler for building FTL
  const handleBuildFTL = () => {
    const result = props.gameState.buildFTL(props.tether.id);
    if (!result) {
      console.warn('Failed to build FTL:', props.tether.id);
    }
  };

  // Handler for cancelling FTL construction
  const handleCancelConstruction = () => {
    props.gameState.cancelFTLConstruction();
  };

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
          {/* Show construction progress if this tether is being built */}
          <Show
            when={isUnderConstruction()}
            fallback={
              <>
                <button
                  class="w-full bg-white text-black py-3 text-xs tracking-[0.2em] font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleBuildFTL}
                  disabled={isDisabled()}
                >
                  BUILD FTL (20 CR)
                </button>
                <Show when={!bothScanned()}>
                  <div class="p-3 bg-red-500/10 rounded">
                    <p class="text-xs text-red-300 text-center">
                      Both systems must be scanned before building FTL
                    </p>
                  </div>
                </Show>
                <Show when={bothScanned() && !hasCredits()}>
                  <div class="p-3 bg-yellow-500/10 rounded">
                    <p class="text-xs text-yellow-300 text-center">
                      Insufficient credits
                    </p>
                  </div>
                </Show>
                <Show when={bothScanned() && hasCredits() && isConstructingAny()}>
                  <div class="p-3 bg-blue-500/10 rounded">
                    <p class="text-xs text-blue-300 text-center">
                      Another FTL tether is under construction
                    </p>
                  </div>
                </Show>
              </>
            }
          >
            {/* Construction Progress UI */}
            <div class="p-4 bg-white/5 rounded space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-[10px] text-gray-400 tracking-widest">CONSTRUCTING FTL</span>
                <span class="text-xs text-white font-mono ftl-countdown" style={{ '--ftl-duration': `${constructionDurationSec()}s` }}>
                  {Math.ceil(constructionDurationSec())}s
                </span>
              </div>
              {/* Progress bar - uses CSS animation */}
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-white rounded-full ftl-progress-bar"
                  style={{
                    'animation': `ftlProgressFill ${constructionDurationSec()}s linear forwards`
                  }}
                />
              </div>
              <div class="text-center">
                <span class="text-xs text-gray-400">Building FTL tether...</span>
              </div>
            </div>
            <button
              class="w-full bg-red-500/20 text-red-300 py-2 text-xs tracking-[0.2em] hover:bg-red-500/30 transition-colors border border-red-500/30"
              onClick={handleCancelConstruction}
            >
              CANCEL CONSTRUCTION
            </button>
          </Show>
        </Show>
      </div>
    </>
  );
};
