import { Show, For, createMemo } from 'solid-js';
import { Shield, Rocket, Crosshair } from 'lucide-solid';
import { ProgressBar } from '../common/ProgressBar';
import { StatBlock } from '../common/StatBlock';
import { StatLabel } from '../common/StatLabel';
import { ConstructionQueueItem } from './ConstructionQueueItem';
import { getScanInfo, SCAN_COST } from '../../operations/scan';
import { BUILDINGS } from '../../utils/gameState/buildings';

/**
 * @typedef {Object} SystemOverviewPanelProps
 * @property {Object} system - The selected system
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
    const globalCredits = props.gameState.credits();

    if (isScanningThisSystem && scanning) {
      const elapsed = props.now - scanning.startTime;
      const progress = Math.min(100, (elapsed / scanning.duration) * 100);
      const remainingSeconds = Math.max(0, Math.ceil((scanning.duration - elapsed) / 1000));

      return {
        hasActiveScan: true,
        isScanningThisSystem: true,
        progress,
        remainingSeconds,
        canAffordScan: globalCredits >= SCAN_COST,
        scanInfo: null,
      };
    }

    return {
      hasActiveScan: Boolean(scanning),
      isScanningThisSystem: false,
      progress: 0,
      remainingSeconds: 0,
      canAffordScan: globalCredits >= SCAN_COST,
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
      <Show when={(() => {
        const isPlayerOwned = props.system.owner === 'Player';
        const oreMineLevel = props.system.buildings?.oreMine?.level || 0;
        const production = isPlayerOwned ? oreMineLevel * BUILDINGS.oreMine.supplyPerLevel : 0;
        const demand = props.system.market?.metals?.demand || 0;
        return production > 0 || demand > 0;
      })()}>
        {(() => {
          const isPlayerOwned = props.system.owner === 'Player';
          const oreMineLevel = props.system.buildings?.oreMine?.level || 0;
          const production = isPlayerOwned ? oreMineLevel * BUILDINGS.oreMine.supplyPerLevel : 0;
          const demand = props.system.market?.metals?.demand || 0;
          const satisfaction = props.tradeFlows?.systemSatisfaction?.get(props.system.id);

          // Local production satisfies local demand first
          const localConsumption = Math.min(production, demand);
          const surplus = production - localConsumption;
          const unmetDemand = demand - localConsumption;

          const hasSupply = production > 0;
          const hasDemand = demand > 0;
          const hasSurplus = surplus > 0;
          const hasUnmetDemand = unmetDemand > 0;

          // Calculate export/import stats
          const exported = satisfaction?.exported || 0;
          const imported = satisfaction?.satisfied || 0;
          const availableSurplus = surplus - exported;
          const totalSatisfied = localConsumption + imported;

          return (
            <StatBlock label="METALS MARKET">
              {/* Show Supply Section - only if there's surplus to export */}
              <Show when={hasSurplus}>
                <div class="flex items-center justify-between p-3 rounded-sm border-b border-white/10">
                  <StatLabel label="SUPPLY" value="EXPORT" />
                  <StatLabel
                    label="AVAILABLE"
                    value={`${Math.round(availableSurplus)}/${surplus}`}
                    large={true}
                    class="items-end text-right"
                  />
                </div>
              </Show>

              {/* Show Demand Section */}
              <Show when={hasDemand}>
                <div class="flex items-center justify-between p-3 rounded-sm">
                  <StatLabel label="DEMAND" value={hasUnmetDemand ? 'IMPORT' : 'LOCAL'} />
                  <StatLabel
                    label="SATISFIED"
                    value={`${Math.round(totalSatisfied)}/${demand}`}
                    large={true}
                    class="items-end text-right"
                  />
                </div>
              </Show>

              <p class="text-[11px] text-gray-500 mt-2 leading-relaxed">
                {hasSurplus && hasUnmetDemand
                  ? `Local production (${localConsumption}) meets partial demand. Surplus (${surplus}) exported, shortfall (${unmetDemand}) imported.`
                  : hasSurplus
                  ? `Surplus production exported to other systems.`
                  : hasUnmetDemand
                  ? `Imports needed to meet demand. Local production: ${localConsumption}.`
                  : hasDemand
                  ? `All demand satisfied by local production.`
                  : 'Supply exports Metals to connected systems.'}
              </p>
            </StatBlock>
          );
        })()}
      </Show>

      {/* System Ownership */}
      <StatBlock label="SYSTEM CONTROL">
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
      </StatBlock>

      {/* Construction Queue */}
      <Show when={props.system.owner === 'Player' && props.system.constructionQueue?.length > 0}>
        <StatBlock label="CONSTRUCTION">
          <For each={props.system.constructionQueue}>
            {(item, index) => (
              <ConstructionQueueItem
                item={item}
                isActive={index() === 0}
                now={props.now}
              />
            )}
          </For>
        </StatBlock>
      </Show>

      {/* Docked Ships */}
      <Show when={props.system.owner === 'Player' && dockedShipsHere().length > 0}>
        <StatBlock label="DOCKED SHIPS">
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
        </StatBlock>
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
