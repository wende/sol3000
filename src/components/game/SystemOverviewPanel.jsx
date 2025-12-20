import { Show, For, createMemo } from 'solid-js';
import { Shield, Rocket, Crosshair } from 'lucide-solid';
import { ProgressBar } from '../common/ProgressBar';
import { ConstructionQueueItem } from './ConstructionQueueItem';
import { getScanInfo, SCAN_COST } from '../../operations/scan';

/**
 * @typedef {Object} SystemOverviewPanelProps
 * @property {Object} system - The selected system
 * @property {Function} onManageBuildings - Callback to show buildings view
 * @property {Function} onLaunchShip - Callback to show launch view
 * @property {Object} gameState - The game state object
 * @property {number} now - Current time for progress bars
 * @property {Object} tradeFlows - Trade flow data
 */

/**
 * System Overview Panel - displays system stats, construction, and actions
 *
 * @param {SystemOverviewPanelProps} props
 */
export const SystemOverviewPanel = (props) => {
  const dockedShipsHere = () => {
    return props.gameState.ships().filter(
      s => s.status === 'docked' && s.systemId === props.system.id
    );
  };

  const scanState = createMemo(() => {
    const scanning = props.gameState.scanningSystem();
    const isScanningThisSystem = scanning?.systemId === props.system.id;
    const resources = props.gameState.resources();

    if (isScanningThisSystem && scanning) {
      const elapsed = props.now - scanning.startTime;
      const progress = Math.min(100, (elapsed / scanning.duration) * 100);
      const remainingSeconds = Math.max(0, Math.ceil((scanning.duration - elapsed) / 1000));

      return {
        hasActiveScan: true,
        isScanningThisSystem: true,
        progress,
        remainingSeconds,
        canAffordScan: resources.credits >= SCAN_COST,
        scanInfo: null,
      };
    }

    return {
      hasActiveScan: Boolean(scanning),
      isScanningThisSystem: false,
      progress: 0,
      remainingSeconds: 0,
      canAffordScan: resources.credits >= SCAN_COST,
      scanInfo: getScanInfo(
        props.gameState.galaxyData(),
        props.gameState.homeSystemId(),
        props.system.id,
        props.gameState.findPath
      ),
    };
  });

  return (
    <>
      {/* Market Display */}
      <Show when={props.system.market?.metals && (props.system.market.metals.supply > 0 || props.system.market.metals.demand > 0)}>
        {(() => {
          const isSupply = props.system.market.metals.supply > 0;
          const total = isSupply ? props.system.market.metals.supply : props.system.market.metals.demand;
          const satisfaction = props.tradeFlows?.systemSatisfaction?.get(props.system.id);
          const flowAmount = satisfaction
            ? (isSupply ? Math.round(satisfaction.used || 0) : Math.round(satisfaction.satisfied || 0))
            : 0;

          return (
            <div class="pb-6">
              <span class="text-[10px] text-gray-500 tracking-widest block mb-3">METALS MARKET</span>
              <div class="flex items-center justify-between p-3 rounded-sm">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-400 tracking-widest">ROLE</span>
                  <span class="text-sm text-white">
                    {isSupply ? 'SUPPLY' : 'DEMAND'}
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-xs text-gray-400 tracking-widest block">
                    {isSupply ? 'EXPORTED' : 'SATISFIED'}
                  </span>
                  <span class="text-lg text-white">
                    {flowAmount}/{total}
                  </span>
                </div>
              </div>
              <p class="text-[11px] text-gray-500 mt-2 leading-relaxed">
                {isSupply
                  ? 'Supply exports Metals to connected demand systems.'
                  : 'Demand pays more when unmet and less when satisfied.'}
              </p>
            </div>
          );
        })()}
      </Show>

      {/* System Ownership */}
      <div class="pb-6">
        <span class="text-[10px] text-gray-500 tracking-widest block mb-3">SYSTEM CONTROL</span>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <Shield
              size={18}
              class={
                props.system.owner === 'Player'
                  ? 'text-white'
                  : props.system.owner === 'Enemy'
                  ? 'text-red-400'
                  : 'text-gray-400'
              }
            />
            <span
              id="sidebar-owner-value"
              class={`text-sm tracking-wider ${
                props.system.owner === 'Player'
                  ? 'text-white'
                  : props.system.owner === 'Enemy'
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}
            >
              {props.system.owner.toUpperCase()}
            </span>
          </div>
          <Show when={props.system.owner === 'Player'}>
            <div class="text-[10px] bg-white/10 text-white px-2 py-1 rounded">SECURE</div>
          </Show>
        </div>
      </div>

      {/* Construction Queue */}
      <Show when={props.system.owner === 'Player' && props.system.constructionQueue?.length > 0}>
        <div class="pb-6">
          <span class="text-[10px] text-gray-500 tracking-widest block mb-3">CONSTRUCTION</span>
          <For each={props.system.constructionQueue}>
            {(item, index) => (
              <ConstructionQueueItem
                item={item}
                isActive={index() === 0}
                now={props.now}
              />
            )}
          </For>
        </div>
      </Show>

      {/* Docked Ships */}
      <Show when={props.system.owner === 'Player' && dockedShipsHere().length > 0}>
        <div class="pb-6">
          <span class="text-[10px] text-gray-500 tracking-widest block mb-3">DOCKED SHIPS</span>
          <div class="flex items-center justify-between p-3 bg-white/5 rounded">
            <div class="flex items-center gap-2">
              <Rocket size={16} class="text-white" />
              <span class="text-sm">{dockedShipsHere().length} Colony Ship(s)</span>
            </div>
            <button
              onClick={props.onLaunchShip}
              class="text-xs bg-green-500/20 hover:bg-green-500/30 px-3 py-1 rounded transition-colors"
            >
              LAUNCH
            </button>
          </div>
        </div>
      </Show>

      {/* Action Buttons - Player System */}
      <Show when={props.system.owner === 'Player'}>
        <div class="space-y-3 pt-4">
          <button
            id="sidebar-manage-buildings-btn"
            class="w-full bg-white text-black py-3 text-xs tracking-[0.2em] font-bold hover:bg-gray-200 transition-colors"
            onClick={props.onManageBuildings}
          >
            MANAGE BUILDINGS
          </button>
        </div>
      </Show>

      {/* Action Buttons - Unclaimed System */}
      <Show when={props.system.owner === 'Unclaimed'}>
        <div class="space-y-3 pt-4">
          {/* Scan Progress */}
          <Show
            when={scanState().isScanningThisSystem}
            fallback={
              <button
                id="sidebar-scan-btn"
                class="w-full bg-white/10 text-white py-3 text-xs tracking-[0.2em] font-bold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => props.gameState.scanSystem(props.system.id)}
                disabled={!scanState().canAffordScan || scanState().hasActiveScan}
              >
                {scanState().hasActiveScan
                  ? 'SCAN IN PROGRESS...'
                  : `SCAN SYSTEM (${scanState().scanInfo.cost} CR, ${scanState().scanInfo.durationSeconds}s)`}
              </button>
            }
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-gray-500 tracking-widest">SCANNING</span>
                <span class="text-[10px] text-gray-500">{scanState().remainingSeconds}s</span>
              </div>
              <ProgressBar progress={scanState().progress} variant="glass" />
              <button
                class="w-full bg-red-500/20 text-red-300 py-2 text-xs tracking-[0.2em] font-bold hover:bg-red-500/30 transition-colors"
                onClick={() => props.gameState.cancelScan()}
              >
                CANCEL SCAN
              </button>
            </div>
          </Show>
        </div>
      </Show>
    </>
  );
};
