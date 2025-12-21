import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createGameState, BUILDINGS, getBuildingCost, calculateVisibleSystems } from './gameState';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Helper to set up resources on a system
// Since resources are now per-system (metals, energy) and global (credits)
const setTestResources = (gameState, systemId, { metals = 100, credits = 200 }) => {
  gameState.setCredits(credits);
  const galaxy = gameState.galaxyData();
  const updatedSystems = galaxy.systems.map(s =>
    s.id === systemId ? { ...s, localResources: { metals } } : s
  );
  gameState.setGalaxyData({ ...galaxy, systems: updatedSystems });
};

describe('gameState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Bug #3: Corruption detection in loadState', () => {
    it('should detect corrupted save with Player systems but no homeSystemId', () => {
      const corruptedState = {
        galaxyData: {
          systems: [
            { id: 1, name: 'System A', owner: 'Player', x: 500, y: 500 },
            { id: 2, name: 'System B', owner: 'Unclaimed', x: 600, y: 600 }
          ],
          routes: []
        },
        homeSystemId: null, // No home system - corruption!
        resources: { metals: 100, credits: 200 }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(corruptedState));

      let result;
      createRoot(dispose => {
        const gameState = createGameState();
        result = gameState.loadState();
        gameState.stopGameLoop();
        dispose();
      });

      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sol3000_game_state');
    });

    it('should detect corrupted save with homeSystemId pointing to non-existent system', () => {
      const corruptedState = {
        galaxyData: {
          systems: [
            { id: 1, name: 'System A', owner: 'Player', x: 500, y: 500 },
            { id: 2, name: 'System B', owner: 'Unclaimed', x: 600, y: 600 }
          ],
          routes: []
        },
        homeSystemId: 999, // Points to non-existent system - corruption!
        resources: { metals: 100, credits: 200 }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(corruptedState));

      let result;
      createRoot(dispose => {
        const gameState = createGameState();
        result = gameState.loadState();
        gameState.stopGameLoop();
        dispose();
      });

      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sol3000_game_state');
    });

    it('should load valid save data successfully', () => {
      const validState = {
        galaxyData: {
          systems: [
            { id: 1, name: 'System A', owner: 'Player', x: 500, y: 500 },
            { id: 2, name: 'System B', owner: 'Unclaimed', x: 600, y: 600 }
          ],
          routes: []
        },
        homeSystemId: 1, // Valid home system
        resources: { metals: 150, credits: 300 }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validState));

      let result;
      let homeId;
      createRoot(dispose => {
        const gameState = createGameState();
        result = gameState.loadState();
        homeId = gameState.homeSystemId();
        gameState.stopGameLoop();
        dispose();
      });

      expect(result).toBe(true);
      expect(homeId).toBe(1);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('should accept save with no Player systems (valid initial state)', () => {
      const validState = {
        galaxyData: {
          systems: [
            { id: 1, name: 'System A', owner: 'Unclaimed', x: 500, y: 500 },
            { id: 2, name: 'System B', owner: 'Enemy', x: 600, y: 600 }
          ],
          routes: []
        },
        homeSystemId: null, // No home yet - valid during initial setup
        resources: { metals: 100, credits: 200 }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validState));

      let result;
      createRoot(dispose => {
        const gameState = createGameState();
        result = gameState.loadState();
        gameState.stopGameLoop();
        dispose();
      });

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('should correctly handle homeSystemId of 0 (Sol has id 0)', () => {
      // This tests the fix for the bug where homeSystemId === 0 was treated as falsy
      const validState = {
        galaxyData: {
          systems: [
            { id: 0, name: 'Sol', owner: 'Player', x: 500, y: 500, isHomeSystem: true },
            { id: 1, name: 'System B', owner: 'Unclaimed', x: 600, y: 600 }
          ],
          routes: []
        },
        homeSystemId: 0, // Sol has id 0 - must be treated as valid, not falsy!
        resources: { metals: 150, credits: 300 }
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validState));

      let result;
      let homeId;
      createRoot(dispose => {
        const gameState = createGameState();
        result = gameState.loadState();
        homeId = gameState.homeSystemId();
        gameState.stopGameLoop();
        dispose();
      });

      expect(result).toBe(true);
      expect(homeId).toBe(0); // Must be exactly 0, not null or undefined
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('Bug #2: Immediate save after home system assignment', () => {
    it('should save immediately after newGame sets home system', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();

        // Clear mock to track new calls
        localStorageMock.setItem.mockClear();

        gameState.newGame();

        // Fast-forward past the 1-second delay for home system assignment
        vi.advanceTimersByTime(1100);

        // Should have saved immediately (not waiting for debounce)
        const saveCall = localStorageMock.setItem.mock.calls.find(
          call => call[0] === 'sol3000_game_state'
        );

        expect(saveCall).toBeDefined();

        const savedState = JSON.parse(saveCall[1]);
        expect(savedState.homeSystemId).not.toBeNull();

        // Verify the home system exists and is Player-owned
        const homeSystem = savedState.galaxyData.systems.find(
          s => s.id === savedState.homeSystemId
        );
        expect(homeSystem).toBeDefined();
        expect(homeSystem.owner).toBe('Player');

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should have exactly one Player system after newGame', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const galaxy = gameState.galaxyData();
        const playerSystems = galaxy.systems.filter(s => s.owner === 'Player');

        expect(playerSystems).toHaveLength(1);
        expect(playerSystems[0].id).toBe(gameState.homeSystemId());

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should prioritize the designated home system (Sol) if present', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const galaxy = gameState.galaxyData();
        const homeId = gameState.homeSystemId();
        const homeSystem = galaxy.systems.find(s => s.id === homeId);

        expect(homeSystem).toBeDefined();
        // The generator ensures the designated home system is 'Sol' and has isHomeSystem: true
        // If our newGame logic works, it should have picked this specific system.
        expect(homeSystem.name).toBe('Sol');
        expect(homeSystem.isHomeSystem).toBe(true);

        gameState.stopGameLoop();
        dispose();
      });
    });
  });

  describe('Building costs', () => {
    it('should calculate building cost correctly', () => {
      const level0Cost = getBuildingCost('oreMine', 0);
      expect(level0Cost.credits).toBe(50);

      const level1Cost = getBuildingCost('oreMine', 1);
      expect(level1Cost.credits).toBe(Math.floor(50 * 1.15));

      const level2Cost = getBuildingCost('oreMine', 2);
      expect(level2Cost.credits).toBe(Math.floor(50 * 1.15 * 1.15));
    });
  });

  describe('BUILDINGS constant', () => {
    it('should have all required building types', () => {
      expect(BUILDINGS).toHaveProperty('oreMine');
      expect(BUILDINGS).toHaveProperty('solarPlant');
      expect(BUILDINGS).toHaveProperty('tradeHub');
      expect(BUILDINGS).toHaveProperty('shipyard');
    });

    it('should have valid production values', () => {
      expect(BUILDINGS.oreMine.production.metals).toBeGreaterThan(0);
      expect(BUILDINGS.solarPlant.energyCapacity).toBeGreaterThan(0); // Provides capacity, not production
      expect(BUILDINGS.tradeHub.production.credits).toBeGreaterThan(0);
    });

    it('should have valid energy usage values', () => {
      expect(BUILDINGS.oreMine.energyUsage).toBeGreaterThan(0);
      expect(BUILDINGS.solarPlant.energyUsage).toBe(0); // Solar plants don't use energy
      expect(BUILDINGS.tradeHub.energyUsage).toBeGreaterThan(0);
      expect(BUILDINGS.shipyard.energyUsage).toBeGreaterThan(0);
    });
  });

  describe('Construction queue', () => {
    it('should queue multiple buildings in order', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        // Wait for home system to be set
        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();
        expect(homeId).not.toBeNull();

        // Give enough resources for multiple buildings
        setTestResources(gameState, homeId, { metals: 1000, credits: 1000 });

        // Queue two buildings
        const result1 = gameState.startConstruction(homeId, 'building', 'oreMine');
        const result2 = gameState.startConstruction(homeId, 'building', 'solarPlant');

        expect(result1).toBe(true);
        expect(result2).toBe(true);

        // Check the construction queue
        const galaxy = gameState.galaxyData();
        const homeSystem = galaxy.systems.find(s => s.id === homeId);
        const queue = homeSystem.constructionQueue;

        expect(queue).toHaveLength(2);
        expect(queue[0].target).toBe('oreMine'); // First in queue
        expect(queue[1].target).toBe('solarPlant'); // Second in queue

        // Both should have startTime set (for UI progress calculation)
        expect(queue[0].startTime).toBeDefined();
        expect(queue[1].startTime).toBeDefined();

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should complete first building before starting second', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();
        setTestResources(gameState, homeId, { metals: 1000, credits: 1000 });

        // Queue two buildings
        gameState.startConstruction(homeId, 'building', 'solarPlant'); // 2s build time
        gameState.startConstruction(homeId, 'building', 'oreMine'); // 3s build time

        // Fast-forward past first building's build time (2s), plus some time into second (1.5s)
        // Total 3.5s. Solar (2s) done. Ore (3s) started at 2s, elapsed 1.5s -> NOT done.
        vi.advanceTimersByTime(3500);

        const galaxy = gameState.galaxyData();
        const homeSystem = galaxy.systems.find(s => s.id === homeId);

        // First building should be complete (level 1)
        expect(homeSystem.buildings.solarPlant.level).toBe(1);

        // Second building should still be in queue (or just started)
        // oreMine should still be level 0 since it takes 3s (total 5s seq)
        expect(homeSystem.buildings.oreMine.level).toBe(0);

        // Queue should now only have oreMine
        expect(homeSystem.constructionQueue).toHaveLength(1);
        expect(homeSystem.constructionQueue[0].target).toBe('oreMine');

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('first queue item is active, rest are waiting', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();
        setTestResources(gameState, homeId, { metals: 2000, credits: 2000 });

        // Queue three buildings
        gameState.startConstruction(homeId, 'building', 'oreMine');
        gameState.startConstruction(homeId, 'building', 'solarPlant');
        gameState.startConstruction(homeId, 'building', 'tradeHub');

        const galaxy = gameState.galaxyData();
        const homeSystem = galaxy.systems.find(s => s.id === homeId);
        const queue = homeSystem.constructionQueue;

        expect(queue).toHaveLength(3);

        // The first item (index 0) is the "active" one being built
        // UI should show progress bar only for queue[0]
        // UI should show "Queued" for queue[1] and queue[2]
        expect(queue[0].target).toBe('oreMine');
        expect(queue[1].target).toBe('solarPlant');
        expect(queue[2].target).toBe('tradeHub');

        gameState.stopGameLoop();
        dispose();
      });
    });
  });

  describe('Fog of War', () => {
    it('should calculate visibility from all colonized planets, not just home', () => {
      // Create a simple test galaxy with a linear chain of systems
      const galaxy = {
        systems: [
          { id: 1, name: 'Home', owner: 'Player', x: 100, y: 100 },
          { id: 2, name: 'Hop1FromHome', owner: 'Unclaimed', x: 200, y: 100 },
          { id: 3, name: 'Hop2FromHome', owner: 'Unclaimed', x: 300, y: 100 },
          { id: 4, name: 'Colony', owner: 'Player', x: 400, y: 100 },
          { id: 5, name: 'Hop1FromColony', owner: 'Unclaimed', x: 500, y: 100 },
          { id: 6, name: 'Hop2FromColony', owner: 'Unclaimed', x: 600, y: 100 },
          { id: 7, name: 'Hop3FromBoth', owner: 'Unclaimed', x: 700, y: 100 }
        ],
        routes: [
          { source: { id: 1 }, target: { id: 2 } },
          { source: { id: 2 }, target: { id: 3 } },
          { source: { id: 3 }, target: { id: 4 } },
          { source: { id: 4 }, target: { id: 5 } },
          { source: { id: 5 }, target: { id: 6 } },
          { source: { id: 6 }, target: { id: 7 } }
        ]
      };

      const result = calculateVisibleSystems(galaxy, 1); // Home system is id 1

      // Should see 2 hops from BOTH Player systems (id 1 and id 4)
      // From Home (id 1): 1, 2, 3
      // From Colony (id 4): 4, 5, 6
      // System 7 is 3 hops from both, so not visible
      expect(result.visibleIds.has(1)).toBe(true);  // Home
      expect(result.visibleIds.has(2)).toBe(true);  // 1 hop from home
      expect(result.visibleIds.has(3)).toBe(true);  // 2 hops from home
      expect(result.visibleIds.has(4)).toBe(true);  // Colony
      expect(result.visibleIds.has(5)).toBe(true);  // 1 hop from colony
      expect(result.visibleIds.has(6)).toBe(true);  // 2 hops from colony
      expect(result.visibleIds.has(7)).toBe(false); // 3 hops from both

      // Should have tether routes from the 2-hop systems (3 and 6) to 3-hop systems
      expect(result.tetherRoutes.length).toBeGreaterThan(0);
    });

    it('should show only home system visibility when only one colony exists', () => {
      const galaxy = {
        systems: [
          { id: 1, name: 'Home', owner: 'Player', x: 100, y: 100 },
          { id: 2, name: 'Hop1', owner: 'Unclaimed', x: 200, y: 100 },
          { id: 3, name: 'Hop2', owner: 'Unclaimed', x: 300, y: 100 },
          { id: 4, name: 'Hop3', owner: 'Unclaimed', x: 400, y: 100 }
        ],
        routes: [
          { source: { id: 1 }, target: { id: 2 } },
          { source: { id: 2 }, target: { id: 3 } },
          { source: { id: 3 }, target: { id: 4 } }
        ]
      };

      const result = calculateVisibleSystems(galaxy, 1);

      // Should see 2 hops from home: 1, 2, 3
      expect(result.visibleIds.has(1)).toBe(true);
      expect(result.visibleIds.has(2)).toBe(true);
      expect(result.visibleIds.has(3)).toBe(true);
      expect(result.visibleIds.has(4)).toBe(false); // 3 hops away
    });
  });

  describe('Edge Cases - Resource Overflow Protection', () => {
    it('should prevent resource overflow for very long play sessions', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();

        // Build metals extractors to increase production dramatically
        setTestResources(gameState, homeId, { metals: 950000000, credits: 950000000 }); // Very close to cap of 1e9

        // Simulate continued gameplay to verify caps are enforced
        for (let i = 0; i < 1000; i++) {
          vi.advanceTimersByTime(100);
        }

        const systemResources = gameState.getSystemResources(homeId);
        const globalCredits = gameState.credits();
        // Resources should never exceed 1 billion (1e9) even with production
        expect(systemResources.metals).toBeLessThanOrEqual(1e9);
        expect(globalCredits).toBeLessThanOrEqual(1e9);
        // Resources may fluctuate due to construction costs and production
        // Just verify they don't overflow
        expect(Number.isFinite(systemResources.metals)).toBe(true);
        expect(Number.isFinite(globalCredits)).toBe(true);

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should handle zero production rates correctly', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();

        // Start with no buildings
        const initialResources = gameState.getSystemResources(homeId);
        const initialMetals = initialResources?.metals ?? 0;

        // Advance time
        vi.advanceTimersByTime(5000);

        const finalResources = gameState.getSystemResources(homeId);
        // Metals should increase slightly from initial mine, but not change much without energy
        expect(finalResources?.metals ?? 0).toBeGreaterThanOrEqual(initialMetals);

        gameState.stopGameLoop();
        dispose();
      });
    });
  });

  describe('Edge Cases - Building Construction', () => {
    it('should handle pathfinding to unreachable systems', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();
        setTestResources(gameState, homeId, { metals: 10000, credits: 10000 });

        // Build a shipyard and ship
        gameState.startConstruction(homeId, 'building', 'shipyard');
        vi.advanceTimersByTime(15000); // Wait for shipyard to complete

        // Build a colony ship
        gameState.startConstruction(homeId, 'ship', 'colonyShip');
        vi.advanceTimersByTime(20000); // Wait for ship to complete

        const ships = gameState.ships();
        const result = gameState.launchColonyShip(ships[0]?.id, 99999); // Try to send to non-existent system

        // Should fail gracefully (non-existent destination)
        expect(result).toBe(false);

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should handle construction with insufficient resources', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();
        setTestResources(gameState, homeId, { metals: 1, credits: 1 }); // Very low credits

        // Try to build expensive building (shipyard costs 300 credits)
        const result = gameState.startConstruction(homeId, 'building', 'shipyard');

        expect(result).toBe(false); // Should fail
        expect(gameState.credits()).toBe(1); // Credits unchanged

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should prevent building without required shipyard', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();
        setTestResources(gameState, homeId, { metals: 10000, credits: 10000 });

        // Try to build colony ship without shipyard
        const result = gameState.startConstruction(homeId, 'ship', 'colonyShip');

        expect(result).toBe(false); // Should fail - no shipyard

        gameState.stopGameLoop();
        dispose();
      });
    });
  });

  describe('Edge Cases - Tech Research', () => {
    it('should prevent research without prerequisites', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        gameState.setCredits(10000);

        // Try to research advanced tech without prerequisites
        const result = gameState.startResearch('warpDrives'); // Requires advancedReactors

        expect(result).toBe(false); // Should fail - missing prerequisites

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should prevent researching same tech twice', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        gameState.setCredits(10000);

        // Research first tech
        const result1 = gameState.startResearch('efficientMining');
        expect(result1).toBe(true);

        // Complete research
        vi.advanceTimersByTime(15000);

        // Try to research again
        gameState.setCredits(10000);
        const result2 = gameState.startResearch('efficientMining');
        expect(result2).toBe(false); // Should fail - already researched

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should prevent concurrent research', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        gameState.setCredits(10000);

        // Start first research
        gameState.startResearch('efficientMining');

        // Try to start another while first is ongoing
        gameState.setCredits(10000);
        const result = gameState.startResearch('tradeNetworks');

        expect(result).toBe(false); // Should fail - already researching

        gameState.stopGameLoop();
        dispose();
      });
    });
  });

  describe('Edge Cases - Building Cost Calculation', () => {
    it('should calculate exponential building costs correctly', () => {
      const cost0 = getBuildingCost('oreMine', 0);
      const cost1 = getBuildingCost('oreMine', 1);
      const cost2 = getBuildingCost('oreMine', 2);

      expect(cost1.credits).toBeGreaterThan(cost0.credits);
      expect(cost2.credits).toBeGreaterThan(cost1.credits);

      // Verify exponential scaling (factor = 1.15)
      expect(cost1.credits).toBe(Math.floor(cost0.credits * 1.15));
      expect(cost2.credits).toBe(Math.floor(cost0.credits * Math.pow(1.15, 2)));
    });

    it('should handle high building levels without overflow', () => {
      // Test very high levels to ensure no integer overflow
      const costHigh = getBuildingCost('oreMine', 50);

      expect(costHigh.credits).toBeGreaterThan(0);
      expect(costHigh.credits).toBeLessThan(1e10); // Sanity check
      expect(Number.isFinite(costHigh.credits)).toBe(true);
    });
  });

  describe('Edge Cases - Scanning', () => {
    it('should prevent scanning while already scanning', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();
        gameState.setCredits(10000);

        const galaxy = gameState.galaxyData();
        const targetSystem = galaxy.systems.find(s => s.id !== homeId && s.owner === 'Unclaimed');

        // Start first scan
        gameState.scanSystem(targetSystem.id);

        // Try to start another scan
        const result = gameState.scanSystem(targetSystem.id);
        expect(result).toBe(false); // Should fail - already scanning

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should prevent scanning with insufficient credits', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();
        gameState.setCredits(10); // Not enough credits

        const galaxy = gameState.galaxyData();
        const targetSystem = galaxy.systems.find(s => s.id !== homeId && s.owner === 'Unclaimed');

        const result = gameState.scanSystem(targetSystem.id);
        expect(result).toBe(false); // Should fail - insufficient credits

        gameState.stopGameLoop();
        dispose();
      });
    });
  });

  describe('Edge Cases - Energy Management', () => {
    it('should calculate energy state with no buildings', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();
        const systemRes = gameState.getSystemResources(homeId);
        const energy = systemRes?.energy;

        // Should have starting capacity and usage values
        expect(energy).toBeDefined();
        expect(energy.capacity).toBeGreaterThan(0);
        expect(energy.usage).toBeGreaterThanOrEqual(0);
        expect(energy.usage).toBeLessThanOrEqual(energy.capacity);

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should handle energy deficits gracefully', () => {
      createRoot(dispose => {
        const gameState = createGameState();
        gameState.loadState();
        gameState.newGame();

        vi.advanceTimersByTime(1100);

        const homeId = gameState.homeSystemId();
        setTestResources(gameState, homeId, { metals: 50000, credits: 50000 });

        // Build 5 metals extractors to increase energy usage
        for (let i = 0; i < 5; i++) {
          gameState.startConstruction(homeId, 'building', 'oreMine');
        }

        // Fast forward through construction
        vi.advanceTimersByTime(50000);

        const systemRes = gameState.getSystemResources(homeId);
        const energy = systemRes?.energy;
        // Energy calculation should always produce valid numbers
        expect(energy).toBeDefined();
        expect(Number.isFinite(energy.capacity)).toBe(true);
        expect(Number.isFinite(energy.usage)).toBe(true);

        gameState.stopGameLoop();
        dispose();
      });
    });
  });

  describe('FTL Tether Building (Integration)', () => {
    it('should start FTL construction and deduct credits', () => {
      createRoot(dispose => {
        const gameState = createGameState();

        // Set up a galaxy with route between two Player-owned systems
        const galaxy = {
          systems: [
            { id: 1, name: 'Home', owner: 'Player', x: 500, y: 500, buildings: {}, localResources: { metals: 1000 } },
            { id: 2, name: 'System B', owner: 'Player', x: 600, y: 600, buildings: {}, localResources: { metals: 1000 } }
          ],
          routes: [
            { id: 'route-1-2', source: { id: 1, owner: 'Player' }, target: { id: 2, owner: 'Player' } }
          ]
        };

        gameState.setGalaxyData(galaxy);
        gameState.setHomeSystemId(1);
        gameState.setCredits(1000);
        gameState.startGameLoop();

        // Build FTL - should start construction, not instant build
        const result = gameState.buildFTL('route-1-2');
        expect(result).toBe(true);
        expect(gameState.ftlConstruction()).not.toBeNull();
        expect(gameState.ftlConstruction().tetherId).toBe('route-1-2');
        expect(gameState.builtFTLs().has('route-1-2')).toBe(false); // Not built yet
        expect(gameState.credits()).toBe(980); // 20 credits deducted immediately

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should complete FTL construction after duration', () => {
      vi.useFakeTimers();
      createRoot(dispose => {
        const gameState = createGameState();

        const galaxy = {
          systems: [
            { id: 1, name: 'Home', owner: 'Player', x: 500, y: 500, buildings: {}, localResources: { metals: 1000 } },
            { id: 2, name: 'System B', owner: 'Player', x: 600, y: 600, buildings: {}, localResources: { metals: 1000 } }
          ],
          routes: [
            { id: 'route-1-2', source: { id: 1, owner: 'Player' }, target: { id: 2, owner: 'Player' } }
          ]
        };

        gameState.setGalaxyData(galaxy);
        gameState.setHomeSystemId(1);
        gameState.setCredits(1000);
        gameState.startGameLoop();

        // Start FTL construction
        gameState.buildFTL('route-1-2');
        expect(gameState.ftlConstruction()).not.toBeNull();
        const duration = gameState.ftlConstruction().duration;

        // Advance time past construction duration
        vi.advanceTimersByTime(duration + 200);

        // Construction should be complete
        expect(gameState.ftlConstruction()).toBeNull();
        expect(gameState.builtFTLs().has('route-1-2')).toBe(true);

        gameState.stopGameLoop();
        dispose();
      });
      vi.useRealTimers();
    });

    it('should prevent building another FTL during construction', () => {
      createRoot(dispose => {
        const gameState = createGameState();

        const galaxy = {
          systems: [
            { id: 1, name: 'Home', owner: 'Player', x: 500, y: 500, buildings: {}, localResources: { metals: 1000 } },
            { id: 2, name: 'System B', owner: 'Player', x: 600, y: 600, buildings: {}, localResources: { metals: 1000 } },
            { id: 3, name: 'System C', owner: 'Player', x: 700, y: 700, buildings: {}, localResources: { metals: 1000 } }
          ],
          routes: [
            { id: 'route-1-2', source: { id: 1, owner: 'Player' }, target: { id: 2, owner: 'Player' } },
            { id: 'route-2-3', source: { id: 2, owner: 'Player' }, target: { id: 3, owner: 'Player' } }
          ]
        };

        gameState.setGalaxyData(galaxy);
        gameState.setHomeSystemId(1);
        gameState.setCredits(1000);
        gameState.startGameLoop();

        // Start first FTL construction
        const result1 = gameState.buildFTL('route-1-2');
        expect(result1).toBe(true);

        // Try to start another - should fail
        const result2 = gameState.buildFTL('route-2-3');
        expect(result2).toBe(false);

        // Only first construction should be active
        expect(gameState.ftlConstruction().tetherId).toBe('route-1-2');

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should allow cancelling FTL construction', () => {
      createRoot(dispose => {
        const gameState = createGameState();

        const galaxy = {
          systems: [
            { id: 1, name: 'Home', owner: 'Player', x: 500, y: 500, buildings: {}, localResources: { metals: 1000 } },
            { id: 2, name: 'System B', owner: 'Player', x: 600, y: 600, buildings: {}, localResources: { metals: 1000 } }
          ],
          routes: [
            { id: 'route-1-2', source: { id: 1, owner: 'Player' }, target: { id: 2, owner: 'Player' } }
          ]
        };

        gameState.setGalaxyData(galaxy);
        gameState.setHomeSystemId(1);
        gameState.setCredits(1000);
        gameState.startGameLoop();

        // Start FTL construction
        gameState.buildFTL('route-1-2');
        expect(gameState.ftlConstruction()).not.toBeNull();

        // Cancel construction
        gameState.cancelFTLConstruction();
        expect(gameState.ftlConstruction()).toBeNull();
        expect(gameState.builtFTLs().has('route-1-2')).toBe(false);

        // Credits are NOT refunded
        expect(gameState.credits()).toBe(980);

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should allow starting new FTL construction after cancellation', () => {
      createRoot(dispose => {
        const gameState = createGameState();

        const galaxy = {
          systems: [
            { id: 1, name: 'Home', owner: 'Player', x: 500, y: 500, buildings: {}, localResources: { metals: 1000 } },
            { id: 2, name: 'System B', owner: 'Player', x: 600, y: 600, buildings: {}, localResources: { metals: 1000 } },
            { id: 3, name: 'System C', owner: 'Player', x: 700, y: 700, buildings: {}, localResources: { metals: 1000 } }
          ],
          routes: [
            { id: 'route-1-2', source: { id: 1, owner: 'Player' }, target: { id: 2, owner: 'Player' } },
            { id: 'route-2-3', source: { id: 2, owner: 'Player' }, target: { id: 3, owner: 'Player' } }
          ]
        };

        gameState.setGalaxyData(galaxy);
        gameState.setHomeSystemId(1);
        gameState.setCredits(1000);
        gameState.startGameLoop();

        // Start first FTL construction
        gameState.buildFTL('route-1-2');
        expect(gameState.ftlConstruction().tetherId).toBe('route-1-2');

        // Cancel it
        gameState.cancelFTLConstruction();
        expect(gameState.ftlConstruction()).toBeNull();

        // Start a different FTL - should work
        const result = gameState.buildFTL('route-2-3');
        expect(result).toBe(true);
        expect(gameState.ftlConstruction().tetherId).toBe('route-2-3');

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should allow starting new FTL after previous construction completes', () => {
      vi.useFakeTimers();
      createRoot(dispose => {
        const gameState = createGameState();

        const galaxy = {
          systems: [
            { id: 1, name: 'Home', owner: 'Player', x: 500, y: 500, buildings: {}, localResources: { metals: 1000 } },
            { id: 2, name: 'System B', owner: 'Player', x: 600, y: 600, buildings: {}, localResources: { metals: 1000 } },
            { id: 3, name: 'System C', owner: 'Player', x: 700, y: 700, buildings: {}, localResources: { metals: 1000 } }
          ],
          routes: [
            { id: 'route-1-2', source: { id: 1, owner: 'Player' }, target: { id: 2, owner: 'Player' } },
            { id: 'route-2-3', source: { id: 2, owner: 'Player' }, target: { id: 3, owner: 'Player' } }
          ]
        };

        gameState.setGalaxyData(galaxy);
        gameState.setHomeSystemId(1);
        gameState.setCredits(1000);
        gameState.startGameLoop();

        // Start first FTL construction
        gameState.buildFTL('route-1-2');
        const duration = gameState.ftlConstruction().duration;

        // Complete construction
        vi.advanceTimersByTime(duration + 200);
        expect(gameState.builtFTLs().has('route-1-2')).toBe(true);
        expect(gameState.ftlConstruction()).toBeNull();

        // Start second FTL - should work
        const result = gameState.buildFTL('route-2-3');
        expect(result).toBe(true);
        expect(gameState.ftlConstruction().tetherId).toBe('route-2-3');

        gameState.stopGameLoop();
        dispose();
      });
      vi.useRealTimers();
    });

    it('should calculate build time based on distance', () => {
      createRoot(dispose => {
        const gameState = createGameState();

        // Create systems with known distance: sqrt((700-500)^2 + (500-500)^2) = 200
        const galaxy = {
          systems: [
            { id: 1, name: 'Home', owner: 'Player', x: 500, y: 500, buildings: {}, localResources: { metals: 1000 } },
            { id: 2, name: 'System B', owner: 'Player', x: 700, y: 500, buildings: {}, localResources: { metals: 1000 } }
          ],
          routes: [
            { id: 'route-1-2', source: { id: 1, owner: 'Player' }, target: { id: 2, owner: 'Player' } }
          ]
        };

        gameState.setGalaxyData(galaxy);
        gameState.setHomeSystemId(1);
        gameState.setCredits(1000);
        gameState.startGameLoop();

        // Start FTL construction
        gameState.buildFTL('route-1-2');

        // Duration should be 5000 + distance * 10 = 5000 + 200 * 10 = 7000ms
        const construction = gameState.ftlConstruction();
        expect(construction.duration).toBe(7000);

        gameState.stopGameLoop();
        dispose();
      });
    });

    it('should persist FTL construction state across save/load', () => {
      // Manually set up a saved state with FTL construction
      // Use a future startTime so construction doesn't complete during load
      const savedData = {
        galaxyData: {
          systems: [
            { id: 1, name: 'Home', owner: 'Player', x: 500, y: 500, buildings: {} },
            { id: 2, name: 'System B', owner: 'Player', x: 600, y: 600, buildings: {} }
          ],
          routes: [
            { id: 'route-1-2', source: { id: 1, owner: 'Player' }, target: { id: 2, owner: 'Player' } }
          ]
        },
        homeSystemId: 1,
        resources: { metals: 980, credits: 980 },
        ships: { total: 0, deployed: 0 },
        builtFTLs: [],
        tech: { researched: [], currentResearch: null },
        scanningSystem: null,
        ftlConstruction: {
          tetherId: 'route-1-2',
          startTime: Date.now(),
          duration: 60000 // Long duration so it doesn't complete
        },
        zoomLevel: 1,
        viewState: 'galaxy',
        viewSystemId: null,
        lastSaved: Date.now()
      };

      // Use the mock's mockReturnValue to set up the saved data
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

      createRoot(dispose => {
        const gameState = createGameState();

        const galaxy = {
          systems: [
            { id: 1, name: 'Home', owner: 'Player', x: 500, y: 500, buildings: {} },
            { id: 2, name: 'System B', owner: 'Player', x: 600, y: 600, buildings: {} }
          ],
          routes: [
            { id: 'route-1-2', source: { id: 1, owner: 'Player' }, target: { id: 2, owner: 'Player' } }
          ]
        };

        gameState.setGalaxyData(galaxy);

        // Load the state (which starts game loop internally)
        const loaded = gameState.loadState();
        expect(loaded).toBe(true);

        // FTL construction should be restored
        const loadedConstruction = gameState.ftlConstruction();
        expect(loadedConstruction).not.toBeNull();
        expect(loadedConstruction.tetherId).toBe('route-1-2');
        expect(loadedConstruction.duration).toBe(60000);

        gameState.stopGameLoop();
        dispose();
      });
    });
  });
});
