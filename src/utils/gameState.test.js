import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createGameState, BUILDINGS, getBuildingCost } from './gameState';

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
      expect(BUILDINGS.solarPlant.production.energy).toBeGreaterThan(0);
      expect(BUILDINGS.tradeHub.production.credits).toBeGreaterThan(0);
    });
  });
});
