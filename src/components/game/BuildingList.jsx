import { Show, For, createSignal, onCleanup } from 'solid-js';
import { Rocket } from 'lucide-solid';
import { StatBlock } from '../common/StatBlock';
import { BUILDINGS, COLONY_SHIP, getBuildingCost } from '../../utils/gameState';
import { formatTime } from '../../utils/format';
import { ProgressBar } from '../common/ProgressBar';
import { GlassCard } from '../common/GlassCard';
import { MiniPanel } from '../common/MiniPanel';
import { BuildingConstruct } from '../common/BuildingConstruct';
import { ResourceIcon } from '../common/ResourceIcon';
import './BuildingList.css';

/**
 * Map building IDs to BuildingConstruct types
 */
const BUILDING_CONSTRUCT_MAP = {
  oreMine: 'borehole',
  solarPlant: 'solar-array',
  tradeHub: 'vault',
  shipyard: 'hangar',
};

/**
 * @typedef {Object} BuildingListProps
 * @property {Object} system - The system data where buildings are managed
 * @property {Object} gameState - The game state object with signals and actions
 */


/**
 * Component for managing buildings in a system.
 *
 * @param {BuildingListProps} props
 */
export function BuildingList(props) {
  // Per-system resources: metals and energy are local to this system
  const systemMetals = () => props.system?.localResources?.metals ?? 0;
  const systemEnergy = () => props.system?.localEnergy ?? { capacity: 10, usage: 0 };
  // Global resource: credits
  const globalCredits = () => props.gameState.credits();
  const buildings = () => props.system?.buildings || {};
  const constructionQueue = () => props.system?.constructionQueue || [];

  // Timer for updating progress bars
  const [now, setNow] = createSignal(Date.now());
  const timer = setInterval(() => setNow(Date.now()), 100);
  onCleanup(() => clearInterval(timer));

  // Check if we can afford a cost (credits only)
  const canAfford = (cost) => {
    return globalCredits() >= cost.credits;
  };

  // Generic helper for queue state across buildings and ships
  const getQueueStatus = (queueType, target) => {
    const queue = constructionQueue();
    let isActive = false;
    let isQueued = false;
    let activeItem = null;

    for (let i = 0; i < queue.length; i += 1) {
      const item = queue[i];
      if (item.type === queueType && item.target === target) {
        if (i === 0) {
          isActive = true;
          activeItem = item;
        } else {
          isQueued = true;
        }
      }

      if (isActive && isQueued) {
        break;
      }
    }

    return {
      isActive,
      isQueued,
      isInQueue: isActive || isQueued,
      activeItem,
    };
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

  // Can build ships (requires shipyard)
  const canBuildShips = () => getLevel('shipyard') > 0;

  // Get ship cost with shipyard discount
  const getShipBuildTime = () => {
    const shipyardLevel = getLevel('shipyard');
    return COLONY_SHIP.buildTime * Math.pow(0.9, shipyardLevel);
  };

  const colonyShipQueueStatus = () => getQueueStatus('ship', 'colonyShip');

  const buildingList = Object.values(BUILDINGS);

  return (
    <div id="building-list-container" class="building-list-container">
      {/* Resource Header - shows system-local metals/energy + global credits */}
      <MiniPanel class="resource-bar">
        <div class="resource-item">
          <ResourceIcon type="metals" size={16} />
          <span class="res-label">METALS</span>
          <span id="res-metals-value" class="res-value">{Math.floor(systemMetals())}</span>
        </div>
        <div class="resource-item">
          <ResourceIcon type="energy" size={16} />
          <span class="res-label">ENERGY</span>
          <span id="res-energy-value" class={`res-value ${
            systemEnergy().usage > systemEnergy().capacity ? 'text-red-400' : ''
          }`}>{systemEnergy().capacity - systemEnergy().usage}/{systemEnergy().capacity}</span>
        </div>
        <div class="resource-item">
          <ResourceIcon type="credits" size={16} />
          <span class="res-label">CREDITS</span>
          <span id="res-credits-value" class="res-value">{Math.floor(globalCredits())}</span>
        </div>
      </MiniPanel>

      {/* Buildings Grid */}
      <div class="building-grid">
        <For each={buildingList}>
          {(building) => {
            const level = () => getLevel(building.id);
            const cost = () => getBuildingCost(building.id, level());
            const affordable = () => canAfford(cost());
            const queueStatus = () => getQueueStatus('building', building.id);
            const activelyBuilding = () => queueStatus().isActive;
            const queued = () => queueStatus().isQueued;
            const inQueue = () => queueStatus().isInQueue;
            const activeQueueItem = () => queueStatus().activeItem;

            // Calculate production/effect for this building (per level)
            const production = () => {
              if (building.production.metals > 0) return `+${building.production.metals.toFixed(1)} METALS/s`;
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
              <GlassCard
                id={`building-row-${building.id}`}
                variant={activelyBuilding() ? 'active' : queued() ? 'queued' : 'default'}
                interactive={true}
              >
                <div class="building-icon">
                  <BuildingConstruct
                    type={BUILDING_CONSTRUCT_MAP[building.id] || 'monolith'}
                    size={48}
                    interactive={false}
                  />
                </div>
                <div class="building-info">
                  <div class="building-header">
                    <span class="building-name">{building.name}</span>
                    <span class="building-level">Lvl {level()}</span>
                  </div>
                  <Show when={level() > 0 || production()}>
                    <div class="building-production text-gray-300">{production()}</div>
                  </Show>
                  <Show when={energyUsage()}>
                    <div class="building-production text-gray-300">Uses {energyUsage()}</div>
                  </Show>
                  <div class="building-cost">
                    <span class={globalCredits() >= cost().credits ? 'cost-ok' : 'cost-err'}>
                      {cost().credits} Cr
                    </span>
                  </div>
                </div>
                <div class="building-action">
                  <Show when={activelyBuilding()}>
                    {(() => {
                      const queueItem = activeQueueItem;
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
              </GlassCard>
            );
          }}
        </For>
      </div>

      {/* Ship Construction Section */}
      <Show when={canBuildShips()}>
        <StatBlock label="SHIP CONSTRUCTION" class="mt-6 pt-6">
          <GlassCard variant={colonyShipQueueStatus().isActive ? 'active' : colonyShipQueueStatus().isQueued ? 'queued' : 'default'} interactive={true}>
            <div class="building-icon">
              <BuildingConstruct
                type="tether"
                size={48}
                interactive={false}
              />
            </div>
            <div class="building-info">
              <div class="building-header">
                <span class="building-name">Colony Ship</span>
              </div>
              <div class="building-cost">
                <span class={globalCredits() >= COLONY_SHIP.cost.credits ? 'cost-ok' : 'cost-err'}>
                  {COLONY_SHIP.cost.credits} Cr
                </span>
              </div>
              <div class="building-production text-gray-300">Uses {COLONY_SHIP.energyUsage} ENERGY when docked</div>
            </div>
            <div class="building-action">
              <Show when={colonyShipQueueStatus().isActive}>
                {(() => {
                  const queueItem = () => colonyShipQueueStatus().activeItem;
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
              <Show when={colonyShipQueueStatus().isQueued}>
                <span class="queued-label">Queued</span>
              </Show>
              <Show when={!colonyShipQueueStatus().isInQueue}>
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
          </GlassCard>
        </StatBlock>
      </Show>

      <Show when={!canBuildShips()}>
        <div class="mt-6 pt-6">
          <div class="p-4 bg-white/5 rounded text-center">
            <Rocket size={24} class="mx-auto text-gray-600 mb-2" />
            <p class="text-xs text-gray-500">Build a Shipyard to construct Colony Ships</p>
          </div>
        </div>
      </Show>
    </div>
  );
}
