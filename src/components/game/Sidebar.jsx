import { createSignal, createEffect, Show, For } from 'solid-js';
import { X, Crosshair, Shield, Rocket, MapPin } from 'lucide-solid';
import { GlassPanel } from '../common/GlassPanel';
import { ProgressBar } from '../common/ProgressBar';
import { BuildingList } from './BuildingList';

/**
 * @typedef {Object} SidebarProps
 * @property {Object|null} system - The selected system
 * @property {Function} onClose - Callback to close the sidebar
 * @property {Object} gameState - The game state object
 */

/**
 * Sidebar component displaying system details and actions.
 *
 * @param {SidebarProps} props
 */
export const Sidebar = (props) => {
  const isOpen = () => !!props.system;
  const [view, setView] = createSignal('overview'); // 'overview' | 'buildings' | 'launch'

  // Reset view when system changes or closes
  createEffect(() => {
    if (!props.system) setView('overview');
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
        class={`fixed top-0 right-0 h-full z-50 transition-transform duration-500 ease-out transform ${isOpen() ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          width: view() === 'buildings' ? '75vw' : view() === 'launch' ? '500px' : '400px',
          "transition-property": "transform, width",
          "will-change": "transform, width",
        }}
      >
        {/* Header Image / Placeholder */}
        <div class="h-48 w-full bg-gradient-to-b from-white/10 to-transparent relative border-b border-white/10">
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
        </div>

        <Show when={props.system}>
          <div class="p-8 space-y-8 font-mono overflow-y-auto h-[calc(100%-12rem)]">

            <Show when={view() === 'overview'}>
              {/* Stats Grid */}
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-white/5 border border-white/10 rounded-sm">
                  <span class="text-[10px] text-gray-400 tracking-widest block mb-1">POPULATION</span>
                  <span id="sidebar-pop-value" class="text-xl text-white">{props.system.population}</span>
                </div>
                <div class="p-4 bg-white/5 border border-white/10 rounded-sm">
                  <span class="text-[10px] text-gray-400 tracking-widest block mb-1">RESOURCES</span>
                  <span
                    id="sidebar-res-value"
                    class={`text-xl ${props.system.resources === 'Rich' ? 'text-green-400' : props.system.resources === 'Poor' ? 'text-red-400' : 'text-gray-300'}`}
                  >
                    {props.system.resources.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Ownership */}
              <div class="pb-6 border-b border-white/10">
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
                <div class="pb-6 border-b border-white/10">
                  <span class="text-[10px] text-gray-500 tracking-widest block mb-3">CONSTRUCTION</span>
                  <For each={props.system.constructionQueue}>
                    {(item, index) => {
                      const elapsed = Date.now() - item.startTime;
                      const progress = Math.min(100, (elapsed / item.duration) * 100);
                      const remaining = Math.max(0, item.duration - elapsed) / 1000;
                      const isActive = index() === 0;

                      return (
                        <div class={`p-3 rounded mb-2 ${isActive ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-white/5 border border-white/10'}`}>
                          <div class="flex items-center justify-between mb-1">
                            <span class="text-xs capitalize">
                              {item.target === 'colonyShip' ? 'Colony Ship' : item.target.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span class="text-[10px] text-gray-500">
                              {isActive ? `${Math.floor(remaining)}s` : 'Queued'}
                            </span>
                          </div>
                          <Show when={isActive}>
                            <ProgressBar progress={progress} color="bg-blue-400" />
                          </Show>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>

              {/* Docked Ships */}
              <Show when={props.system.owner === 'Player' && dockedShipsHere().length > 0}>
                <div class="pb-6 border-b border-white/10">
                  <span class="text-[10px] text-gray-500 tracking-widest block mb-3">DOCKED SHIPS</span>
                  <div class="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <div class="flex items-center gap-2">
                      <Rocket size={16} class="text-green-400" />
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

              {/* Description */}
              <div>
                <span class="text-[10px] text-gray-500 tracking-widest block mb-3">DATA LOG</span>
                <p id="sidebar-desc-text" class="text-sm text-gray-300 leading-relaxed">
                  {props.system.description}
                </p>
              </div>

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
                <div class="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <p class="text-xs text-yellow-300">
                    This system is unclaimed. Send a Colony Ship to colonize it.
                  </p>
                </div>
              </Show>
            </Show>

            <Show when={view() === 'buildings'}>
              <BuildingList system={props.system} gameState={props.gameState} />
            </Show>

            <Show when={view() === 'launch'}>
              <div class="space-y-4">
                <div class="text-center mb-6">
                  <Rocket size={32} class="mx-auto text-green-400 mb-2" />
                  <h3 class="text-lg tracking-widest">SELECT DESTINATION</h3>
                  <p class="text-xs text-gray-500 mt-1">Choose an unclaimed system to colonize</p>
                </div>

                <Show when={reachableSystems().length === 0}>
                  <div class="text-center py-8 text-gray-500">
                    <MapPin size={24} class="mx-auto mb-2 opacity-50" />
                    <p class="text-sm">No reachable unclaimed systems</p>
                  </div>
                </Show>

                <For each={reachableSystems()}>
                  {({ system: dest, hops }) => (
                    <button
                      onClick={() => handleLaunchShip(dest.id)}
                      class="w-full p-4 border border-white/20 hover:border-green-500/50 hover:bg-green-500/10 rounded transition-all text-left"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-sm font-medium">{dest.name}</span>
                          <div class="flex items-center gap-3 mt-1">
                            <span class={`text-[10px] ${dest.resources === 'Rich' ? 'text-green-400' : dest.resources === 'Poor' ? 'text-red-400' : 'text-gray-400'}`}>
                              {dest.resources}
                            </span>
                          </div>
                        </div>
                        <div class="text-right">
                          <span class="text-xs text-blue-400">{hops} hops</span>
                          <div class="text-[10px] text-gray-500">{hops * 60}s travel</div>
                        </div>
                      </div>
                    </button>
                  )}
                </For>
              </div>
            </Show>

          </div>
        </Show>
      </GlassPanel>
    </>
  );
};
