# Save System

## Overview

The game uses localStorage for persistence with automatic saving via SolidJS reactive effects. The save system includes corruption detection and guards against saving invalid state.

## Storage

- **Key:** `sol3000_game_state`
- **Format:** JSON
- **Debounce:** 1000ms (saves are debounced to avoid excessive writes)

## Saved State Structure

```javascript
{
  galaxyData: { systems: [], routes: [] },
  homeSystemId: number | null,
  resources: { ore: number, credits: number },
  ships: Ship[],
  tech: { researched: string[], current: TechProgress | null },
  zoomLevel: number,
  lastSaved: number // timestamp
}
```

## Auto-Save Mechanism

Located in `src/utils/gameState.js`, the auto-save uses a SolidJS `createEffect` that tracks changes to key signals:

```javascript
createEffect(() => {
  galaxyData();
  homeSystemId();  // Must track to save home system changes
  resources();
  ships();
  tech();
  saveState();
});
```

When any tracked signal changes, `saveState()` is called (debounced).

## Save Guards

The `saveState()` function includes guards to prevent saving invalid state that would trigger corruption detection on load:

1. **Empty galaxy guard:** Won't save if `galaxyData.systems` is empty (prevents hot reload from overwriting valid saves with default state)

2. **Orphaned player systems guard:** Won't save if there are Player-owned systems but no `homeSystemId` (this would be detected as corruption on load)

```javascript
// Guard: Don't save if galaxy is empty
if (!galaxy.systems || galaxy.systems.length === 0) {
  return;
}

// Guard: Don't save if we have Player systems but no homeSystemId
const playerSystems = galaxy.systems.filter(s => s.owner === 'Player');
if (playerSystems.length > 0 && !home) {
  return;
}
```

## Corruption Detection

On load (`loadState()`), the system validates saved data:

```javascript
const playerSystems = state.galaxyData?.systems?.filter(s => s.owner === 'Player') || [];
const hasHome = !!state.homeSystemId;
const homeExists = state.galaxyData?.systems?.some(s => s.id === state.homeSystemId);

if (playerSystems.length > 0 && (!hasHome || !homeExists)) {
  console.warn('Corrupted save detected...');
  localStorage.removeItem(STORAGE_KEY);
  // Start fresh game
}
```

**Corruption conditions:**
- Player owns systems but `homeSystemId` is null/undefined
- Player owns systems but `homeSystemId` points to a non-existent system

## New Game Flow

When `newGame()` is called:

1. Stops game loop
2. Clears localStorage immediately
3. Generates new galaxy with all systems Unclaimed/Enemy
4. Resets all signals to defaults
5. After 1000ms timeout, picks a home system and:
   - Sets it as Player-owned with initial buildings
   - Saves immediately (bypasses debounce) to ensure home system persists

## Hot Reload Considerations

During Vite hot module reload:
- `createGameState()` may be called with fresh default signals
- The auto-save effect runs immediately with these defaults
- **Without guards**, this could overwrite a valid save

The save guards prevent this by refusing to save empty or invalid state.

## Testing

Tests in `src/utils/gameState.test.js` cover:
- Corruption detection for missing homeSystemId
- Corruption detection for invalid homeSystemId
- Valid save loading
- Immediate save after newGame sets home system
