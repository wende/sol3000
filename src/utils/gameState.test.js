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
        resources: { ore: 100, energy: 50, credits: 200 }
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
        resources: { ore: 100, energy: 50, credits: 200 }
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
        resources: { ore: 150, energy: 75, credits: 300 }
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
        resources: { ore: 100, energy: 50, credits: 200 }
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
  });

  describe('Building costs', () => {
    it('should calculate building cost correctly', () => {
      const level0Cost = getBuildingCost('oreMine', 0);
      expect(level0Cost.ore).toBe(50);

      const level1Cost = getBuildingCost('oreMine', 1);
      expect(level1Cost.ore).toBe(Math.floor(50 * 1.15));

      const level2Cost = getBuildingCost('oreMine', 2);
      expect(level2Cost.ore).toBe(Math.floor(50 * 1.15 * 1.15));
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
      expect(BUILDINGS.oreMine.production.ore).toBeGreaterThan(0);
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
        gameState.setResources({ ore: 1000, credits: 1000 });

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
        gameState.setResources({ ore: 1000, credits: 1000 });

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
        gameState.setResources({ ore: 2000, credits: 2000 });

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
});
