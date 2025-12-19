import { createSignal, createEffect, onCleanup, createMemo } from 'solid-js';
import { generateGalaxy } from './galaxy';
import { satisfyDemands } from './production';
import { SCAN_COST, calculateHopsToSystem, calculateScanDuration } from '../operations/scan';

const STORAGE_KEY = 'sol3000_game_state';
const TICK_INTERVAL = 100; // 100ms = 10 ticks per second
const TRADE_INCOME_PER_METAL = 0.01; // Credits per second per unit of metal traded

/**
 * Building definitions with costs and production rates
 */
export const BUILDINGS = {
  oreMine: {
    id: 'oreMine',
    name: 'Ore Mine',
    description: 'Extracts raw ore from the planet.',
    baseCost: { ore: 50, credits: 0 },
    costFactor: 1.15,
    buildTimeFactor: 1.5, // Build time scales 1.5× per level
    production: { ore: 0.5, credits: 0 },
    energyUsage: 2, // Energy consumed per level
    buildTime: 3000 // 3 seconds base
  },
  solarPlant: {
    id: 'solarPlant',
    name: 'Solar Plant',
    description: 'Provides energy capacity from stellar radiation.',
    baseCost: { ore: 30, credits: 0 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { ore: 0, credits: 0 },
    energyCapacity: 5, // Energy capacity provided per level
    energyUsage: 0,
    buildTime: 2000 // 2 seconds base
  },
  tradeHub: {
    id: 'tradeHub',
    name: 'Trade Hub',
    description: 'Facilitates commerce and generates credits.',
    baseCost: { ore: 80, credits: 0 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { ore: 0, credits: 0.2 },
    energyUsage: 3, // Energy consumed per level
    buildTime: 4500 // 4.5 seconds base
  },
  shipyard: {
    id: 'shipyard',
    name: 'Shipyard',
    description: 'Constructs spacecraft for colonization.',
    baseCost: { ore: 200, credits: 100 },
    costFactor: 1.15,
    buildTimeFactor: 1.5,
    production: { ore: 0, credits: 0 },
    energyUsage: 5, // Energy consumed per level
    buildTime: 12000 // 12 seconds base
  }
};

/**
 * Tech tree definitions
 */
export const TECH_TREE = {
  efficientMining: {
    id: 'efficientMining',
    name: 'Efficient Mining',
    description: '+25% Ore production',
    cost: 200,
    researchTime: 12000, // 12 seconds
    requires: [],
    effect: { oreBonus: 0.25 }
  },
  advancedReactors: {
    id: 'advancedReactors',
    name: 'Advanced Reactors',
    description: '+25% Energy capacity',
    cost: 400,
    researchTime: 18000, // 18 seconds
    requires: ['efficientMining'],
    effect: { energyBonus: 0.25 }
  },
  tradeNetworks: {
    id: 'tradeNetworks',
    name: 'Trade Networks',
    description: '+25% Credits production',
    cost: 350,
    researchTime: 15000, // 15 seconds
    requires: ['efficientMining'],
    effect: { creditsBonus: 0.25 }
  },
  warpDrives: {
    id: 'warpDrives',
    name: 'Warp Drives',
    description: '-25% ship travel time',
    cost: 600,
    researchTime: 24000, // 24 seconds
    requires: ['advancedReactors'],
    effect: { travelBonus: 0.25 }
  },
  colonialAdmin: {
    id: 'colonialAdmin',
    name: 'Colonial Administration',
    description: 'New colonies start with Lvl 1 buildings',
    cost: 500,
    researchTime: 20000, // 20 seconds
    requires: ['tradeNetworks'],
    effect: { colonyBonus: true }
  },
  galacticDominion: {
    id: 'galacticDominion',
    name: 'Galactic Dominion',
    description: '+50% all production',
    cost: 1000,
    researchTime: 30000, // 30 seconds
    requires: ['colonialAdmin'],
    effect: { allBonus: 0.5 }
  }
};

/**
 * Colony ship definition
 */
export const COLONY_SHIP = {
  cost: { ore: 500, credits: 300 },
  energyUsage: 10, // Energy consumed while docked
  buildTime: 18000, // 18 seconds
  travelTimePerHop: 6000 // 6 seconds per FTL hop
};

/**
 * Resource multipliers based on system richness
 */
const RESOURCE_MULTIPLIERS = {
  'Rich': 1.5,
  'Normal': 1.0,
  'Poor': 0.6
};

/**
 * Calculate visible systems based on fog of war (2 hops from all colonized planets)
 * Also returns tether routes (connections from 2-hop systems to unseen 3-hop systems)
 */
export function calculateVisibleSystems(galaxy, homeSystemId) {
  if (!homeSystemId || !galaxy.systems.length) {
    return { visibleIds: new Set(), tetherRoutes: [] };
  }

  // Find all Player-owned systems (colonized planets)
  const colonizedSystems = galaxy.systems.filter(s => s.owner === 'Player');
  if (colonizedSystems.length === 0) {
    return { visibleIds: new Set(), tetherRoutes: [] };
  }

  // Build adjacency map from routes
  const adjacency = {};
  galaxy.systems.forEach(s => adjacency[s.id] = []);
  galaxy.routes.forEach(r => {
    adjacency[r.source.id].push(r.target.id);
    adjacency[r.target.id].push(r.source.id);
  });

  // BFS to find systems within 2 hops from ANY colonized planet
  const visibleIds = new Set();
  const queue = []; // [systemId, distance]
  const visited = new Set();

  // Initialize BFS from all colonized systems
  for (const colonized of colonizedSystems) {
    visibleIds.add(colonized.id);
    visited.add(colonized.id);
    queue.push([colonized.id, 0]);
  }

  while (queue.length > 0) {
    const [currentId, distance] = queue.shift();

    if (distance < 2) {
      const neighbors = adjacency[currentId] || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          visibleIds.add(neighborId);
          queue.push([neighborId, distance + 1]);
        }
      }
    }
  }

  // Find tether routes: connections from 2-hop systems to 3-hop systems
  const tetherRoutes = [];

  // Build full distance map up to 3 hops from ALL colonized systems
  const distanceMap = new Map();
  const bfsQueue = [];

  // Initialize distance map from all colonized systems
  for (const colonized of colonizedSystems) {
    distanceMap.set(colonized.id, 0);
    bfsQueue.push([colonized.id, 0]);
  }

  while (bfsQueue.length > 0) {
    const [currentId, distance] = bfsQueue.shift();

    // Continue traversing up to distance 3 to map all systems
    if (distance < 3) {
      const neighbors = adjacency[currentId] || [];
      for (const neighborId of neighbors) {
        if (!distanceMap.has(neighborId)) {
          distanceMap.set(neighborId, distance + 1);
          bfsQueue.push([neighborId, distance + 1]);
        }
      }
    }
  }

  // For each visible system at exactly 2 hops, find neighbors at 3 hops and create tether routes
  for (const systemId of visibleIds) {
    const distance = distanceMap.get(systemId);
    if (distance !== 2) continue;

    const neighbors = adjacency[systemId] || [];
    const source = galaxy.systems.find(s => s.id === systemId);
    if (!source) continue;

    for (const neighborId of neighbors) {
      const neighborDistance = distanceMap.get(neighborId);
      // If neighbor is at 3 hops (not visible), create a tether route
      if (neighborDistance === 3) {
        const target = galaxy.systems.find(s => s.id === neighborId);
        if (target) {
          tetherRoutes.push({
            source,
            target,
            id: `tether-${systemId}-${neighborId}`
          });
        }
      }
    }
  }

  return { visibleIds, tetherRoutes };
}

/**
 * Calculate building cost at a given level
 */
export function getBuildingCost(buildingId, level) {
  const building = BUILDINGS[buildingId];
  const factor = Math.pow(building.costFactor, level);
  return {
    ore: Math.floor(building.baseCost.ore * factor),
    credits: Math.floor(building.baseCost.credits * factor)
  };
}

/**
 * Calculate tech bonuses from researched technologies
 */
function calculateTechBonuses(researched) {
  const bonuses = {
    ore: 1,
    energy: 1,
    credits: 1,
    travel: 1,
    colonyBonus: false,
    all: 1
  };

  researched.forEach(techId => {
    const tech = TECH_TREE[techId];
    if (!tech) return;

    if (tech.effect.oreBonus) bonuses.ore += tech.effect.oreBonus;
    if (tech.effect.energyBonus) bonuses.energy += tech.effect.energyBonus;
    if (tech.effect.creditsBonus) bonuses.credits += tech.effect.creditsBonus;
    if (tech.effect.travelBonus) bonuses.travel -= tech.effect.travelBonus;
    if (tech.effect.colonyBonus) bonuses.colonyBonus = true;
    if (tech.effect.allBonus) bonuses.all += tech.effect.allBonus;
  });

  return bonuses;
}

/**
 * Creates and manages game state with real-time tick system
 */
export function createGameState() {
  // Core signals
  const [galaxyData, setGalaxyData] = createSignal({ systems: [], routes: [] });
  const [selectedSystemId, setSelectedSystemId] = createSignal(null);
  const [selectedTetherId, setSelectedTetherId] = createSignal(null);
  const [homeSystemId, setHomeSystemId] = createSignal(null);
  const [ripples, setRipples] = createSignal([]);
  const [zoomLevel, setZoomLevel] = createSignal(0.45);
  const [isGameActive, setIsGameActive] = createSignal(false); // True as soon as newGame is called
  const [fogTransitioning, setFogTransitioning] = createSignal(false); // True during fog of war fade animation
  
  // View state (Galaxy Map vs System View)
  const [viewState, setViewState] = createSignal('galaxy'); // 'galaxy' | 'system'
  const [viewSystemId, setViewSystemId] = createSignal(null);

  // Real-time resource signals (energy is now capacity-based, not accumulated)
  const [resources, setResources] = createSignal({
    ore: 100,
    credits: 200
  });

  // Production rates (calculated each tick, exposed for UI)
  const [productionRates, setProductionRates] = createSignal({
    ore: 0,
    credits: 0
  });

  // Energy capacity and usage (static values, not accumulated)
  const [energyState, setEnergyState] = createSignal({
    capacity: 10, // Starting energy capacity
    usage: 0
  });

  // Ships in transit
  const [ships, setShips] = createSignal([]);

  // Built FTL routes (tether IDs that have been upgraded)
  const [builtFTLs, setBuiltFTLs] = createSignal(new Set());

  // Tech state
  const [tech, setTech] = createSignal({
    researched: [],
    current: null // { id, startTime, duration }
  });

  // Scanning state - system being scanned
  const [scanningSystem, setScanningSystem] = createSignal(null); // { systemId, startTime, duration }

  // Fog of War - Memoized visible systems calculation
  const visibleSystems = createMemo(() => {
    return calculateVisibleSystems(galaxyData(), homeSystemId());
  });

  // Track newly revealed systems for fade-in animation
  const [newlyRevealedIds, setNewlyRevealedIds] = createSignal(new Set());
  let previousVisibleIds = new Set();

  // Detect newly visible systems when fog of war changes
  createEffect(() => {
    const currentVisibility = visibleSystems();
    const currentIds = currentVisibility?.visibleIds || new Set();

    // Skip if this is the initial state (no previous data)
    if (previousVisibleIds.size === 0 && currentIds.size > 0) {
      previousVisibleIds = new Set(currentIds);
      return;
    }

    // Find systems that are newly visible (in current but not in previous)
    const newIds = new Set();
    for (const id of currentIds) {
      if (!previousVisibleIds.has(id)) {
        newIds.add(id);
      }
    }

    // If there are newly revealed systems, set them and clear after animation
    if (newIds.size > 0) {
      setNewlyRevealedIds(newIds);

      // Clear newly revealed after fade-in animation completes (1300ms)
      setTimeout(() => {
        setNewlyRevealedIds(new Set());
      }, 1300);
    }

    // Update previous visible IDs for next comparison
    previousVisibleIds = new Set(currentIds);
  });

  // Trade flow calculation - connects supply systems to demand systems via built FTL routes
  const tradeFlows = createMemo(() => {
    const galaxy = galaxyData();
    const built = builtFTLs();

    if (!galaxy.systems.length || built.size === 0) {
      return {
        flows: [],
        systemSatisfaction: new Map(), // systemId -> { supplied, consumed, total, ratio }
        routeThroughput: new Map()     // routeId -> amount
      };
    }

    // Collect producers (systems with supply) and consumers (systems with demand)
    const producers = [];
    const consumers = [];

    for (const system of galaxy.systems) {
      const market = system.market?.metals;
      if (!market) continue;

      if (market.supply > 0) {
        producers.push({ id: system.id, supply: market.supply });
      }
      if (market.demand > 0) {
        consumers.push({ id: system.id, demand: market.demand });
      }
    }

    // Build links from built FTL routes that connect supply to demand
    const links = [];
    for (const route of galaxy.routes) {
      const routeId = route.id;
      if (!built.has(routeId)) continue;

      const sourceMarket = route.source.market?.metals;
      const targetMarket = route.target.market?.metals;

      // Check if this route connects supply to demand (in either direction)
      const sourceHasSupply = (sourceMarket?.supply || 0) > 0;
      const sourceHasDemand = (sourceMarket?.demand || 0) > 0;
      const targetHasSupply = (targetMarket?.supply || 0) > 0;
      const targetHasDemand = (targetMarket?.demand || 0) > 0;

      // Add link from supply to demand
      if (sourceHasSupply && targetHasDemand) {
        links.push({ producerId: route.source.id, consumerId: route.target.id, routeId });
      }
      if (targetHasSupply && sourceHasDemand) {
        links.push({ producerId: route.target.id, consumerId: route.source.id, routeId });
      }
    }

    if (producers.length === 0 || consumers.length === 0 || links.length === 0) {
      return {
        flows: [],
        systemSatisfaction: new Map(),
        routeThroughput: new Map()
      };
    }

    // Calculate allocation
    const result = satisfyDemands({ producers, consumers, links });

    // Build satisfaction map for each system
    const systemSatisfaction = new Map();

    // For producers (supply systems): how much was sent vs total supply
    for (const producer of producers) {
      const sent = result.producerSent.get(producer.id) || 0;
      systemSatisfaction.set(producer.id, {
        type: 'supply',
        used: sent,
        total: producer.supply,
        ratio: producer.supply > 0 ? sent / producer.supply : 0
      });
    }

    // For consumers (demand systems): how much was received vs total demand
    for (const consumer of consumers) {
      const received = result.consumerReceived.get(consumer.id) || 0;
      systemSatisfaction.set(consumer.id, {
        type: 'demand',
        satisfied: received,
        total: consumer.demand,
        ratio: consumer.demand > 0 ? received / consumer.demand : 0
      });
    }

    // Build route throughput map
    const routeThroughput = new Map();
    for (const flow of result.flows) {
      if (flow.amount > 0) {
        // Find the link to get the routeId
        const link = links.find(l =>
          l.producerId === flow.producerId && l.consumerId === flow.consumerId
        );
        if (link) {
          const existing = routeThroughput.get(link.routeId) || 0;
          routeThroughput.set(link.routeId, existing + flow.amount);
        }
      }
    }

    return {
      flows: result.flows,
      systemSatisfaction,
      routeThroughput
    };
  });

  // Game tick reference
  let tickInterval = null;
  let lastTickTime = Date.now();
  let saveTimeout = null;
  let periodicSaveInterval = null;
  
  /**
   * Enter system view
   */
  const enterSystemView = (systemId) => {
    setViewSystemId(systemId);
    setViewState('system');
  };

  /**
   * Exit system view (return to galaxy)
   */
  const exitSystemView = () => {
    setViewState('galaxy');
    setViewSystemId(null);
  };

  /**
   * Calculate energy capacity and usage across all owned systems
   */
  const calculateEnergyState = () => {
    const galaxy = galaxyData();
    const ownedSystems = galaxy.systems.filter(s => s.owner === 'Player');
    const techBonuses = calculateTechBonuses(tech().researched);
    const dockedShips = ships().filter(s => s.status === 'docked');

    let capacity = 10; // Base capacity
    let usage = 0;

    ownedSystems.forEach(system => {
      const buildings = system.buildings || {};

      // Solar Plant provides capacity
      const solarPlantLevel = buildings.solarPlant?.level || 0;
      capacity += solarPlantLevel * BUILDINGS.solarPlant.energyCapacity;

      // Other buildings consume energy
      const oreMineLevel = buildings.oreMine?.level || 0;
      usage += oreMineLevel * BUILDINGS.oreMine.energyUsage;

      const tradeHubLevel = buildings.tradeHub?.level || 0;
      usage += tradeHubLevel * BUILDINGS.tradeHub.energyUsage;

      const shipyardLevel = buildings.shipyard?.level || 0;
      usage += shipyardLevel * BUILDINGS.shipyard.energyUsage;
    });

    // Docked ships consume energy
    dockedShips.forEach(() => {
      usage += COLONY_SHIP.energyUsage;
    });

    // Apply tech bonus to capacity
    capacity *= techBonuses.energy * techBonuses.all;

    return { capacity: Math.floor(capacity), usage };
  };

  /**
   * Calculate total production rates from all owned systems
   */
  const calculateProductionRates = () => {
    const galaxy = galaxyData();
    const ownedSystems = galaxy.systems.filter(s => s.owner === 'Player');
    const techBonuses = calculateTechBonuses(tech().researched);
    const energy = calculateEnergyState();

    // Efficiency penalty if over capacity
    const efficiencyMult = energy.usage > energy.capacity ? 0.5 : 1.0;

    let oreRate = 0;
    let creditsRate = 0;

    ownedSystems.forEach(system => {
      const mult = RESOURCE_MULTIPLIERS[system.resources] || 1;
      const buildings = system.buildings || {};

      // Ore production
      const oreMineLevel = buildings.oreMine?.level || 0;
      oreRate += oreMineLevel * BUILDINGS.oreMine.production.ore * mult;

      // Credits production
      const tradeHubLevel = buildings.tradeHub?.level || 0;
      creditsRate += tradeHubLevel * BUILDINGS.tradeHub.production.credits * mult;
    });

    // Apply tech bonuses and efficiency penalty
    oreRate *= techBonuses.ore * techBonuses.all * efficiencyMult;
    creditsRate *= techBonuses.credits * techBonuses.all * efficiencyMult;

    // Add income from metal trade flows
    const flows = tradeFlows();
    const totalMetalTraded = flows.flows.reduce((sum, flow) => sum + flow.amount, 0);
    creditsRate += totalMetalTraded * TRADE_INCOME_PER_METAL;

    return { ore: oreRate, credits: creditsRate };
  };

  /**
   * Update construction queues for all systems
   */
  const updateConstructionQueues = (deltaMs) => {
    const galaxy = galaxyData();
    let modified = false;

    const updatedSystems = galaxy.systems.map(system => {
      if (system.owner !== 'Player' || !system.constructionQueue?.length) {
        return system;
      }

      const queue = [...system.constructionQueue];
      let currentItem = queue[0];

      if (!currentItem) return system;

      let queueModified = false;
      if (!currentItem.startTime) {
        currentItem = { ...currentItem, startTime: Date.now() };
        queue[0] = currentItem;
        queueModified = true;
        modified = true;
      }

      const now = Date.now();
      const elapsed = now - currentItem.startTime;

      if (elapsed >= currentItem.duration) {
        // Construction complete!
        modified = true;
        queue.shift();

        let updatedBuildings = { ...system.buildings };

        if (currentItem.type === 'building') {
          const buildingId = currentItem.target;
          updatedBuildings[buildingId] = {
            level: (updatedBuildings[buildingId]?.level || 0) + 1
          };
        } else if (currentItem.type === 'ship' && currentItem.target === 'colonyShip') {
          // Ship construction complete - add to available ships at this system
          // For now, ships are added to the ships signal with status 'docked'
          setShips(prev => [...prev, {
            id: Date.now(),
            type: 'colony',
            systemId: system.id,
            status: 'docked'
          }]);
        }

        return {
          ...system,
          buildings: updatedBuildings,
          constructionQueue: queue
        };
      }

      if (queueModified) {
        return {
          ...system,
          constructionQueue: queue
        };
      }

      return system;
    });

    if (modified) {
      setGalaxyData({ ...galaxy, systems: updatedSystems });
    }
  };

  /**
   * Update ships in transit
   */
  const updateShipPositions = (deltaMs) => {
    const techBonuses = calculateTechBonuses(tech().researched);
    const travelTimePerHop = COLONY_SHIP.travelTimePerHop * techBonuses.travel;

    setShips(prevShips => {
      let modified = false;
      const updatedShips = prevShips.map(ship => {
        if (ship.status !== 'transit') return ship;

        const now = Date.now();
        const totalTravelTime = ship.route.length * travelTimePerHop;
        const elapsed = now - ship.launchTime;
        const progress = Math.min(1, elapsed / totalTravelTime);

        if (progress >= 1) {
          // Arrived at destination!
          modified = true;
          colonizeSystem(ship.destinationId);
          return null; // Remove ship
        }

        // Calculate current segment
        const segmentCount = ship.route.length;
        const segmentProgress = progress * segmentCount;
        const currentSegment = Math.floor(segmentProgress);

        return {
          ...ship,
          currentSegment,
          segmentProgress: segmentProgress - currentSegment
        };
      }).filter(Boolean);

      return modified ? updatedShips : prevShips;
    });
  };

  /**
   * Colonize a system
   */
  const colonizeSystem = (systemId) => {
    const galaxy = galaxyData();
    const techBonuses = calculateTechBonuses(tech().researched);

    const updatedSystems = galaxy.systems.map(system => {
      if (system.id !== systemId) return system;

      // Initialize buildings (potentially with bonus from tech)
      const startingLevel = techBonuses.colonyBonus ? 1 : 0;

      return {
        ...system,
        owner: 'Player',
        buildings: {
          oreMine: { level: startingLevel },
          solarPlant: { level: startingLevel },
          tradeHub: { level: startingLevel },
          shipyard: { level: 0 }
        },
        constructionQueue: []
      };
    });

    setGalaxyData({ ...galaxy, systems: updatedSystems });

    // Bonus resources on colonization (ore only, energy is capacity-based)
    setResources(r => ({
      ore: r.ore + 50,
      credits: r.credits
    }));
  };

  /**
   * Update tech research progress
   */
  const updateTechResearch = () => {
    const currentTech = tech().current;
    if (!currentTech) return;

    const now = Date.now();
    const elapsed = now - currentTech.startTime;
    const remaining = Math.max(0, currentTech.duration - elapsed);

    if (elapsed >= currentTech.duration) {
      // Research complete!
      setTech(t => ({
        researched: [...t.researched, currentTech.id],
        current: null
      }));
    } else {
      // Update remaining time for UI (triggers reactivity)
      setTech(t => ({
        ...t,
        current: {
          ...t.current,
          remainingTime: remaining
        }
      }));
    }
  };

  /**
   * Update scan progress and complete when done
   */
  const updateScanProgress = () => {
    const scan = scanningSystem();
    if (!scan) return;

    const now = Date.now();
    const elapsed = now - scan.startTime;

    if (elapsed >= scan.duration) {
      // Scan complete - colonize the system
      colonizeSystem(scan.systemId);
      setScanningSystem(null);
    }
  };

  /**
   * Main game tick - runs every 100ms
   */
  const gameTick = () => {
    const now = Date.now();
    const deltaMs = now - lastTickTime;
    lastTickTime = now;
    const deltaSec = deltaMs / 1000;

    // Update energy state (static capacity, not accumulated)
    const energy = calculateEnergyState();
    setEnergyState(energy);

    // Calculate and apply production
    const rates = calculateProductionRates();
    setProductionRates(rates);

    // Only accumulate ore and credits (energy is static capacity)
    setResources(r => ({
      ore: r.ore + rates.ore * deltaSec,
      credits: r.credits + rates.credits * deltaSec
    }));

    // Update construction queues
    updateConstructionQueues(deltaMs);

    // Update ship positions
    updateShipPositions(deltaMs);

    // Update scan progress
    updateScanProgress();

    // Update tech research
    updateTechResearch();
  };

  /**
   * Start the game loop
   */
  const startGameLoop = () => {
    if (!tickInterval) {
      lastTickTime = Date.now();
      tickInterval = setInterval(gameTick, TICK_INTERVAL);
    }

    // Periodic save for resources (every 10 seconds)
    if (!periodicSaveInterval) {
      periodicSaveInterval = setInterval(() => {
        performSave(); // Direct save, bypassing debounce
      }, 10000);
    }
  };

  /**
   * Stop the game loop
   */
  const stopGameLoop = () => {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
    if (periodicSaveInterval) {
      clearInterval(periodicSaveInterval);
      periodicSaveInterval = null;
    }
  };

  /**
   * Start construction of a building or ship
   */
  const startConstruction = (systemId, type, target) => {
    const galaxy = galaxyData();
    const system = galaxy.systems.find(s => s.id === systemId);

    if (!system || system.owner !== 'Player') return false;

    let cost, duration;

    if (type === 'building') {
      const building = BUILDINGS[target];
      if (!building) return false;

      const currentLevel = system.buildings?.[target]?.level || 0;
      cost = getBuildingCost(target, currentLevel);
      // Build time scales exponentially: base × factor^level (OGame-style)
      duration = building.buildTime * Math.pow(building.buildTimeFactor, currentLevel);
    } else if (type === 'ship' && target === 'colonyShip') {
      // Check if shipyard exists
      if (!system.buildings?.shipyard?.level) return false;

      cost = COLONY_SHIP.cost;
      // Reduce build time by 10% per shipyard level
      const shipyardLevel = system.buildings.shipyard.level;
      duration = COLONY_SHIP.buildTime * Math.pow(0.9, shipyardLevel);
    } else {
      return false;
    }

    // Check resources (energy is now capacity-based, not spent)
    const res = resources();
    if (res.ore < cost.ore || res.credits < cost.credits) {
      return false;
    }

    // Deduct resources (only ore and credits)
    setResources(r => ({
      ore: r.ore - cost.ore,
      credits: r.credits - cost.credits
    }));

    // Add to construction queue
    const updatedSystems = galaxy.systems.map(s => {
      if (s.id !== systemId) return s;

      const queue = s.constructionQueue || [];
      const startTime = queue.length === 0 ? Date.now() : null;

      return {
        ...s,
        constructionQueue: [...queue, {
          type,
          target,
          startTime,
          duration
        }]
      };
    });

    setGalaxyData({ ...galaxy, systems: updatedSystems });
    return true;
  };

  /**
   * Build FTL on a tether (costs 20 credits)
   */
  const buildFTL = (tetherId) => {
    const FTL_COST = 20;
    const res = resources();

    if (res.credits < FTL_COST) {
      return false;
    }

    // Check if already built
    if (builtFTLs().has(tetherId)) {
      return false;
    }

    // Deduct credits
    setResources(r => ({
      ...r,
      credits: r.credits - FTL_COST
    }));

    // Add to built FTLs
    setBuiltFTLs(prev => {
      const newSet = new Set([...prev, tetherId]);
      console.log(`🔨 Built FTL on route ${tetherId}. Total built: ${newSet.size}`);
      console.log(`   Built routes:`, [...newSet]);
      return newSet;
    });

    return true;
  };

  /**
   * Scan a system (costs credits, takes 30s + 5s per hop from home)
   */
  const scanSystem = (systemId) => {
    const res = resources();

    // Can't scan if already scanning
    if (scanningSystem()) {
      return false;
    }

    if (res.credits < SCAN_COST) {
      return false;
    }

    const galaxy = galaxyData();
    const system = galaxy.systems.find(s => s.id === systemId);
    if (!system || system.owner !== 'Unclaimed') {
      return false;
    }

    // Calculate scan duration based on hops from home
    const hops = calculateHopsToSystem(galaxy, homeSystemId(), systemId, findPath);
    const duration = calculateScanDuration(hops);

    // Deduct credits
    setResources(r => ({
      ...r,
      credits: r.credits - SCAN_COST
    }));

    // Start scanning
    setScanningSystem({
      systemId,
      startTime: Date.now(),
      duration
    });

    return true;
  };

  /**
   * Cancel an ongoing scan (no refund)
   */
  const cancelScan = () => {
    setScanningSystem(null);
  };

  /**
   * Launch a colony ship to a destination
   */
  const launchColonyShip = (shipId, destinationId) => {
    const ship = ships().find(s => s.id === shipId && s.status === 'docked');
    if (!ship) return false;

    const galaxy = galaxyData();
    const originSystem = galaxy.systems.find(s => s.id === ship.systemId);
    const destSystem = galaxy.systems.find(s => s.id === destinationId);

    if (!originSystem || !destSystem) return false;
    if (destSystem.owner !== 'Unclaimed') return false;

    // Find path using A* (simplified - BFS along routes)
    const route = findPath(galaxy, ship.systemId, destinationId);
    if (!route) return false;

    // Update ship to transit status
    setShips(prev => prev.map(s => {
      if (s.id !== shipId) return s;
      return {
        ...s,
        status: 'transit',
        destinationId,
        route,
        currentSegment: 0,
        segmentProgress: 0,
        launchTime: Date.now()
      };
    }));

    return true;
  };

  /**
   * Simple BFS pathfinding along FTL routes
   */
  const findPath = (galaxy, startId, endId) => {
    const routes = galaxy.routes;

    // Build adjacency list
    const adjacency = {};
    galaxy.systems.forEach(s => adjacency[s.id] = []);
    routes.forEach(r => {
      adjacency[r.source.id].push(r.target.id);
      adjacency[r.target.id].push(r.source.id);
    });

    // BFS
    const queue = [[startId]];
    const visited = new Set([startId]);

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === endId) {
        return path.slice(1); // Return path without start
      }

      for (const neighbor of adjacency[current] || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return null; // No path found
  };

  /**
   * Start researching a technology
   */
  const startResearch = (techId) => {
    const techDef = TECH_TREE[techId];
    if (!techDef) return false;

    const currentTech = tech();
    if (currentTech.current) return false; // Already researching

    // Check prerequisites
    const hasPrereqs = techDef.requires.every(req => currentTech.researched.includes(req));
    if (!hasPrereqs) return false;

    // Check if already researched
    if (currentTech.researched.includes(techId)) return false;

    // Check credits
    if (resources().credits < techDef.cost) return false;

    // Deduct credits
    setResources(r => ({ ...r, credits: r.credits - techDef.cost }));

    // Start research
    setTech(t => ({
      ...t,
      current: {
        id: techId,
        startTime: Date.now(),
        duration: techDef.researchTime
      }
    }));

    return true;
  };

  /**
   * Migrate old route IDs (index-based) to new route IDs (system-ID-based)
   */
  const migrateRouteIds = (galaxyData, builtFTLs) => {
    if (builtFTLs.length === 0) return { galaxyData, builtFTLs };

    console.log('Checking if route ID migration is needed...');

    // Build a map from old route IDs to new route IDs
    const oldToNew = new Map();
    const systems = galaxyData.systems;

    // Create a map of system ID to array index (for old route IDs)
    systems.forEach((sys, idx) => {
      sys.__tempIdx = idx;
    });

    // Check each route to see if ID needs updating
    let needsMigration = false;
    const updatedRoutes = galaxyData.routes.map(route => {
      const oldId = [route.source.__tempIdx, route.target.__tempIdx].sort((a, b) => a - b).join('-');
      const newId = [route.source.id, route.target.id].sort((a, b) => a - b).join('-');

      if (oldId !== newId) {
        oldToNew.set(oldId, newId);
        needsMigration = true;
      }

      if (route.id === oldId && oldId !== newId) {
        return { ...route, id: newId };
      }
      return route;
    });

    // Clean up temp indices
    systems.forEach(sys => delete sys.__tempIdx);

    if (!needsMigration && oldToNew.size === 0) {
      console.log('No route ID migration needed');
      return { galaxyData, builtFTLs };
    }

    console.log(`Migrating ${oldToNew.size} route IDs from index-based to ID-based`);

    // Migrate builtFTLs to use new route IDs
    const migratedBuiltFTLs = builtFTLs.map(oldId => {
      const newId = oldToNew.get(oldId);
      if (newId) {
        console.log(`  ${oldId} → ${newId}`);
        return newId;
      }
      return oldId;
    });

    return {
      galaxyData: { ...galaxyData, routes: updatedRoutes },
      builtFTLs: migratedBuiltFTLs
    };
  };

  /**
   * Migrate old save data to add market data if missing
   */
  const migrateSaveData = (galaxyData) => {
    // Check if systems are missing market data
    const needsMigration = galaxyData.systems.some(s => s.market === undefined);

    if (!needsMigration) {
      return galaxyData;
    }

    console.log('Migrating save data: adding market data to systems');

    // Add market data to systems that don't have it
    const migratedSystems = galaxyData.systems.map(s => {
      if (s.market !== undefined) return s;

      // Import generateMetalsMarket logic inline
      if (Math.random() > 0.55) return { ...s, market: null };

      const bias =
        s.resources === 'Rich' ? 0.12 :
        s.resources === 'Poor' ? -0.12 :
        0;

      const isSupply = Math.random() < Math.min(1, Math.max(0, 0.5 + bias));
      const randomInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

      if (isSupply) {
        return { ...s, market: { metals: { supply: randomInt(200, 1200), demand: 0 } } };
      }

      return { ...s, market: { metals: { supply: 0, demand: randomInt(200, 1200) } } };
    });

    return { ...galaxyData, systems: migratedSystems };
  };

  /**
   * Load game state from localStorage
   */
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        console.log('📂 Loading saved game state...');

        let state;
        try {
          state = JSON.parse(saved);
          console.log('✓ Save file parsed successfully');
        } catch (parseError) {
          const errorMsg = `Save file is corrupted (JSON parse error)`;
          console.error('❌ SAVE LOAD FAILED - JSON PARSE ERROR');
          console.error('Details:', parseError.message);
          console.error('This usually means the save file was corrupted or truncated');
          alert(`⚠️ Save Load Failed\n\n${errorMsg}\n\nThe save file could not be read. Starting a new game.\n\nTechnical details: ${parseError.message}`);
          localStorage.removeItem(STORAGE_KEY);
          const newGalaxy = generateGalaxy();
          setGalaxyData(newGalaxy);
          startGameLoop();
          return false;
        }

        // Validate saved data - detect corruption
        console.log('🔍 Validating save data integrity...');
        const playerSystems = state.galaxyData?.systems?.filter(s => s.owner === 'Player') || [];
        const hasHome = !!state.homeSystemId;
        const homeExists = state.galaxyData?.systems?.some(s => s.id === state.homeSystemId);

        console.log(`   Player systems: ${playerSystems.length}`);
        console.log(`   Home system ID: ${state.homeSystemId || 'none'}`);
        console.log(`   Home exists in galaxy: ${homeExists}`);

        // Corruption: Player owns systems but no valid home, or too many systems owned at start
        if (playerSystems.length > 0 && (!hasHome || !homeExists)) {
          const issues = [];
          if (!hasHome) issues.push('No home system ID set');
          if (hasHome && !homeExists) issues.push(`Home system ${state.homeSystemId} not found in galaxy`);

          const errorMsg = `Save file is corrupted:\n- ${issues.join('\n- ')}\n- Player owns ${playerSystems.length} systems but missing valid home`;

          console.error('❌ SAVE LOAD FAILED - CORRUPTION DETECTED');
          console.error('Corruption details:');
          issues.forEach(issue => console.error(`  - ${issue}`));
          console.error(`  - Player owns ${playerSystems.length} systems:`, playerSystems.map(s => `${s.name} (${s.id})`));

          alert(`⚠️ Save Load Failed\n\n${errorMsg}\n\nThis typically happens if the save was interrupted. Starting a new game.`);

          localStorage.removeItem(STORAGE_KEY);
          const newGalaxy = generateGalaxy();
          setGalaxyData(newGalaxy);
          startGameLoop();
          return false;
        }

        console.log('✓ Save data validation passed');

        // Migrate old saves to add market data
        console.log('🔄 Checking for save migrations...');
        let migratedGalaxyData = migrateSaveData(state.galaxyData || generateGalaxy());

        // Migrate route IDs from index-based to ID-based
        const migrationResult = migrateRouteIds(migratedGalaxyData, state.builtFTLs || []);
        migratedGalaxyData = migrationResult.galaxyData;
        const migratedBuiltFTLs = migrationResult.builtFTLs;

        console.log('✓ Migrations complete');
        console.log('📥 Restoring game state...');

        setGalaxyData(migratedGalaxyData);
        setHomeSystemId(state.homeSystemId || null);
        // Handle both old and new resource format
        const savedResources = state.resources || { ore: 100, credits: 200 };
        setResources({ ore: savedResources.ore || 100, credits: savedResources.credits || 200 });
        setShips(state.ships || []);
        setBuiltFTLs(new Set(migratedBuiltFTLs));
        setTech(state.tech || { researched: [], current: null });
        setScanningSystem(state.scanningSystem || null);
        setZoomLevel(state.zoomLevel || 0.45);

        // Restore view state
        setViewState(state.viewState || 'galaxy');
        setViewSystemId(state.viewSystemId || null);

        // Mark game as active if we have a home system
        if (state.homeSystemId) {
          setIsGameActive(true);
        }

        console.log('✓ Game state restored successfully');
        console.log(`   Resources: ${savedResources.ore} ore, ${savedResources.credits} credits`);
        console.log(`   Ships: ${state.ships?.length || 0}`);
        console.log(`   Built FTLs: ${migratedBuiltFTLs.length}`);
        console.log(`   Tech researched: ${state.tech?.researched?.length || 0}`);

        // Energy state will be recalculated from buildings
        startGameLoop();
        return true;
      }
    } catch (error) {
      const errorMsg = `Unexpected error loading save file`;
      console.error('❌ SAVE LOAD FAILED - UNEXPECTED ERROR');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
      console.error('This is a bug - please report it with the above details');

      alert(`⚠️ Save Load Failed\n\n${errorMsg}\n\nAn unexpected error occurred. Starting a new game.\n\nTechnical details: ${error.message}\n\nPlease report this issue.`);

      localStorage.removeItem(STORAGE_KEY);
    }

    // If no saved state, generate new galaxy
    console.log('📂 No saved game found, generating new galaxy');
    const newGalaxy = generateGalaxy();
    setGalaxyData(newGalaxy);
    startGameLoop();
    return false;
  };

  /**
   * Save game state to localStorage (debounced for meaningful state changes)
   * Meaningful changes are tracked via reactive effect, resources saved periodically
   */
  const saveState = () => {
    // Debounce saves by 500ms - only save after changes stop
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveTimeout = null;
      performSave();
    }, 500);
  };

  /**
   * Actually perform the save operation
   */
  const performSave = () => {
    try {
      const galaxy = galaxyData();
      const home = homeSystemId();

      // Guard: Don't save if galaxy is empty (likely during hot reload initialization)
      if (!galaxy.systems || galaxy.systems.length === 0) {
        console.warn('💾 Save skipped: Galaxy is empty (initialization in progress)');
        return;
      }

      // Guard: Don't save if we have Player systems but no homeSystemId
      // This would create a corrupted save
      const playerSystems = galaxy.systems.filter(s => s.owner === 'Player');
      if (playerSystems.length > 0 && !home) {
        console.error('💾 Save skipped: CORRUPTION PREVENTION');
        console.error(`   Player owns ${playerSystems.length} systems but homeSystemId is null`);
        console.error(`   Player systems:`, playerSystems.map(s => `${s.name} (${s.id})`));
        console.error('   This prevents saving a corrupted state');
        return;
      }

      const state = {
        galaxyData: galaxy,
        homeSystemId: home,
        resources: resources(),
        ships: ships(),
        builtFTLs: [...builtFTLs()],
        tech: tech(),
        scanningSystem: scanningSystem(),
        zoomLevel: zoomLevel(),
        viewState: viewState(),
        viewSystemId: viewSystemId(),
        lastSaved: Date.now()
      };

      const saveSize = JSON.stringify(state).length;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

      console.log(`💾 Game saved (${(saveSize / 1024).toFixed(1)}KB)`);
    } catch (error) {
      console.error('❌ SAVE FAILED');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded! Save file is too large.');
        alert('⚠️ Save Failed\n\nLocalStorage quota exceeded. Your save file is too large.\n\nThis is a critical issue. Please report it.');
      } else {
        console.error('Stack trace:', error.stack);
        alert(`⚠️ Save Failed\n\nFailed to save game state.\n\nTechnical details: ${error.message}\n\nYour progress may be lost. Please report this issue.`);
      }
    }
  };

  /**
   * Reset game state and start new game
   */
  const newGame = () => {
    stopGameLoop();

    // Clear localStorage first to prevent corrupted state
    localStorage.removeItem(STORAGE_KEY);

    // Generate galaxy and prepare data FIRST (before fade)
    const newGalaxy = generateGalaxy();

    // Reset all systems - only keep Enemy status, remove any Player ownership
    const resetSystems = newGalaxy.systems.map(s => ({
      ...s,
      owner: s.owner === 'Enemy' ? 'Enemy' : 'Unclaimed',
      buildings: undefined,
      constructionQueue: undefined
    }));

    // Set all state synchronously so galaxy is ready to display
    setGalaxyData({ ...newGalaxy, systems: resetSystems });
    setSelectedSystemId(null);
    setSelectedTetherId(null);
    setHomeSystemId(null);
    setResources({ ore: 100, credits: 200 });
    setEnergyState({ capacity: 10, usage: 0 });
    setShips([]);
    setBuiltFTLs(new Set());
    setTech({ researched: [], current: null });
    setRipples([]);
    setZoomLevel(0.45);
    setViewState('galaxy');
    setViewSystemId(null);
    startGameLoop();

    // NOW trigger the fade-in (galaxy data is ready)
    setIsGameActive(true);

    // Pick a random home system after 1 second
    setTimeout(() => {
      if (resetSystems.length > 0) {
        // Find an unclaimed system with good resources
        const candidates = resetSystems.filter(s => s.resources !== 'Poor' && s.owner === 'Unclaimed');
        const homeSystem = candidates[Math.floor(Math.random() * candidates.length)] || resetSystems.find(s => s.owner === 'Unclaimed');

        if (homeSystem) {
          // Start fog transition BEFORE setting home (keeps all systems visible during fade)
          setFogTransitioning(true);

          setHomeSystemId(homeSystem.id);

          // Initialize home system as Player-owned
          const updatedSystems = resetSystems.map(s => {
            if (s.id !== homeSystem.id) return s;
            return {
              ...s,
              owner: 'Player',
              buildings: {
                oreMine: { level: 0 },
                solarPlant: { level: 0 },
                tradeHub: { level: 0 },
                shipyard: { level: 0 }
              },
              constructionQueue: []
            };
          });

          setGalaxyData({ ...newGalaxy, systems: updatedSystems });

          // End fog transition after fade completes
          setTimeout(() => setFogTransitioning(false), 800);

          // Save immediately (bypass debounce) to ensure home system persists
          const state = {
            galaxyData: { ...newGalaxy, systems: updatedSystems },
            homeSystemId: homeSystem.id,
            resources: resources(),
            ships: ships(),
            builtFTLs: [...builtFTLs()],
            tech: tech(),
            scanningSystem: null,
            zoomLevel: zoomLevel(),
            viewState: 'galaxy',
            viewSystemId: null,
            lastSaved: Date.now()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
      }
    }, 1000);
  };

  // Auto-save when meaningful state changes (debounced)
  // Note: resources() is NOT tracked here because it changes every 100ms
  // Resources are saved periodically (every 10 seconds) instead
  createEffect(() => {
    galaxyData();      // System ownership, buildings, construction queues
    homeSystemId();    // Home system selection
    ships();           // Ship launches, arrivals, colonization
    builtFTLs();       // FTL route construction
    tech();            // Research progress
    viewState();       // View state changes
    saveState();
  });

  return {
    // Signals (getters and setters)
    galaxyData,
    setGalaxyData,
    selectedSystemId,
    setSelectedSystemId,
    selectedTetherId,
    setSelectedTetherId,
    homeSystemId,
    setHomeSystemId,
    ripples,
    setRipples,
    zoomLevel,
    setZoomLevel,
    isGameActive, // True when game has been started (hides start button)
    fogTransitioning, // True during fog of war fade animation
    
    viewState,
    viewSystemId,

    // Real-time state
    resources,
    setResources,
    productionRates,
    energyState, // Static energy capacity and usage
    ships,
    setShips,
    tech,
    setTech,
    visibleSystems, // Fog of War - visible systems within 2 hops
    newlyRevealedIds, // Systems that just became visible (for fade-in animation)
    tradeFlows, // Trade flow allocation - { systemSatisfaction, routeThroughput }

    // Actions
    loadState,
    saveState,
    newGame,
    startConstruction,
    launchColonyShip,
    startResearch,
    scanSystem,
    scanningSystem,
    cancelScan,
    buildFTL,
    builtFTLs,
    findPath,
    enterSystemView,
    exitSystemView,

    // Game loop control
    startGameLoop,
    stopGameLoop
  };
}
