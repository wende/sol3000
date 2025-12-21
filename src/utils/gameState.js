import { createSignal, createEffect, createMemo } from 'solid-js';
import { generateGalaxy } from './galaxy';
import { SCAN_COST, calculateHopsToSystem, calculateScanDuration } from '../operations/scan';
import { BUILDINGS, COLONY_SHIP, getBuildingCost } from './gameState/buildings';
import { TECH_TREE, calculateTechBonuses } from './gameState/tech';
import { calculateVisibleSystems } from './gameState/fog';
import { migrateRouteIds, migrateSaveData } from './gameState/migrations';
import { computeTradeFlows } from './gameState/trade';
import { buildFTL as buildFTLLogic } from './ftl';
import {
  STORAGE_KEY,
  TICK_INTERVAL,
  TRADE_INCOME_PER_METAL,
  RESOURCE_MULTIPLIERS,
  BASE_CREDIT_RATE
} from './gameState/constants';

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
  
  // View state (Galaxy Map vs System View vs Planet View)
  const [viewState, setViewState] = createSignal('galaxy'); // 'galaxy' | 'system' | 'planet'
  const [viewSystemId, setViewSystemId] = createSignal(null);
  const [viewPlanetId, setViewPlanetId] = createSignal(null);

  // Planet hex grid state (buildings and construction)
  const [hexBuildings, setHexBuildings] = createSignal({}); // { '0,0': 'nexus', '1,0': 'framework', ... }
  const [hexConstructionQueue, setHexConstructionQueue] = createSignal([]); // [{ hexId, buildingKey, startTime, duration }]

  // Global credits (only global resource remaining)
  const [credits, setCredits] = createSignal(200);

  // Global credits production rate (calculated each tick, exposed for UI)
  const [creditsRate, setCreditsRate] = createSignal(0);

  // NOTE: Metals and Energy are now per-system, stored on each system object:
  //   system.localResources = { metals: number }
  //   system.localEnergy = { capacity: number, usage: number }
  //   system.productionRates = { metals: number, credits: number }

  // Ships in transit
  const [ships, setShips] = createSignal([]);

  // Built FTL routes (tether IDs that have been upgraded)
  const [builtFTLs, setBuiltFTLs] = createSignal(new Set());

  // FTL construction queue - tethers currently being built
  // Each item: { tetherId, startTime, duration }
  const [ftlConstruction, setFtlConstruction] = createSignal(null);

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
  const tradeFlows = createMemo(() => computeTradeFlows(galaxyData(), builtFTLs()));

  // Helper to determine if we should show all systems (ignoring fog of war)
  const shouldShowAllSystems = createMemo(() => {
    const visibility = visibleSystems();
    const hasHome = homeSystemId() !== null && homeSystemId() !== undefined;
    
    // Show all if:
    // 1. No visibility data yet
    // 2. No visible IDs (empty set)
    // 3. No home system set (cinematic intro)
    // 4. Fog transition is happening (fade out animation)
    return !visibility?.visibleIds || 
           visibility.visibleIds.size === 0 || 
           !hasHome || 
           fogTransitioning();
  });

  // Check if a system is visible (considering fog of war and "show all" state)
  const isSystemVisible = (systemId) => {
    if (shouldShowAllSystems()) return true;
    return visibleSystems().visibleIds.has(systemId);
  };

  // Check if a route is visible
  const isRouteVisible = (route) => {
    if (shouldShowAllSystems()) return true;
    const ids = visibleSystems().visibleIds;
    return ids.has(route.source.id) && ids.has(route.target.id);
  };

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
   * Enter planet view (Hex Grid)
   */
  const enterPlanetView = (planetId) => {
    setViewPlanetId(planetId);
    setViewState('planet');

    // Initialize Nexus at (0,0) if not already built
    setHexBuildings(prev => {
      if (prev['0,0']) return prev; // Already has a building
      return { ...prev, '0,0': 'nexus' };
    });
  };

  /**
   * Exit planet view (return to system view)
   */
  const exitPlanetView = () => {
    setViewState('system');
    setViewPlanetId(null);
  };

  /**
   * Calculate energy capacity and usage for a specific system
   * Energy is now per-system, not global
   */
  const calculateSystemEnergy = (system) => {
    const techBonuses = calculateTechBonuses(tech().researched);
    const dockedShipsAtSystem = ships().filter(s => s.status === 'docked' && s.systemId === system.id);

    let capacity = 10; // Base capacity per system
    let usage = 0;

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

    // Docked ships at this system consume energy
    dockedShipsAtSystem.forEach(() => {
      usage += COLONY_SHIP.energyUsage;
    });

    // Apply tech bonus to capacity
    capacity *= techBonuses.energy * techBonuses.all;

    return { capacity: Math.floor(capacity), usage };
  };

  /**
   * Calculate production rates for a specific system
   * Returns { metals: number, credits: number } for that system
   */
  const calculateSystemProductionRates = (system, systemEnergy) => {
    const techBonuses = calculateTechBonuses(tech().researched);
    const mult = RESOURCE_MULTIPLIERS[system.resources] || 1;
    const buildings = system.buildings || {};

    // Efficiency penalty if this system is over energy capacity
    const efficiencyMult = systemEnergy.usage > systemEnergy.capacity ? 0.5 : 1.0;

    // Metals production (stays in this system)
    const oreMineLevel = buildings.oreMine?.level || 0;
    let metalsRate = oreMineLevel * BUILDINGS.oreMine.production.metals * mult;
    metalsRate *= techBonuses.metals * techBonuses.all * efficiencyMult;

    // Credits production (goes to global pool)
    const tradeHubLevel = buildings.tradeHub?.level || 0;
    let systemCreditsRate = tradeHubLevel * BUILDINGS.tradeHub.production.credits * mult;
    systemCreditsRate *= techBonuses.credits * techBonuses.all * efficiencyMult;

    return { metals: metalsRate, credits: systemCreditsRate };
  };

  /**
   * Calculate total credits rate from all systems plus trade income
   */
  const calculateTotalCreditsRate = () => {
    const galaxy = galaxyData();
    const ownedSystems = galaxy.systems.filter(s => s.owner === 'Player');
    const techBonuses = calculateTechBonuses(tech().researched);

    let totalCreditsRate = BASE_CREDIT_RATE;

    ownedSystems.forEach(system => {
      const energy = calculateSystemEnergy(system);
      const rates = calculateSystemProductionRates(system, energy);
      totalCreditsRate += rates.credits;
    });

    // Add income from metal trade flows (inter-system trades)
    const flows = tradeFlows();
    const totalMetalTraded = flows.flows.reduce((sum, flow) => sum + flow.amount, 0);
    totalCreditsRate += totalMetalTraded * TRADE_INCOME_PER_METAL;

    // Add income from local consumption (production satisfying local demand)
    ownedSystems.forEach(system => {
      const oreMineLevel = system.buildings?.oreMine?.level || 0;
      const production = oreMineLevel * BUILDINGS.oreMine.supplyPerLevel;
      const demand = system.market?.metals?.demand || 0;
      const localConsumption = Math.min(production, demand);

      // Local consumption generates credits just like exports
      totalCreditsRate += localConsumption * TRADE_INCOME_PER_METAL;
    });

    return totalCreditsRate;
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
        constructionQueue: [],
        // Initialize local resources for new colony
        localResources: { metals: 50 }, // Starting metals bonus for new colonies
        localEnergy: { capacity: 10, usage: 0 },
        productionRates: { metals: 0, credits: 0 }
      };
    });

    setGalaxyData({ ...galaxy, systems: updatedSystems });
    // No longer add global metals - colony gets local starting metals instead
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
   * Update FTL construction progress and complete when done
   */
  const updateFTLConstruction = () => {
    const construction = ftlConstruction();
    if (!construction) return;

    const now = Date.now();
    const elapsed = now - construction.startTime;

    if (elapsed >= construction.duration) {
      // FTL construction complete - add to built FTLs
      setBuiltFTLs(prev => new Set([...prev, construction.tetherId]));
      setFtlConstruction(null);
      console.log(`✅ FTL construction complete: ${construction.tetherId}`);
    }
  };

  /**
   * Update hex building construction queue
   */
  const updateHexConstruction = () => {
    const queue = hexConstructionQueue();
    if (queue.length === 0) return;

    const now = Date.now();
    let modified = false;

    const updatedQueue = queue.filter(item => {
      const elapsed = now - item.startTime;
      if (elapsed >= item.duration) {
        // Construction complete - add building to hex
        setHexBuildings(prev => ({ ...prev, [item.hexId]: item.buildingKey }));
        modified = true;
        console.log(`✅ Hex building complete: ${item.buildingKey} at ${item.hexId}`);
        return false; // Remove from queue
      }
      return true; // Keep in queue
    });

    if (modified) {
      setHexConstructionQueue(updatedQueue);
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

    // Calculate total credits rate and update global credits
    const totalCreditsRate = calculateTotalCreditsRate();
    setCreditsRate(totalCreditsRate);
    setCredits(c => c + totalCreditsRate * deltaSec);

    // Update per-system resources (metals, energy) on each owned system
    const galaxy = galaxyData();
    let systemsModified = false;

    const updatedSystems = galaxy.systems.map(system => {
      if (system.owner !== 'Player') return system;

      // Calculate this system's energy state
      const energy = calculateSystemEnergy(system);

      // Calculate this system's production rates
      const rates = calculateSystemProductionRates(system, energy);

      // Update local metals
      const currentMetals = system.localResources?.metals ?? 100; // Default starting metals
      const newMetals = currentMetals + rates.metals * deltaSec;

      // Check if anything changed
      const prevEnergy = system.localEnergy;
      const prevRates = system.productionRates;
      const prevMetals = system.localResources?.metals;

      if (prevEnergy?.capacity !== energy.capacity ||
          prevEnergy?.usage !== energy.usage ||
          prevRates?.metals !== rates.metals ||
          prevRates?.credits !== rates.credits ||
          prevMetals !== newMetals) {
        systemsModified = true;
        return {
          ...system,
          localResources: { metals: newMetals },
          localEnergy: energy,
          productionRates: rates
        };
      }

      return system;
    });

    if (systemsModified) {
      setGalaxyData({ ...galaxy, systems: updatedSystems });
    }

    // Update construction queues
    updateConstructionQueues(deltaMs);

    // Update ship positions
    updateShipPositions(deltaMs);

    // Update scan progress
    updateScanProgress();

    // Update FTL construction
    updateFTLConstruction();

    // Update hex building construction
    updateHexConstruction();

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
   * Credits are deducted from the global pool
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

    // Check credits
    const globalCredits = credits();
    if (globalCredits < cost.credits) {
      return false;
    }

    // Deduct credits from global pool
    setCredits(c => c - cost.credits);

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
   * Both systems connected by the tether must be scanned (Player-owned)
   * Now queues construction instead of instant build
   */
  const buildFTL = (tetherId) => {
    // Can't build if already constructing an FTL
    if (ftlConstruction()) {
      console.log('❌ Already constructing an FTL tether');
      return false;
    }

    const result = buildFTLLogic(
      tetherId,
      galaxyData(),
      { credits: credits() }, // Pass credits in expected format
      builtFTLs()
    );

    if (!result.success) {
      return false;
    }

    // Deduct credits immediately
    setCredits(result.newCredits);

    // Calculate distance-based build time
    const cleanId = tetherId.replace(/^route-/, '');
    const [sourceId, targetId] = cleanId.split('-').map(Number);
    const galaxy = galaxyData();
    const source = galaxy.systems.find(s => s.id === sourceId);
    const target = galaxy.systems.find(s => s.id === targetId);

    // Calculate distance and build time (5 seconds base + 10ms per unit distance)
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const FTL_BUILD_TIME = 5000 + Math.floor(distance * 10); // 5-10 seconds typically

    // Start construction
    setFtlConstruction({
      tetherId,
      startTime: Date.now(),
      duration: FTL_BUILD_TIME
    });

    console.log(`🔨 Started FTL construction on ${tetherId}, duration: ${FTL_BUILD_TIME}ms`);
    return true;
  };

  /**
   * Cancel FTL construction (no refund)
   */
  const cancelFTLConstruction = () => {
    setFtlConstruction(null);
  };

  /**
   * Scan a system (costs credits, takes 30s + 5s per hop from home)
   */
  const scanSystem = (systemId) => {
    const currentCredits = credits();

    // Can't scan if already scanning
    if (scanningSystem()) {
      return false;
    }

    if (currentCredits < SCAN_COST) {
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
    setCredits(c => c - SCAN_COST);

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
   * Start building construction on a hex (10 second build time)
   */
  const startHexBuilding = (hexId, buildingKey) => {
    // Check if hex already has a building
    if (hexBuildings()[hexId]) {
      console.log(`❌ Hex ${hexId} already has a building`);
      return false;
    }

    // Check if already constructing on this hex
    if (hexConstructionQueue().some(item => item.hexId === hexId)) {
      console.log(`❌ Already constructing on hex ${hexId}`);
      return false;
    }

    // Add to construction queue
    setHexConstructionQueue(prev => [...prev, {
      hexId,
      buildingKey,
      startTime: Date.now(),
      duration: 10000 // 10 seconds
    }]);

    console.log(`🔨 Started building ${buildingKey} on hex ${hexId}`);
    return true;
  };

  /**
   * Demolish a building on a hex
   */
  const demolishHexBuilding = (hexId) => {
    const building = hexBuildings()[hexId];
    if (!building) {
      console.log(`❌ No building on hex ${hexId}`);
      return false;
    }

    // Can't demolish Nexus
    if (building === 'nexus') {
      console.log(`❌ Cannot demolish Nexus building`);
      return false;
    }

    // Remove building
    setHexBuildings(prev => {
      const updated = { ...prev };
      delete updated[hexId];
      return updated;
    });

    console.log(`💥 Demolished ${building} on hex ${hexId}`);
    return true;
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

    // Check credits (global)
    if (credits() < techDef.cost) return false;

    // Deduct credits
    setCredits(c => c - techDef.cost);

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
   * Helper to initialize a fresh galaxy when loading fails or no save exists
   */
  const bootstrapNewGalaxy = () => {
    console.log('✨ Bootstrapping new galaxy...');
    const newGalaxy = generateGalaxy();

    setGalaxyData(newGalaxy);
    return false;
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
          bootstrapNewGalaxy(); // Just bootstrap, don't return its value
          return false; // Indicate load failed
        }

        // Validate saved data - detect corruption
        console.log('🔍 Validating save data integrity...');
        const playerSystems = state.galaxyData?.systems?.filter(s => s.owner === 'Player') || [];
        // Note: homeSystemId can be 0 (Sol has id 0), so we must check for null/undefined explicitly
        const hasHome = state.homeSystemId !== null && state.homeSystemId !== undefined;
        const homeExists = state.galaxyData?.systems?.some(s => s.id === state.homeSystemId);

        console.log(`   Player systems: ${playerSystems.length}`);
        console.log(`   Home system ID: ${hasHome ? state.homeSystemId : 'none'}`);
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
          bootstrapNewGalaxy(); // Just bootstrap, don't return its value
          return false; // Indicate load failed
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

        // Migrate old global resources to per-system if needed
        const savedCredits = state.credits ?? state.resources?.credits ?? 200;
        const hasOldGlobalMetals = state.resources?.metals !== undefined || state.resources?.ore !== undefined;
        const oldGlobalMetals = state.resources?.metals ?? state.resources?.ore ?? 100;

        // Migrate per-system resources
        const systemsWithLocalResources = migratedGalaxyData.systems.map(system => {
          if (system.owner !== 'Player') return system;

          // If system already has localResources, use them; otherwise migrate from old format
          if (system.localResources !== undefined) {
            return system;
          }

          // Old saves: distribute old global metals proportionally or give default
          const defaultMetals = hasOldGlobalMetals ? Math.min(100, oldGlobalMetals) : 100;
          return {
            ...system,
            localResources: { metals: defaultMetals },
            localEnergy: system.localEnergy || { capacity: 10, usage: 0 },
            productionRates: system.productionRates || { metals: 0, credits: 0 }
          };
        });

        setGalaxyData({ ...migratedGalaxyData, systems: systemsWithLocalResources });
        // Note: homeSystemId can be 0 (Sol has id 0), so we must handle null/undefined explicitly
        setHomeSystemId(state.homeSystemId ?? null);
        // Set global credits only
        setCredits(savedCredits);
        setShips(state.ships || []);
        setBuiltFTLs(new Set(migratedBuiltFTLs));
        setTech(state.tech || { researched: [], current: null });
        setScanningSystem(state.scanningSystem || null);
        setFtlConstruction(state.ftlConstruction || null);
        setZoomLevel(state.zoomLevel || 0.45);
        setHexBuildings(state.hexBuildings || {});
        setHexConstructionQueue(state.hexConstructionQueue || []);

        // Restore view state - but reset to galaxy if in planet view (transient) or if system view has no valid system
        // Note: viewSystemId can be 0 (Sol has id 0), so we check with !== null && !== undefined
        const savedViewSystemId = state.viewSystemId;
        const hasValidViewSystem = savedViewSystemId !== null && savedViewSystemId !== undefined &&
          systemsWithLocalResources.some(s => s.id === savedViewSystemId);

        const shouldRestoreSystemView = state.viewState === 'system' && hasValidViewSystem;
        const restoredViewState = shouldRestoreSystemView ? 'system' : 'galaxy';

        setViewState(restoredViewState);
        setViewSystemId(shouldRestoreSystemView ? savedViewSystemId : null);

        // Mark game as active if we have a home system
        // Note: homeSystemId can be 0 (Sol has id 0), so use hasHome which already checks explicitly
        if (hasHome) {
          setIsGameActive(true);
        }

        console.log('✓ Game state restored successfully');
        console.log(`   Credits: ${savedCredits}`);
        console.log(`   Ships: ${state.ships?.length || 0}`);
        console.log(`   Built FTLs: ${migratedBuiltFTLs.length}`);
        console.log(`   Tech researched: ${state.tech?.researched?.length || 0}`);

        // Energy and production will be recalculated from buildings per system
        startGameLoop();
        return true; // Indicate successful load
      }
    } catch (error) {
      const errorMsg = `Unexpected error loading save file`;
      console.error('❌ SAVE LOAD FAILED - UNEXPECTED ERROR');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded! Save file is too large.');
        alert('⚠️ Save Failed\n\nLocalStorage quota exceeded. Your save file is too large.\n\nThis is a critical issue. Please report it.');
      } else {
        console.error('Stack trace:', error.stack);
        alert(`⚠️ Save Failed\n\nFailed to save game state.\n\nTechnical details: ${error.message}\n\nYour progress may be lost. Please report this issue.`);
      }
      localStorage.removeItem(STORAGE_KEY);
      // No need to bootstrap here, as the App component will handle what to do if loadState returns false
    }

    // If no saved state, generate new galaxy and indicate failure to load (as there was no *saved* game)
    console.log('📂 No saved game found, generating new galaxy');
    bootstrapNewGalaxy(); // Just bootstrap, don't return its value
    return false; // Indicate load failed (no saved game was found)
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
      // Note: home === 0 is valid (Sol has id 0), so we must check for null explicitly
      const playerSystems = galaxy.systems.filter(s => s.owner === 'Player');
      if (playerSystems.length > 0 && home === null) {
        console.error('💾 Save skipped: CORRUPTION PREVENTION');
        console.error(`   Player owns ${playerSystems.length} systems but homeSystemId is null`);
        console.error(`   Player systems:`, playerSystems.map(s => `${s.name} (${s.id})`));
        console.error('   This prevents saving a corrupted state');
        return;
      }

      const state = {
        galaxyData: galaxy,
        homeSystemId: home,
        credits: credits(), // Global credits only
        // Note: metals and energy are now stored per-system in galaxyData.systems[].localResources
        ships: ships(),
        builtFTLs: [...builtFTLs()],
        tech: tech(),
        scanningSystem: scanningSystem(),
        ftlConstruction: ftlConstruction(),
        zoomLevel: zoomLevel(),
        viewState: viewState(),
        viewSystemId: viewSystemId(),
        hexBuildings: hexBuildings(),
        hexConstructionQueue: hexConstructionQueue(),
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
      constructionQueue: undefined,
      localResources: undefined,
      localEnergy: undefined,
      productionRates: undefined
    }));

    // Set all state synchronously so galaxy is ready to display
    setGalaxyData({ ...newGalaxy, systems: resetSystems });
    setSelectedSystemId(null);
    setSelectedTetherId(null);
    setHomeSystemId(null);
    setCredits(200); // Global credits only
    setShips([]);
    setBuiltFTLs(new Set());
    setTech({ researched: [], current: null });
    setRipples([]);
    setZoomLevel(0.45);
    setViewState('galaxy');
    setViewSystemId(null);
    setHexBuildings({});
    setHexConstructionQueue([]);
    startGameLoop();

    // NOW trigger the fade-in (galaxy data is ready)
    setIsGameActive(true);

    // Pick a random home system after 1 second
    setTimeout(() => {
      if (resetSystems.length > 0) {
        // Find the designated home system (Sol) or fall back to a random one
        const designatedHome = resetSystems.find(s => s.isHomeSystem);

        // Find an unclaimed system with good resources (for fallback)
        const candidates = resetSystems.filter(s => s.resources !== 'Poor' && s.owner === 'Unclaimed');

        const homeSystem = designatedHome || candidates[Math.floor(Math.random() * candidates.length)] || resetSystems.find(s => s.owner === 'Unclaimed');

        if (homeSystem) {
          // Start fog transition BEFORE setting home (keeps all systems visible during fade)
          setFogTransitioning(true);

          setHomeSystemId(homeSystem.id);

          // Initialize home system as Player-owned with local resources
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
              constructionQueue: [],
              localResources: { metals: 100 }, // Starting metals for home system
              localEnergy: { capacity: 10, usage: 0 },
              productionRates: { metals: 0, credits: 0 }
            };
          });

          setGalaxyData({ ...newGalaxy, systems: updatedSystems });

          // End fog transition after fade completes
          setTimeout(() => setFogTransitioning(false), 800);

          // Save immediately (bypass debounce) to ensure home system persists
          const state = {
            galaxyData: { ...newGalaxy, systems: updatedSystems },
            homeSystemId: homeSystem.id,
            credits: credits(),
            ships: ships(),
            builtFTLs: [...builtFTLs()],
            tech: tech(),
            scanningSystem: null,
            ftlConstruction: null,
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
    viewPlanetId,

    // Hex grid state
    hexBuildings,
    setHexBuildings,
    hexConstructionQueue,

    // Global resources (credits only - metals and energy are per-system now)
    credits,
    setCredits,
    creditsRate,

    // Per-system resource helpers
    getSystemResources: (systemId) => {
      const system = galaxyData().systems.find(s => s.id === systemId);
      if (!system || system.owner !== 'Player') return null;
      return {
        metals: system.localResources?.metals ?? 0,
        energy: system.localEnergy ?? { capacity: 10, usage: 0 },
        productionRates: system.productionRates ?? { metals: 0, credits: 0 }
      };
    },

    // Real-time state
    ships,
    setShips,
    tech,
    setTech,
    visibleSystems, // Fog of War - visible systems within 2 hops
    newlyRevealedIds, // Systems that just became visible (for fade-in animation)
    tradeFlows, // Trade flow allocation - { systemSatisfaction, routeThroughput }
    isSystemVisible, // Check if a system is visible
    isRouteVisible, // Check if a route is visible
    shouldShowAllSystems, // Check if all systems should be shown (cinematic/transition)

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
    ftlConstruction,
    cancelFTLConstruction,
    findPath,
    enterSystemView,
    exitSystemView,
    enterPlanetView,
    exitPlanetView,
    startHexBuilding,
    demolishHexBuilding,

    // Game loop control
    startGameLoop,
    stopGameLoop
  };
}

export {
  BUILDINGS,
  COLONY_SHIP,
  getBuildingCost,
  TECH_TREE,
  calculateVisibleSystems
};
