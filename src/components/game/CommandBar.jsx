import { createSignal, Show, For, onCleanup, createMemo } from 'solid-js';
import { Database, Navigation, RotateCcw } from 'lucide-solid';
import { GlassPanel } from '../common/GlassPanel';
import { Modal } from '../common/Modal';
import { TECH_TREE } from '../../utils/gameState';
import { TechListItem } from './TechListItem';
import { DockedShipCard } from './DockedShipCard';
import { TransitShipCard } from './TransitShipCard';

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
  const [now, setNow] = createSignal(Date.now());

  const timer = setInterval(() => setNow(Date.now()), 250);
  onCleanup(() => clearInterval(timer));

  const techList = Object.values(TECH_TREE);

  const handleNewGame = (e) => {
    e.stopPropagation();
    if (confirm('Start a new game? Current progress will be lost.')) {
      props.gameState.newGame();
    }
  };

  const hasPrerequisites = (tech) => {
    const currentTech = props.gameState.tech();
    return tech.requires.every(req => currentTech.researched.includes(req));
  };

  const canResearch = (tech) => {
    const currentTech = props.gameState.tech();
    if (currentTech.current) return false;
    if (currentTech.researched.includes(tech.id)) return false;
    if (props.gameState.resources().credits < tech.cost) return false;
    return hasPrerequisites(tech);
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
    const elapsed = now() - current.startTime;
    return Math.min(100, (elapsed / tech.researchTime) * 100);
  };

  // Create a memo for each tech that reads directly from the reactive tech signal
  const getResearchRemaining = (tech) => {
    return createMemo(() => {
      const current = props.gameState.tech().current;
      if (!current || current.id !== tech.id) return tech.researchTime;
      return current.remainingTime || tech.researchTime;
    });
  };

  return (
    <>
      <GlassPanel
        id="command-bar"
        class="absolute bottom-10 left-6 w-auto h-[70px] flex items-center justify-center px-8 slide-in-bottom pointer-events-auto z-40"
      >
        <div class="flex items-center space-x-8">
          <button
            id="cmd-new-game-btn"
            onClick={handleNewGame}
            class="flex flex-col items-center group"
            style="display: flex; flex-direction: column; align-items: center;"
          >
            <div class="w-10 h-10 flex items-center justify-center group-hover:bg-red-500/10 transition-all"
              style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
              <RotateCcw size={18} class="text-gray-400 group-hover:text-red-300 transition-colors" />
            </div>
            <span class="text-[9px] tracking-widest text-gray-500 group-hover:text-red-300 mt-1" style="text-align: center;">RESET</span>
          </button>

          <div class="h-8 w-px bg-white/10" />

          <button
            id="cmd-tech-btn"
            onClick={() => setShowTechModal(true)}
            class="flex flex-col items-center group"
            style="display: flex; flex-direction: column; align-items: center;"
          >
            <div class="w-10 h-10 flex items-center justify-center group-hover:bg-blue-500/10 transition-all"
              style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
              <Database size={18} class="text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <span class="text-[9px] tracking-widest text-gray-500 group-hover:text-gray-300 mt-1" style="text-align: center;">TECH</span>
          </button>

          <div class="h-8 w-px bg-white/10" />

          <button
            id="cmd-fleet-btn"
            onClick={() => setShowFleetModal(true)}
            class="flex flex-col items-center group relative"
            style="display: flex; flex-direction: column; align-items: center;"
          >
            <div class="w-10 h-10 flex items-center justify-center group-hover:bg-blue-500/10 transition-all"
              style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
              <Navigation size={18} class="text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <span class="text-[9px] tracking-widest text-gray-500 group-hover:text-gray-300 mt-1" style="text-align: center;">FLEET</span>
          </button>
        </div>
      </GlassPanel>

      {/* Tech Modal */}
      <Modal
        open={showTechModal()}
        onClose={() => setShowTechModal(false)}
        title="TECHNOLOGY"
        width="600px"
      >
        <For each={techList}>
          {(tech) => (
            <TechListItem
              tech={tech}
              isResearched={isResearched(tech)}
              isResearching={isResearching(tech)}
              canResearch={canResearch(tech)}
              hasPrerequisites={hasPrerequisites(tech)}
              progress={getResearchProgress(tech)}
              remainingTime={getResearchRemaining(tech)}
              onResearch={handleResearch}
            />
          )}
        </For>
      </Modal>

      {/* Fleet Modal */}
      <Modal
        open={showFleetModal()}
        onClose={() => setShowFleetModal(false)}
        title="FLEET STATUS"
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
                return <DockedShipCard ship={ship} systemName={system?.name} />;
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
                return <TransitShipCard ship={ship} destinationName={dest?.name} />;
              }}
            </For>
          </div>
        </Show>
      </Modal>
    </>
  );
};
