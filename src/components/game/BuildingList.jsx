import { Show, For, createSignal, onCleanup } from 'solid-js';
import { Pickaxe, Zap, Coins, Rocket, Factory } from 'lucide-solid';
import { BUILDINGS, COLONY_SHIP, getBuildingCost } from '../../utils/gameState';
import { formatTime } from '../../utils/format';
import { ProgressBar } from '../common/ProgressBar';
import './BuildingList.css';

/**
 * @typedef {Object} BuildingListProps
 * @property {Object} system - The system data where buildings are managed
 * @property {Object} gameState - The game state object with signals and actions
 */

/**
 * Get icon for building type
 */
const BuildingIcon = ({ buildingId, size = 18 }) => {
  switch (buildingId) {
    case 'oreMine':
      return <Pickaxe size={size} class="text-amber-400" />;
    case 'solarPlant':
      return <Zap size={size} class="text-yellow-300" />;
    case 'tradeHub':
      return <Coins size={size} class="text-emerald-400" />;
    case 'shipyard':
      return <Rocket size={size} class="text-blue-400" />;
    default:
      return <Factory size={size} class="text-gray-400" />;
  }
};

/**
 * Component for managing buildings in a system.
 *
 * @param {BuildingListProps} props
 */
export function BuildingList(props) {
  const resources = () => props.gameState.resources();
  const energyState = () => props.gameState.energyState();
  const buildings = () => props.system?.buildings || {};
  const constructionQueue = () => props.system?.constructionQueue || [];

  // Timer for updating progress bars
  const [now, setNow] = createSignal(Date.now());
  const timer = setInterval(() => setNow(Date.now()), 100);
  onCleanup(() => clearInterval(timer));

  // Check if we can afford a cost (energy is capacity-based, not spent)
  const canAfford = (cost) => {
    const res = resources();
    return res.ore >= cost.ore && res.credits >= cost.credits;
  };

  // Check if building is actively being built (first in queue)
  const isActivelyBuilding = (buildingId) => {
    const queue = constructionQueue();
    return queue.length > 0 && queue[0].type === 'building' && queue[0].target === buildingId;
  };

  // Check if building is queued (in queue but not first)
  const isQueued = (buildingId) => {
    const queue = constructionQueue();
    return queue.slice(1).some(item => item.type === 'building' && item.target === buildingId);
  };

  // Check if building is in queue at all (for disabling build button)
  const isInQueue = (buildingId) => {
    return constructionQueue().some(item => item.type === 'building' && item.target === buildingId);
  };

  // Get construction queue item for a building (only if it's the active one)
  const getActiveBuildingQueueItem = (buildingId) => {
    const queue = constructionQueue();
    if (queue.length > 0 && queue[0].type === 'building' && queue[0].target === buildingId) {
      return queue[0];
    }
    return null;
  };

  // Get building level
  const getLevel = (buildingId) => buildings()[buildingId]?.level || 0;

  // Handle building construction
  const handleBuild = (buildingId) => {
    props.gameState.startConstruction(props.system.id, 'building', buildingId);
  };

  // Handle ship construction
  const handleBuildShip = () => {
    props.gameState.startConstruction(props.system.id, 'ship', 'colonyShip');
  };

  // Check if ship is actively being built (first in queue)
  const isActivelyBuildingShip = () => {
    const queue = constructionQueue();
    return queue.length > 0 && queue[0].type === 'ship' && queue[0].target === 'colonyShip';
  };

  // Check if ship is queued (in queue but not first)
  const isShipQueued = () => {
    const queue = constructionQueue();
    return queue.slice(1).some(item => item.type === 'ship' && item.target === 'colonyShip');
  };

  // Check if ship is in queue at all
  const isShipInQueue = () => {
    return constructionQueue().some(item => item.type === 'ship' && item.target === 'colonyShip');
  };

  // Get ship construction queue item (only if active)
  const getActiveShipQueueItem = () => {
    const queue = constructionQueue();
    if (queue.length > 0 && queue[0].type === 'ship' && queue[0].target === 'colonyShip') {
      return queue[0];
    }
    return null;
  };

  // Can build ships (requires shipyard)
  const canBuildShips = () => getLevel('shipyard') > 0;

  // Get ship cost with shipyard discount
  const getShipBuildTime = () => {
    const shipyardLevel = getLevel('shipyard');
    return COLONY_SHIP.buildTime * Math.pow(0.9, shipyardLevel);
  };

  const buildingList = Object.values(BUILDINGS);

  return (
    <div id="building-list-container" class="building-list-container">
      {/* Resource Header */}
      <div class="resource-bar glass-panel-inset">
        <div class="resource-item">
          <Pickaxe size={12} class="text-amber-400" />
          <span class="res-label">ORE</span>
          <span id="res-ore-value" class="res-value">{Math.floor(resources().ore)}</span>
        </div>
        <div class="resource-item">
          <Zap size={12} class="text-yellow-300" />
          <span class="res-label">ENERGY</span>
          <span id="res-energy-value" class={`res-value ${
            energyState().usage > energyState().capacity ? 'text-red-400' : ''
          }`}>{energyState().capacity - energyState().usage}/{energyState().capacity}</span>
        </div>
        <div class="resource-item">
          <Coins size={12} class="text-emerald-400" />
          <span class="res-label">CREDITS</span>
          <span id="res-credits-value" class="res-value">{Math.floor(resources().credits)}</span>
        </div>
      </div>

      {/* Buildings Grid */}
      <div class="building-grid">
        <For each={buildingList}>
          {(building) => {
            const level = () => getLevel(building.id);
            const cost = () => getBuildingCost(building.id, level());
            const affordable = () => canAfford(cost());
            const activelyBuilding = () => isActivelyBuilding(building.id);
            const queued = () => isQueued(building.id);
            const inQueue = () => isInQueue(building.id);

            // Calculate production/effect for this building (per level)
            const production = () => {
              if (building.production.ore > 0) return `+${building.production.ore.toFixed(1)} ORE/s`;
              if (building.production.credits > 0) return `+${building.production.credits.toFixed(1)} CREDITS/s`;
              if (building.energyCapacity) return `+${building.energyCapacity} CAPACITY`;
              if (building.id === 'shipyard') return `-10% SHIP BUILD TIME`;
              return '';
            };

            // Calculate energy usage for this building (per level)
            const energyUsage = () => {
              if (building.energyUsage > 0) {
                return `${building.energyUsage} ENERGY`;
              }
              return '';
            };

            return (
              <div
                id={`building-row-${building.id}`}
                class={`building-row glass-panel-row ${activelyBuilding() ? 'building-in-progress' : ''} ${queued() ? 'building-queued' : ''}`}
              >
                <div class="building-icon">
                  <div class="icon-placeholder">
                    <BuildingIcon buildingId={building.id} size={24} />
                  </div>
                </div>
                <div class="building-info">
                  <div class="building-header">
                    <span class="building-name">{building.name}</span>
                    <span class="building-level">Lvl {level()}</span>
                  </div>
                  <div class="building-desc">{building.description}</div>
                  <Show when={level() > 0 || production()}>
                    <div class="building-production text-green-400/80">{production()}</div>
                  </Show>
                  <Show when={energyUsage()}>
                    <div class="building-production text-yellow-400/80">Uses {energyUsage()}</div>
                  </Show>
                  <div class="building-cost">
                    <Show when={cost().ore > 0}>
                      <span class={resources().ore >= cost().ore ? 'cost-ok' : 'cost-err'}>
                        {cost().ore} Ore
                      </span>
                    </Show>
                    <Show when={cost().credits > 0}>
                      <span class={resources().credits >= cost().credits ? 'cost-ok' : 'cost-err'}>
                        {cost().credits} Cr
                      </span>
                    </Show>
                  </div>
                </div>
                <div class="building-action">
                  <Show when={activelyBuilding()}>
                    {(() => {
                      const queueItem = () => getActiveBuildingQueueItem(building.id);
                      const elapsed = () => queueItem() ? now() - queueItem().startTime : 0;
                      const progress = () => queueItem() ? Math.min(100, (elapsed() / queueItem().duration) * 100) : 0;
                      const remaining = () => queueItem() ? Math.max(0, queueItem().duration - elapsed()) / 1000 : 0;
                      return (
                        <ProgressBar
                          progress={progress()}
                          variant="glass"
                          label={`${Math.floor(remaining())}s`}
                        />
                      );
                    })()}
                  </Show>
                  <Show when={queued()}>
                    <span class="queued-label">Queued</span>
                  </Show>
                  <Show when={!inQueue()}>
                    <button
                      id={`build-btn-${building.id}`}
                      class="build-btn glass-button"
                      onClick={() => handleBuild(building.id)}
                      disabled={!affordable()}
                    >
                      {level() === 0 ? 'Build' : 'Upgrade'}
                    </button>
                    <span class="cost-time">{formatTime(building.buildTime)}</span>
                  </Show>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      {/* Ship Construction Section */}
      <Show when={canBuildShips()}>
        <div class="mt-6 pt-6 border-t border-white/10">
          <h3 class="text-xs text-gray-500 tracking-widest mb-4">SHIP CONSTRUCTION</h3>

          <div class={`building-row glass-panel-row ${isActivelyBuildingShip() ? 'building-in-progress' : ''} ${isShipQueued() ? 'building-queued' : ''}`}>
            <div class="building-icon">
              <div class="icon-placeholder">
                <Rocket size={24} class="text-blue-400" />
              </div>
            </div>
            <div class="building-info">
              <div class="building-header">
                <span class="building-name">Colony Ship</span>
              </div>
              <div class="building-desc">Colonizes unclaimed star systems.</div>
              <div class="building-cost">
                <span class={resources().ore >= COLONY_SHIP.cost.ore ? 'cost-ok' : 'cost-err'}>
                  {COLONY_SHIP.cost.ore} Ore
                </span>
                <span class={resources().credits >= COLONY_SHIP.cost.credits ? 'cost-ok' : 'cost-err'}>
                  {COLONY_SHIP.cost.credits} Cr
                </span>
              </div>
              <div class="building-production text-yellow-400/80">Uses {COLONY_SHIP.energyUsage} ENERGY when docked</div>
            </div>
            <div class="building-action">
              <Show when={isActivelyBuildingShip()}>
                {(() => {
                  const queueItem = () => getActiveShipQueueItem();
                  const elapsed = () => queueItem() ? now() - queueItem().startTime : 0;
                  const progress = () => queueItem() ? Math.min(100, (elapsed() / queueItem().duration) * 100) : 0;
                  const remaining = () => queueItem() ? Math.max(0, queueItem().duration - elapsed()) / 1000 : 0;
                  return (
                    <div class="w-full">
                      <div class="text-[10px] text-gray-500 text-center mb-1">
                        {Math.floor(remaining())}s
                      </div>
                      <ProgressBar progress={progress()} color="#60a5fa" height={4} />
                    </div>
                  );
                })()}
              </Show>
              <Show when={isShipQueued()}>
                <span class="queued-label">Queued</span>
              </Show>
              <Show when={!isShipInQueue()}>
                <button
                  class="build-btn glass-button"
                  onClick={handleBuildShip}
                  disabled={!canAfford(COLONY_SHIP.cost)}
                >
                  Build
                </button>
                <span class="cost-time">{formatTime(getShipBuildTime())}</span>
              </Show>
            </div>
          </div>
        </div>
      </Show>

      <Show when={!canBuildShips()}>
        <div class="mt-6 pt-6 border-t border-white/10">
          <div class="p-4 bg-white/5 border border-white/10 rounded text-center">
            <Rocket size={24} class="mx-auto text-gray-600 mb-2" />
            <p class="text-xs text-gray-500">Build a Shipyard to construct Colony Ships</p>
          </div>
        </div>
      </Show>
    </div>
  );
}
