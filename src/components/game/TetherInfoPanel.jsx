import { createMemo } from 'solid-js';
import { Shield } from 'lucide-solid';
import { StatBlock } from '../common/StatBlock';
import { StatLabel } from '../common/StatLabel';

const TETHER_STATE = {
  READY: 'READY',
  NEEDS_SCAN: 'NEEDS_SCAN',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  BLOCKED_BY_OTHER: 'BLOCKED_BY_OTHER',
  UNDER_CONSTRUCTION: 'UNDER_CONSTRUCTION',
  BUILT: 'BUILT',
};

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
  const tetherState = createMemo(() => {
    if (props.gameState.builtFTLs().has(props.tether.id)) {
      return TETHER_STATE.BUILT;
    }

    const construction = props.gameState.ftlConstruction();
    if (construction && construction.tetherId === props.tether.id) {
      return TETHER_STATE.UNDER_CONSTRUCTION;
    }

    const bothScanned = props.tether.source.owner === 'Player' && props.tether.target.owner === 'Player';
    if (!bothScanned) {
      return TETHER_STATE.NEEDS_SCAN;
    }

    if (props.gameState.credits() < 20) {
      return TETHER_STATE.INSUFFICIENT_CREDITS;
    }

    if (construction) {
      return TETHER_STATE.BLOCKED_BY_OTHER;
    }

    return TETHER_STATE.READY;
  });

  // Track the active construction duration for the progress animation
  const constructionDurationSec = createMemo(() => {
    const construction = props.gameState.ftlConstruction();
    if (!construction || construction.tetherId !== props.tether.id) return 0;
    return construction.duration / 1000;
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

  const renderBuildButton = (disabled) => (
    <button
      class="w-full bg-white text-black py-3 text-xs tracking-[0.2em] font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleBuildFTL}
      disabled={disabled}
    >
      BUILD FTL (20 CR)
    </button>
  );

  const renderActionPanel = () => {
    const state = tetherState();

    switch (state) {
      case TETHER_STATE.BUILT:
        return (
          <div class="p-4 bg-green-500/10 rounded">
            <p class="text-xs text-green-300 text-center">FTL ROUTE ESTABLISHED</p>
          </div>
        );
      case TETHER_STATE.UNDER_CONSTRUCTION:
        return (
          <>
            <div class="p-4 bg-white/5 rounded space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-[10px] text-gray-400 tracking-widest">CONSTRUCTING FTL</span>
                <span class="text-xs text-white font-mono ftl-countdown" style={{ '--ftl-duration': `${constructionDurationSec()}s` }}>
                  {Math.ceil(constructionDurationSec())}s
                </span>
              </div>
              <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full bg-white rounded-full ftl-progress-bar"
                  style={{
                    animation: `ftlProgressFill ${constructionDurationSec()}s linear forwards`
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
          </>
        );
      case TETHER_STATE.NEEDS_SCAN:
        return (
          <>
            {renderBuildButton(true)}
            <div class="p-3 bg-red-500/10 rounded">
              <p class="text-xs text-red-300 text-center">
                Both systems must be scanned before building FTL
              </p>
            </div>
          </>
        );
      case TETHER_STATE.INSUFFICIENT_CREDITS:
        return (
          <>
            {renderBuildButton(true)}
            <div class="p-3 bg-yellow-500/10 rounded">
              <p class="text-xs text-yellow-300 text-center">
                Insufficient credits
              </p>
            </div>
          </>
        );
      case TETHER_STATE.BLOCKED_BY_OTHER:
        return (
          <>
            {renderBuildButton(true)}
            <div class="p-3 bg-blue-500/10 rounded">
              <p class="text-xs text-blue-300 text-center">
                Another FTL tether is under construction
              </p>
            </div>
          </>
        );
      case TETHER_STATE.READY:
        return renderBuildButton(false);
      default:
        return null;
    }
  };

  return (
    <>
      {/* FTL Route Stats */}
      <StatBlock label="FTL ROUTE INFO">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-white/5 rounded">
            <StatLabel label="DISTANCE" value={`${props.tether.distance} LY`} size="xl" />
          </div>
          <div class="p-4 bg-white/5 rounded">
            <StatLabel label="TRAVEL TIME" value="6s" size="xl" />
          </div>
        </div>
      </StatBlock>

      {/* Connected Systems */}
      <StatBlock label="CONNECTED SYSTEMS">
        <div class="space-y-3">
          {/* Source System */}
          <div class="p-4 bg-white/5 rounded flex items-center justify-between">
            <StatLabel label="FROM" value={props.tether.source.name} large={true} />
            <Shield
              size={16}
              class={props.tether.source.owner === 'Player' ? 'text-white' : props.tether.source.owner === 'Enemy' ? 'text-red-400' : 'text-gray-400'}
            />
          </div>

          {/* Target System */}
          <div class="p-4 bg-white/5 rounded flex items-center justify-between">
            <StatLabel label="TO" value={props.tether.target.name} large={true} />
            <Shield
              size={16}
              class={props.tether.target.owner === 'Player' ? 'text-white' : props.tether.target.owner === 'Enemy' ? 'text-red-400' : 'text-gray-400'}
            />
          </div>
        </div>
      </StatBlock>

      {/* Route Description */}
      <StatBlock label="DATA LOG" class="pb-0">
        <p class="text-sm text-gray-300 leading-relaxed">
          FTL corridor connecting {props.tether.source.name} to {props.tether.target.name}.
          Ships can traverse this route using hyperspace jump technology.
        </p>
      </StatBlock>

      {/* Build FTL Action */}
      <div class="space-y-3 pt-4">
        {renderActionPanel()}
      </div>
    </>
  );
};
