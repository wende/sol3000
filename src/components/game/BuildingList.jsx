import { Show, For } from 'solid-js';
import { Pickaxe, Zap, Coins, Rocket, Factory } from 'lucide-solid';
import { BUILDINGS, COLONY_SHIP, getBuildingCost } from '../../utils/gameState';
import { formatTime } from '../../utils/format';
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
  const buildings = () => props.system?.buildings || {};
  const constructionQueue = () => props.system?.constructionQueue || [];

  // Check if we can afford a cost
  const canAfford = (cost) => {
    const res = resources();
    return res.ore >= cost.ore && res.energy >= cost.energy && res.credits >= cost.credits;
  };

  // Check if building is currently being built
  const isBuilding = (buildingId) => {
    return constructionQueue().some(item => item.type === 'building' && item.target === buildingId);
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

  // Check if ship is being built
  const isBuildingShip = () => {
    return constructionQueue().some(item => item.type === 'ship' && item.target === 'colonyShip');
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
          <span id="res-energy-value" class="res-value">{Math.floor(resources().energy)}</span>
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
            const building_inProgress = () => isBuilding(building.id);

            // Calculate production for this building
            const production = () => {
              if (building.production.ore > 0) return `+${(building.production.ore * (level() + 1)).toFixed(1)} Ore/s`;
              if (building.production.energy > 0) return `+${(building.production.energy * (level() + 1)).toFixed(1)} Energy/s`;
              if (building.production.credits > 0) return `+${(building.production.credits * (level() + 1)).toFixed(1)} Credits/s`;
              if (building.id === 'shipyard') return `-10% ship build time`;
              return '';
            };

            return (
              <div
                id={`building-row-${building.id}`}
                class={`building-row glass-panel-row ${building_inProgress() ? 'building-in-progress' : ''}`}
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
                  <div class="building-cost">
                    <Show when={cost().ore > 0}>
                      <span class={affordable() || resources().ore >= cost().ore ? 'cost-ok' : 'cost-err'}>
                        {cost().ore} Ore
                      </span>
                    </Show>
                    <Show when={cost().energy > 0}>
                      <span class={affordable() || resources().energy >= cost().energy ? 'cost-ok' : 'cost-err'}>
                        {cost().energy} Energy
                      </span>
                    </Show>
                    <Show when={cost().credits > 0}>
                      <span class={affordable() || resources().credits >= cost().credits ? 'cost-ok' : 'cost-err'}>
                        {cost().credits} Cr
                      </span>
                    </Show>
                    <span class="cost-time">{formatTime(building.buildTime)}</span>
                  </div>
                </div>
                <div class="building-action">
                  <Show when={building_inProgress()}>
                    <span class="text-xs text-blue-400">BUILDING...</span>
                  </Show>
                  <Show when={!building_inProgress()}>
                    <button
                      id={`build-btn-${building.id}`}
                      class="build-btn glass-button"
                      onClick={() => handleBuild(building.id)}
                      disabled={!affordable()}
                    >
                      {level() === 0 ? 'Build' : 'Upgrade'}
                    </button>
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

          <div class={`building-row glass-panel-row ${isBuildingShip() ? 'building-in-progress' : ''}`}>
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
                <span class={resources().energy >= COLONY_SHIP.cost.energy ? 'cost-ok' : 'cost-err'}>
                  {COLONY_SHIP.cost.energy} Energy
                </span>
                <span class={resources().credits >= COLONY_SHIP.cost.credits ? 'cost-ok' : 'cost-err'}>
                  {COLONY_SHIP.cost.credits} Cr
                </span>
                <span class="cost-time">{formatTime(getShipBuildTime())}</span>
              </div>
            </div>
            <div class="building-action">
              <Show when={isBuildingShip()}>
                <span class="text-xs text-blue-400">BUILDING...</span>
              </Show>
              <Show when={!isBuildingShip()}>
                <button
                  class="build-btn glass-button"
                  onClick={handleBuildShip}
                  disabled={!canAfford(COLONY_SHIP.cost)}
                >
                  Build
                </button>
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
