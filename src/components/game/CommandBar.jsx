import { createSignal, Show, For } from 'solid-js';
import { Database, Navigation, Beaker, Lock, Check } from 'lucide-solid';
import { GlassPanel } from '../common/GlassPanel';
import { Modal } from '../common/Modal';
import { ProgressBar } from '../common/ProgressBar';
import { TECH_TREE } from '../../utils/gameState';
import { formatTime } from '../../utils/format';

/**
 * @typedef {Object} CommandBarProps
 * @property {Object} gameState - The game state object with all signals and actions
 */

/**
 * Command bar component for high-level game actions.
 *
 * @param {CommandBarProps} props
 */
export const CommandBar = (props) => {
  const [showTechModal, setShowTechModal] = createSignal(false);
  const [showFleetModal, setShowFleetModal] = createSignal(false);

  const techList = Object.values(TECH_TREE);

  const canResearch = (tech) => {
    const currentTech = props.gameState.tech();
    if (currentTech.current) return false;
    if (currentTech.researched.includes(tech.id)) return false;
    if (props.gameState.resources().credits < tech.cost) return false;
    return tech.requires.every(req => currentTech.researched.includes(req));
  };

  const isResearched = (tech) => props.gameState.tech().researched.includes(tech.id);
  const isResearching = (tech) => props.gameState.tech().current?.id === tech.id;

  const handleResearch = (techId) => {
    props.gameState.startResearch(techId);
  };

  const ships = () => props.gameState.ships();
  const dockedShips = () => ships().filter(s => s.status === 'docked');
  const transitShips = () => ships().filter(s => s.status === 'transit');

  const getResearchProgress = (tech) => {
    const current = props.gameState.tech().current;
    if (!current) return 0;
    return Math.min(100, ((Date.now() - current.startTime) / tech.researchTime) * 100);
  };

  const getResearchRemaining = (tech) => {
    const current = props.gameState.tech().current;
    if (!current) return tech.researchTime;
    return Math.max(0, tech.researchTime - (Date.now() - current.startTime));
  };

  return (
    <>
      <GlassPanel
        id="command-bar"
        class="absolute bottom-10 left-1/2 -translate-x-1/2 w-[400px] h-[70px] flex items-center justify-center px-8 slide-in-bottom pointer-events-auto z-40"
      >
        <div class="flex items-center space-x-8">
          <button
            id="cmd-tech-btn"
            onClick={() => setShowTechModal(true)}
            class="flex flex-col items-center group"
          >
            <div class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-blue-300/50 group-hover:bg-blue-500/10 transition-all">
              <Database size={18} class="text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <span class="text-[9px] tracking-widest text-gray-500 group-hover:text-gray-300 mt-1">TECH</span>
          </button>

          <div class="h-8 w-px bg-white/10" />

          <button
            id="cmd-fleet-btn"
            onClick={() => setShowFleetModal(true)}
            class="flex flex-col items-center group relative"
          >
            <div class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-blue-300/50 group-hover:bg-blue-500/10 transition-all">
              <Navigation size={18} class="text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <span class="text-[9px] tracking-widest text-gray-500 group-hover:text-gray-300 mt-1">FLEET</span>
            <Show when={ships().length > 0}>
              <div class="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span class="text-[8px] text-white font-bold">{ships().length}</span>
              </div>
            </Show>
          </button>
        </div>
      </GlassPanel>

      {/* Tech Modal */}
      <Modal
        open={showTechModal()}
        onClose={() => setShowTechModal(false)}
        title="TECHNOLOGY"
        icon={<Beaker size={20} class="text-blue-400" />}
        width="600px"
      >
        <For each={techList}>
          {(tech) => (
            <div
              class={`p-4 border rounded transition-all ${
                isResearched(tech)
                  ? 'border-green-500/30 bg-green-500/5'
                  : isResearching(tech)
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : canResearch(tech)
                  ? 'border-white/20 hover:border-white/40 cursor-pointer hover:bg-white/5'
                  : 'border-white/10 opacity-50'
              }`}
              onClick={() => canResearch(tech) && handleResearch(tech.id)}
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <Show when={isResearched(tech)}>
                      <Check size={14} class="text-green-400" />
                    </Show>
                    <Show when={!isResearched(tech) && !canResearch(tech) && !isResearching(tech)}>
                      <Lock size={14} class="text-gray-500" />
                    </Show>
                    <span class="text-sm font-medium">{tech.name}</span>
                  </div>
                  <p class="text-xs text-gray-400">{tech.description}</p>
                  <Show when={tech.requires.length > 0}>
                    <p class="text-[10px] text-gray-600 mt-1">
                      Requires: {tech.requires.map(r => TECH_TREE[r]?.name).join(', ')}
                    </p>
                  </Show>
                </div>
                <div class="text-right">
                  <Show when={!isResearched(tech)}>
                    <div class="text-xs text-yellow-400">{tech.cost} CR</div>
                    <div class="text-[10px] text-gray-500">{formatTime(tech.researchTime)}</div>
                  </Show>
                  <Show when={isResearched(tech)}>
                    <div class="text-xs text-green-400">COMPLETE</div>
                  </Show>
                </div>
              </div>
              <Show when={isResearching(tech)}>
                <div class="mt-3">
                  <div class="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Researching...</span>
                    <span>{formatTime(getResearchRemaining(tech))}</span>
                  </div>
                  <ProgressBar progress={getResearchProgress(tech)} color="bg-blue-400" />
                </div>
              </Show>
            </div>
          )}
        </For>
      </Modal>

      {/* Fleet Modal */}
      <Modal
        open={showFleetModal()}
        onClose={() => setShowFleetModal(false)}
        title="FLEET STATUS"
        icon={<Navigation size={20} class="text-blue-400" />}
      >
        <Show when={ships().length === 0}>
          <div class="text-center text-gray-500 py-8">
            <Navigation size={32} class="mx-auto mb-3 opacity-30" />
            <p class="text-sm">No ships constructed yet.</p>
            <p class="text-xs mt-1">Build a Shipyard and construct Colony Ships to expand your empire.</p>
          </div>
        </Show>

        <Show when={dockedShips().length > 0}>
          <div>
            <h3 class="text-xs text-gray-500 tracking-widest mb-3">DOCKED ({dockedShips().length})</h3>
            <For each={dockedShips()}>
              {(ship) => {
                const system = props.gameState.galaxyData().systems.find(s => s.id === ship.systemId);
                return (
                  <div class="p-3 border border-white/10 rounded mb-2 flex items-center justify-between">
                    <div>
                      <span class="text-sm">Colony Ship</span>
                      <span class="text-xs text-gray-500 ml-2">@ {system?.name}</span>
                    </div>
                    <span class="text-[10px] text-green-400">READY</span>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>

        <Show when={transitShips().length > 0}>
          <div>
            <h3 class="text-xs text-gray-500 tracking-widest mb-3">IN TRANSIT ({transitShips().length})</h3>
            <For each={transitShips()}>
              {(ship) => {
                const dest = props.gameState.galaxyData().systems.find(s => s.id === ship.destinationId);
                const progress = ship.route?.length > 0
                  ? ((ship.currentSegment + ship.segmentProgress) / ship.route.length) * 100
                  : 0;
                return (
                  <div class="p-3 border border-blue-500/30 bg-blue-500/5 rounded mb-2">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm">Colony Ship</span>
                      <span class="text-xs text-blue-400">TO: {dest?.name}</span>
                    </div>
                    <ProgressBar progress={progress} color="bg-blue-400" />
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </Modal>
    </>
  );
};
