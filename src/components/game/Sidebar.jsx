import { createSignal, createEffect, onCleanup, Show, For } from 'solid-js';
import { X, Crosshair, Shield, Rocket, Link } from 'lucide-solid';
import { GlassPanel } from '../common/GlassPanel';
import { ProgressBar } from '../common/ProgressBar';
import { BuildingList } from './BuildingList';
import { SystemStatsGrid } from './SystemStatsGrid';
import { ConstructionQueueItem } from './ConstructionQueueItem';
import { DestinationSelector } from './DestinationSelector';
import { getScanInfo, SCAN_COST } from '../../operations/scan';

/**
 * @typedef {Object} SidebarProps
 * @property {Object|null} system - The selected system
 * @property {Object|null} tether - The selected tether { id, source, target, distance }
 * @property {Function} onClose - Callback to close the sidebar
 * @property {Object} gameState - The game state object
 * @property {Object} tradeFlows - Trade flow data { systemSatisfaction, routeThroughput }
 */

/**
 * Sidebar component displaying system details and actions.
 *
 * @param {SidebarProps} props
 */
export const Sidebar = (props) => {
  const isOpen = () => !!props.system || !!props.tether;
  const [view, setView] = createSignal('overview'); // 'overview' | 'buildings' | 'launch'
  const [now, setNow] = createSignal(Date.now());

  // Timer for updating progress bars
  const timer = setInterval(() => setNow(Date.now()), 100);
  onCleanup(() => clearInterval(timer));

  // Reset view when system/tether changes or closes
  createEffect(() => {
    if (!props.system && !props.tether) setView('overview');
  });

  // Get docked ships at this system
  const dockedShipsHere = () => {
    if (!props.system) return [];
    return props.gameState.ships().filter(
      s => s.status === 'docked' && s.systemId === props.system.id
    );
  };

  // Get reachable unclaimed systems for colonization
  const reachableSystems = () => {
    if (!props.system || dockedShipsHere().length === 0) return [];

    const galaxy = props.gameState.galaxyData();
    const unclaimed = galaxy.systems.filter(s => s.owner === 'Unclaimed');

    return unclaimed
      .map(s => {
        const path = props.gameState.findPath(galaxy, props.system.id, s.id);
        return path ? { system: s, hops: path.length } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.hops - b.hops)
      .slice(0, 10); // Show top 10 closest
  };

  const handleLaunchShip = (destinationId) => {
    const ship = dockedShipsHere()[0];
    if (ship) {
      props.gameState.launchColonyShip(ship.id, destinationId);
      setView('overview');
    }
  };

  return (
    <>
      <Show when={isOpen() && (view() === 'buildings' || view() === 'launch')}>
        <div
          class="fixed inset-0 transition-opacity duration-300 ease-out opacity-100 pointer-events-auto"
          style={{ "z-index": 49, background: "rgba(0, 0, 0, 0.35)" }}
          onClick={() => setView('overview')}
        />
      </Show>
      <GlassPanel
        id="sidebar-panel"
        class={`fixed top-0 right-0 h-full z-50 transition-transform duration-500 ease-out transform ${isOpen() ? 'translate-x-0' : 'translate-x-full'} ${view() === 'buildings' ? 'sidebar-buildings' : view() === 'launch' ? 'sidebar-launch' : 'sidebar-overview'}`}
        style={{
          "transition-property": "transform, width",
          "will-change": "transform, width",
        }}
      >
        {/* Header Image / Placeholder */}
        <div class="h-48 w-full bg-gradient-to-b from-white/10 to-transparent relative">
          <div class="absolute top-4 right-4 z-10">
            <button
              id="sidebar-close-btn"
              onClick={() => (view() !== 'overview' ? setView('overview') : props.onClose())}
              class="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} class="text-white" />
            </button>
          </div>
          <Show when={props.system}>
            <div class="absolute bottom-6 left-6">
              <div class="flex items-center space-x-2 text-blue-300 mb-1">
                <Crosshair size={14} />
                <span class="text-[10px] tracking-widest">SELECTED SYSTEM</span>
              </div>
              <h2 id="sidebar-system-name" class="text-3xl font-light text-white tracking-widest font-mono">
                {props.system.name}
              </h2>
              <Show when={view() !== 'overview'}>
                <button
                  id="sidebar-back-btn"
                  onClick={() => setView('overview')}
                  class="mt-2 text-[10px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  &larr; BACK TO OVERVIEW
                </button>
              </Show>
            </div>
          </Show>
          <Show when={props.tether}>
            <div class="absolute bottom-6 left-6">
              <div class="flex items-center space-x-2 text-blue-300 mb-1">
                <Link size={14} />
                <span class="text-[10px] tracking-widest">FTL ROUTE</span>
              </div>
              <h2 class="text-2xl font-light text-white tracking-widest font-mono">
                {props.tether.source.name} → {props.tether.target.name}
              </h2>
            </div>
          </Show>
        </div>

        <Show when={props.system}>
          <div class="p-8 space-y-8 font-mono overflow-y-auto h-[calc(100%-12rem)]">

            <Show when={view() === 'overview'}>
              {/* Stats Grid - Hidden for now
              <SystemStatsGrid
                population={props.system.population}
                resources={props.system.resources}
              />
              */}

              {/* Market */}
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

              {/* Ownership */}
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

              {/* Construction Queue Status */}
              <Show when={props.system.owner === 'Player' && props.system.constructionQueue?.length > 0}>
                <div class="pb-6">
                  <span class="text-[10px] text-gray-500 tracking-widest block mb-3">CONSTRUCTION</span>
                  <For each={props.system.constructionQueue}>
                    {(item, index) => (
                      <ConstructionQueueItem
                        item={item}
                        isActive={index() === 0}
                        now={now()}
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
                      onClick={() => setView('launch')}
                      class="text-xs bg-green-500/20 hover:bg-green-500/30 px-3 py-1 rounded transition-colors"
                    >
                      LAUNCH
                    </button>
                  </div>
                </div>
              </Show>

              {/* Description - Hidden for now
              <div>
                <span class="text-[10px] text-gray-500 tracking-widest block mb-3">DATA LOG</span>
                <p id="sidebar-desc-text" class="text-sm text-gray-300 leading-relaxed">
                  {props.system.description}
                </p>
              </div>
              */}

              {/* Actions */}
              <Show when={props.system.owner === 'Player'}>
                <div class="space-y-3 pt-4">
                  <button
                    id="sidebar-manage-buildings-btn"
                    class="w-full bg-white text-black py-3 text-xs tracking-[0.2em] font-bold hover:bg-gray-200 transition-colors"
                    onClick={() => setView('buildings')}
                  >
                    MANAGE BUILDINGS
                  </button>
                </div>
              </Show>

              <Show when={props.system.owner === 'Unclaimed'}>
                <div class="space-y-3 pt-4">
                  {/* Show scan progress if scanning this system */}
                  <Show when={props.gameState.scanningSystem()?.systemId === props.system.id}>
                    {(() => {
                      const scan = props.gameState.scanningSystem();
                      const elapsed = now() - scan.startTime;
                      const progress = Math.min(100, (elapsed / scan.duration) * 100);
                      const remaining = Math.max(0, Math.ceil((scan.duration - elapsed) / 1000));
                      return (
                        <div class="space-y-2">
                          <div class="flex items-center justify-between">
                            <span class="text-[10px] text-gray-500 tracking-widest">SCANNING</span>
                            <span class="text-[10px] text-gray-500">{remaining}s</span>
                          </div>
                          <ProgressBar progress={progress} variant="glass" />
                          <button
                            class="w-full bg-red-500/20 text-red-300 py-2 text-xs tracking-[0.2em] font-bold hover:bg-red-500/30 transition-colors"
                            onClick={() => props.gameState.cancelScan()}
                          >
                            CANCEL SCAN
                          </button>
                        </div>
                      );
                    })()}
                  </Show>
                  {/* Show scan button if not scanning this system */}
                  <Show when={props.gameState.scanningSystem()?.systemId !== props.system.id}>
                    {(() => {
                      const scanInfo = getScanInfo(
                        props.gameState.galaxyData(),
                        props.gameState.homeSystemId(),
                        props.system.id,
                        props.gameState.findPath
                      );
                      return (
                        <button
                          id="sidebar-scan-btn"
                          class="w-full bg-white/10 text-white py-3 text-xs tracking-[0.2em] font-bold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => props.gameState.scanSystem(props.system.id)}
                          disabled={props.gameState.resources().credits < SCAN_COST || props.gameState.scanningSystem()}
                        >
                          {props.gameState.scanningSystem()
                            ? 'SCAN IN PROGRESS...'
                            : `SCAN SYSTEM (${scanInfo.cost} CR, ${scanInfo.durationSeconds}s)`}
                        </button>
                      );
                    })()}
                  </Show>
                </div>
              </Show>
            </Show>

            <Show when={view() === 'buildings'}>
              <BuildingList system={props.system} gameState={props.gameState} />
            </Show>

            <Show when={view() === 'launch'}>
              <DestinationSelector
                destinations={reachableSystems()}
                onSelect={handleLaunchShip}
              />
            </Show>

          </div>
        </Show>

        {/* Tether Info Display */}
        <Show when={props.tether}>
          <div class="p-8 space-y-8 font-mono overflow-y-auto h-[calc(100%-12rem)]">
            {/* Tether Stats */}
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
          </div>
        </Show>
      </GlassPanel>
    </>
  );
};
