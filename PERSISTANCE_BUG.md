# Persistence Bug - Post-Mortem

## Symptoms

1. After page reload, ~30% of planets belonged to the player (the same planets each time)
2. Pressing "New Game" worked correctly, but refreshing broke it again
3. After initial fix, game stopped saving entirely - refresh would show new galaxy with no home planet

## Root Causes

### Bug 1: Random Player Assignment in Galaxy Generation

**Location:** `src/utils/galaxy.js:78`

**Problem:** The `generateGalaxy()` function was randomly assigning `'Player'` ownership to systems:

```javascript
// BROKEN
owner: Math.random() > 0.8 ? 'Enemy' : Math.random() > 0.8 ? 'Player' : 'Unclaimed',
```

This caused ~16% of systems to be randomly owned by Player on every galaxy generation, regardless of game state.

**Fix:**
```javascript
// FIXED
owner: Math.random() > 0.9 ? 'Enemy' : 'Unclaimed',
```

Player ownership should only be assigned through colonization mechanics.

### Bug 2: Debounced Save After Home System Assignment

**Location:** `src/utils/gameState.js` - `newGame()` function

**Problem:** The `newGame()` function:
1. Clears localStorage immediately
2. Waits 1 second, then sets home system
3. Calls `saveState()` which is debounced by another 1 second

If user refreshes within that 2-second window, the home system isn't saved yet.

**Fix:** Save immediately after setting home system, bypassing the debounce:

```javascript
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
```

### Bug 3: Missing Corruption Detection

**Location:** `src/utils/gameState.js` - `loadState()` function

**Problem:** No validation of saved data integrity. Corrupted saves with Player-owned systems but no valid home system would load and cause weird states.

**Fix:** Added corruption detection:

```javascript
const playerSystems = state.galaxyData?.systems?.filter(s => s.owner === 'Player') || [];
const hasHome = !!state.homeSystemId;
const homeExists = state.galaxyData?.systems?.some(s => s.id === state.homeSystemId);

if (playerSystems.length > 0 && (!hasHome || !homeExists)) {
  console.warn('Corrupted save detected: Player systems without valid home. Starting fresh.');
  localStorage.removeItem(STORAGE_KEY);
  // ... start fresh
}
```

## Lessons Learned

1. **Don't mix random state with deterministic state** - Galaxy generation should not include game-state-dependent values like ownership
2. **Critical state changes need immediate persistence** - Debouncing is fine for frequent updates, but initial setup should save immediately
3. **Validate loaded data** - Always check integrity of persisted state before using it
