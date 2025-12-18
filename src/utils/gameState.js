import { createSignal, createEffect, onCleanup } from 'solid-js';
import { generateGalaxy } from './galaxy';

const STORAGE_KEY = 'sol3000_game_state';
const TICK_INTERVAL = 100; // 100ms = 10 ticks per second

/**
 * Building definitions with costs and production rates
 */
export const BUILDINGS = {
  oreMine: {
    id: 'oreMine',
    name: 'Ore Mine',
    description: 'Extracts raw ore from the planet.',
    baseCost: { ore: 50, energy: 10, credits: 0 },
    costFactor: 1.15,
    production: { ore: 0.5, energy: 0, credits: 0 },
    buildTime: 30000 // 30 seconds
  },
  solarPlant: {
    id: 'solarPlant',
    name: 'Solar Plant',
    description: 'Generates energy from stellar radiation.',
    baseCost: { ore: 30, energy: 0, credits: 0 },
    costFactor: 1.15,
    production: { ore: 0, energy: 0.3, credits: 0 },
    buildTime: 20000 // 20 seconds
  },
  tradeHub: {
    id: 'tradeHub',
    name: 'Trade Hub',
    description: 'Facilitates commerce and generates credits.',
    baseCost: { ore: 80, energy: 20, credits: 0 },
    costFactor: 1.15,
    production: { ore: 0, energy: 0, credits: 0.2 },
    buildTime: 45000 // 45 seconds
  },
  shipyard: {
    id: 'shipyard',
    name: 'Shipyard',
    description: 'Constructs spacecraft for colonization.',
    baseCost: { ore: 200, energy: 50, credits: 100 },
    costFactor: 1.15,
    production: { ore: 0, energy: 0, credits: 0 },
    buildTime: 120000 // 120 seconds
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
    researchTime: 120000,
    requires: [],
    effect: { oreBonus: 0.25 }
  },
  advancedReactors: {
    id: 'advancedReactors',
    name: 'Advanced Reactors',
    description: '+25% Energy production',
    cost: 400,
    researchTime: 180000,
    requires: ['efficientMining'],
    effect: { energyBonus: 0.25 }
  },
  tradeNetworks: {
    id: 'tradeNetworks',
    name: 'Trade Networks',
    description: '+25% Credits production',
    cost: 350,
    researchTime: 150000,
    requires: ['efficientMining'],
    effect: { creditsBonus: 0.25 }
  },
  warpDrives: {
    id: 'warpDrives',
    name: 'Warp Drives',
    description: '-25% ship travel time',
    cost: 600,
    researchTime: 240000,
    requires: ['advancedReactors'],
    effect: { travelBonus: 0.25 }
  },
  colonialAdmin: {
    id: 'colonialAdmin',
    name: 'Colonial Administration',
    description: 'New colonies start with Lvl 1 buildings',
    cost: 500,
    researchTime: 200000,
    requires: ['tradeNetworks'],
    effect: { colonyBonus: true }
  },
  galacticDominion: {
    id: 'galacticDominion',
    name: 'Galactic Dominion',
    description: '+50% all production',
    cost: 1000,
    researchTime: 300000,
    requires: ['colonialAdmin'],
    effect: { allBonus: 0.5 }
  }
};

/**
 * Colony ship definition
 */
export const COLONY_SHIP = {
  cost: { ore: 500, energy: 200, credits: 300 },
  buildTime: 180000, // 180 seconds
  travelTimePerHop: 60000 // 60 seconds per FTL hop
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
 * Calculate building cost at a given level
 */
export function getBuildingCost(buildingId, level) {
  const building = BUILDINGS[buildingId];
  const factor = Math.pow(building.costFactor, level);
  return {
    ore: Math.floor(building.baseCost.ore * factor),
    energy: Math.floor(building.baseCost.energy * factor),
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
  const [homeSystemId, setHomeSystemId] = createSignal(null);
  const [ripples, setRipples] = createSignal([]);
  const [zoomLevel, setZoomLevel] = createSignal(0.45);

  // Real-time resource signals
  const [resources, setResources] = createSignal({
    ore: 100,
    energy: 50,
    credits: 200
  });

  // Production rates (calculated each tick, exposed for UI)
  const [productionRates, setProductionRates] = createSignal({
    ore: 0,
    energy: 0,
    credits: 0
  });

  // Ships in transit
  const [ships, setShips] = createSignal([]);

  // Tech state
  const [tech, setTech] = createSignal({
    researched: [],
    current: null // { id, startTime, duration }
  });

  // Game tick reference
  let tickInterval = null;
  let lastTickTime = Date.now();
  let saveTimeout = null;

  /**
   * Calculate total production rates from all owned systems
   */
  const calculateProductionRates = () => {
    const galaxy = galaxyData();
    const ownedSystems = galaxy.systems.filter(s => s.owner === 'Player');
    const techBonuses = calculateTechBonuses(tech().researched);

    let oreRate = 0;
    let energyRate = 0;
    let creditsRate = 0;

    ownedSystems.forEach(system => {
      const mult = RESOURCE_MULTIPLIERS[system.resources] || 1;
      const buildings = system.buildings || {};

      // Ore production
      const oreMineLevel = buildings.oreMine?.level || 0;
      oreRate += oreMineLevel * BUILDINGS.oreMine.production.ore * mult;

      // Energy production
      const solarPlantLevel = buildings.solarPlant?.level || 0;
      energyRate += solarPlantLevel * BUILDINGS.solarPlant.production.energy * mult;

      // Credits production
      const tradeHubLevel = buildings.tradeHub?.level || 0;
      creditsRate += tradeHubLevel * BUILDINGS.tradeHub.production.credits * mult;
    });

    // Apply tech bonuses
    oreRate *= techBonuses.ore * techBonuses.all;
    energyRate *= techBonuses.energy * techBonuses.all;
    creditsRate *= techBonuses.credits * techBonuses.all;

    return { ore: oreRate, energy: energyRate, credits: creditsRate };
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
      const currentItem = queue[0];

      if (!currentItem) return system;

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

    // Bonus resources on colonization
    setResources(r => ({
      ore: r.ore + 50,
      energy: r.energy + 20,
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
   * Main game tick - runs every 100ms
   */
  const gameTick = () => {
    const now = Date.now();
    const deltaMs = now - lastTickTime;
    lastTickTime = now;
    const deltaSec = deltaMs / 1000;

    // Calculate and apply production
    const rates = calculateProductionRates();
    setProductionRates(rates);

    setResources(r => ({
      ore: r.ore + rates.ore * deltaSec,
      energy: r.energy + rates.energy * deltaSec,
      credits: r.credits + rates.credits * deltaSec
    }));

    // Update construction queues
    updateConstructionQueues(deltaMs);

    // Update ship positions
    updateShipPositions(deltaMs);

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
  };

  /**
   * Stop the game loop
   */
  const stopGameLoop = () => {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
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
      duration = building.buildTime;
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

    // Check resources
    const res = resources();
    if (res.ore < cost.ore || res.energy < cost.energy || res.credits < cost.credits) {
      return false;
    }

    // Deduct resources
    setResources(r => ({
      ore: r.ore - cost.ore,
      energy: r.energy - cost.energy,
      credits: r.credits - cost.credits
    }));

    // Add to construction queue
    const updatedSystems = galaxy.systems.map(s => {
      if (s.id !== systemId) return s;

      const queue = s.constructionQueue || [];
      return {
        ...s,
        constructionQueue: [...queue, {
          type,
          target,
          startTime: Date.now(),
          duration
        }]
      };
    });

    setGalaxyData({ ...galaxy, systems: updatedSystems });
    return true;
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
   * Load game state from localStorage
   */
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);

        // Validate saved data - detect corruption
        const playerSystems = state.galaxyData?.systems?.filter(s => s.owner === 'Player') || [];
        const hasHome = !!state.homeSystemId;
        const homeExists = state.galaxyData?.systems?.some(s => s.id === state.homeSystemId);

        // Corruption: Player owns systems but no valid home, or too many systems owned at start
        if (playerSystems.length > 0 && (!hasHome || !homeExists)) {
          console.warn('Corrupted save detected: Player systems without valid home. Starting fresh.');
          localStorage.removeItem(STORAGE_KEY);
          const newGalaxy = generateGalaxy();
          setGalaxyData(newGalaxy);
          startGameLoop();
          return false;
        }

        setGalaxyData(state.galaxyData || generateGalaxy());
        setHomeSystemId(state.homeSystemId || null);
        setResources(state.resources || { ore: 100, energy: 50, credits: 200 });
        setShips(state.ships || []);
        setTech(state.tech || { researched: [], current: null });
        setZoomLevel(state.zoomLevel || 0.45);
        startGameLoop();
        return true;
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
      localStorage.removeItem(STORAGE_KEY);
    }

    // If no saved state, generate new galaxy
    const newGalaxy = generateGalaxy();
    setGalaxyData(newGalaxy);
    startGameLoop();
    return false;
  };

  /**
   * Save game state to localStorage (debounced)
   */
  const saveState = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        const state = {
          galaxyData: galaxyData(),
          homeSystemId: homeSystemId(),
          resources: resources(),
          ships: ships(),
          tech: tech(),
          zoomLevel: zoomLevel(),
          lastSaved: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save game state:', error);
      }
    }, 1000);
  };

  /**
   * Reset game state and start new game
   */
  const newGame = () => {
    stopGameLoop();

    // Clear localStorage first to prevent corrupted state
    localStorage.removeItem(STORAGE_KEY);

    const newGalaxy = generateGalaxy();

    // Reset all systems - only keep Enemy status, remove any Player ownership
    const resetSystems = newGalaxy.systems.map(s => ({
      ...s,
      owner: s.owner === 'Enemy' ? 'Enemy' : 'Unclaimed',
      buildings: undefined,
      constructionQueue: undefined
    }));

    setGalaxyData({ ...newGalaxy, systems: resetSystems });
    setSelectedSystemId(null);
    setHomeSystemId(null);
    setResources({ ore: 100, energy: 50, credits: 200 });
    setShips([]);
    setTech({ researched: [], current: null });
    setRipples([]);
    setZoomLevel(0.45);

    // Pick a random home system after 1 second
    setTimeout(() => {
      if (resetSystems.length > 0) {
        // Find an unclaimed system with good resources
        const candidates = resetSystems.filter(s => s.resources !== 'Poor' && s.owner === 'Unclaimed');
        const homeSystem = candidates[Math.floor(Math.random() * candidates.length)] || resetSystems.find(s => s.owner === 'Unclaimed');

        if (homeSystem) {
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

          // Save immediately (bypass debounce) to ensure home system persists
          const state = {
            galaxyData: { ...newGalaxy, systems: updatedSystems },
            homeSystemId: homeSystem.id,
            resources: resources(),
            ships: ships(),
            tech: tech(),
            zoomLevel: zoomLevel(),
            lastSaved: Date.now()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
      }
    }, 1000);

    startGameLoop();
  };

  // Auto-save when important values change
  createEffect(() => {
    galaxyData();
    resources();
    ships();
    tech();
    saveState();
  });

  return {
    // Signals (getters and setters)
    galaxyData,
    setGalaxyData,
    selectedSystemId,
    setSelectedSystemId,
    homeSystemId,
    setHomeSystemId,
    ripples,
    setRipples,
    zoomLevel,
    setZoomLevel,

    // Real-time state
    resources,
    setResources,
    productionRates,
    ships,
    setShips,
    tech,
    setTech,

    // Actions
    loadState,
    saveState,
    newGame,
    startConstruction,
    launchColonyShip,
    startResearch,
    findPath,

    // Game loop control
    startGameLoop,
    stopGameLoop
  };
}
