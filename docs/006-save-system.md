# Save System & Auto-Save Architecture

## Overview

The game uses localStorage for persistence with a **hybrid auto-save system**: debounced saves on meaningful state changes + periodic saves for resource accumulation. The system includes comprehensive error handling, corruption detection, detailed logging, and user alerts for failures.

## Storage

- **Key:** `sol3000_game_state`
- **Format:** JSON
- **Save Triggers:**
  - **Immediate (debounced 500ms):** On meaningful state changes (buildings, ships, tech, etc.)
  - **Periodic (every 10 seconds):** For resource accumulation
- **Maximum Data Loss:** 10 seconds of resource accumulation (negligible)

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

The save system uses a **hybrid approach**: debounce for meaningful changes + periodic saves for resources.

### Reactive Effect (Debounced)

Located in `src/utils/gameState.js`, a SolidJS `createEffect` tracks meaningful state changes:

```javascript
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
```

When any tracked signal changes, `saveState()` is called with a **500ms debounce**:

```javascript
const saveState = () => {
  // Debounce saves by 500ms - only save after changes stop
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    performSave();
  }, 500);
};
```

### Periodic Save (Every 10 Seconds)

Resources accumulate every 100ms but aren't tracked by the reactive effect. Instead, a periodic timer saves them:

```javascript
// In startGameLoop()
periodicSaveInterval = setInterval(() => {
  performSave(); // Direct save, bypassing debounce
}, 10000);
```

### Why This Hybrid Approach?

**The Problem with Pure Debounce:**
Resources change every 100ms from the game tick. If we tracked `resources()` in the effect, the debounce timer would constantly reset, preventing saves.

**The Problem with Pure Throttle:**
A throttle (every 2 seconds) would save constantly even when nothing meaningful changed, wasting localStorage writes.

**The Solution: Hybrid**
- **Debounce for meaningful changes**: Save 500ms after building/ship/tech changes stop
  - Efficient: Only saves when something important happens
  - Responsive: Saves quickly after user actions
- **Periodic for resources**: Save every 10 seconds regardless
  - Acceptable loss: 10 seconds of resource accumulation is negligible
  - Efficient: Fewer saves than tracking every 100ms change

**Benefits:**
- Minimal localStorage writes (only on meaningful changes + every 10s)
- Responsive to user actions (500ms debounce)
- Acceptable data loss (max 10 seconds of resources)
- No perpetual save prevention like pure debounce would have

## Save Guards

The `performSave()` function includes guards to prevent saving invalid state that would trigger corruption detection on load:

1. **Empty galaxy guard:** Won't save if `galaxyData.systems` is empty (prevents hot reload from overwriting valid saves with default state)
   ```
   💾 Save skipped: Galaxy is empty (initialization in progress)
   ```

2. **Orphaned player systems guard:** Won't save if there are Player-owned systems but no `homeSystemId` (this would be detected as corruption on load)
   ```
   💾 Save skipped: CORRUPTION PREVENTION
      Player owns 3 systems but homeSystemId is null
      Player systems: Kepler-442 (sys_15), TRAPPIST-1 (sys_42), ...
      This prevents saving a corrupted state
   ```

```javascript
// Guard: Don't save if galaxy is empty
if (!galaxy.systems || galaxy.systems.length === 0) {
  console.warn('💾 Save skipped: Galaxy is empty...');
  return;
}

// Guard: Don't save if we have Player systems but no homeSystemId
const playerSystems = galaxy.systems.filter(s => s.owner === 'Player');
if (playerSystems.length > 0 && !home) {
  console.error('💾 Save skipped: CORRUPTION PREVENTION');
  console.error(`   Player owns ${playerSystems.length} systems...`);
  return;
}
```

These guards log detailed information to help diagnose issues.

## Error Handling & Corruption Detection

The save system now includes comprehensive error handling with detailed console logging and user alerts.

### Load Errors

On load (`loadState()`), the system validates saved data and provides specific error messages:

#### 1. JSON Parse Errors
```
❌ SAVE LOAD FAILED - JSON PARSE ERROR
Details: Unexpected token } in JSON at position 1543
This usually means the save file was corrupted or truncated
```
**Alert shown to user:**
```
⚠️ Save Load Failed

Save file is corrupted (JSON parse error)

The save file could not be read. Starting a new game.

Technical details: [error message]
```

#### 2. Corruption Detection
```javascript
const playerSystems = state.galaxyData?.systems?.filter(s => s.owner === 'Player') || [];
const hasHome = !!state.homeSystemId;
const homeExists = state.galaxyData?.systems?.some(s => s.id === state.homeSystemId);

if (playerSystems.length > 0 && (!hasHome || !homeExists)) {
  // Detailed error logging and user alert
}
```

**Corruption conditions:**
- Player owns systems but `homeSystemId` is null/undefined
- Player owns systems but `homeSystemId` points to a non-existent system

**Console output:**
```
❌ SAVE LOAD FAILED - CORRUPTION DETECTED
Corruption details:
  - No home system ID set
  - Player owns 3 systems: Kepler-442 (sys_15), TRAPPIST-1 (sys_42), ...
```

**Alert shown to user:**
```
⚠️ Save Load Failed

Save file is corrupted:
- No home system ID set
- Player owns 3 systems but missing valid home

This typically happens if the save was interrupted. Starting a new game.
```

#### 3. Unexpected Errors
Any other errors (e.g., browser issues, quota exceeded) are caught and logged:
```
❌ SAVE LOAD FAILED - UNEXPECTED ERROR
Error type: TypeError
Error message: Cannot read property 'systems' of undefined
Stack trace: [full stack]
This is a bug - please report it with the above details
```

**Alert shown to user:**
```
⚠️ Save Load Failed

Unexpected error loading save file

An unexpected error occurred. Starting a new game.

Technical details: [error message]

Please report this issue.
```

### Save Errors

Errors during save are also caught and reported:

#### LocalStorage Quota Exceeded
```
❌ SAVE FAILED
Error type: QuotaExceededError
LocalStorage quota exceeded! Save file is too large.
```

**Alert shown to user:**
```
⚠️ Save Failed

LocalStorage quota exceeded. Your save file is too large.

This is a critical issue. Please report it.
```

#### Other Save Errors
```
❌ SAVE FAILED
Error type: [error type]
Error message: [error message]
Stack trace: [full stack]
```

**Alert shown to user:**
```
⚠️ Save Failed

Failed to save game state.

Technical details: [error message]

Your progress may be lost. Please report this issue.
```

### Successful Operations

When everything works correctly, you'll see:
```
📂 Loading saved game state...
✓ Save file parsed successfully
🔍 Validating save data integrity...
   Player systems: 3
   Home system ID: sys_42
   Home exists in galaxy: true
✓ Save data validation passed
🔄 Checking for save migrations...
✓ Migrations complete
📥 Restoring game state...
✓ Game state restored successfully
   Resources: 450 ore, 680 credits
   Ships: 2
   Built FTLs: 5
   Tech researched: 3

💾 Game saved (45.2KB)  // Every 2 seconds during gameplay
```

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

## Design Decisions & Improvements

### Why Hybrid (Debounce + Periodic) Instead of Pure Throttle?

**Evolution of the save system:**

1. **Original (Debounce):** Broken - resources changed every 100ms, perpetually resetting the timer
2. **First fix (Throttle):** Worked but wasteful - saved every 2s even with no meaningful changes
3. **Current (Hybrid):** Optimal - debounce for meaningful changes + periodic for resources

**The hybrid approach provides:**
- **Efficiency:** Only saves when something meaningful happens (buildings, ships, tech)
- **Responsiveness:** 500ms debounce means saves happen quickly after user actions
- **Acceptable loss:** Max 10 seconds of resource accumulation (e.g., 5 ore, 2 credits) is negligible
- **Performance:** Far fewer localStorage writes than throttle or tracking resources reactively

### Meaningful vs Ephemeral State

The key insight is separating state into two categories:

**Meaningful State (saved on change):**
- System ownership, buildings, construction queues
- Ships (launches, arrivals, colonization)
- FTL routes built
- Tech research progress
- View state

**Ephemeral State (saved periodically):**
- Resources (ore, credits) - accumulate constantly but losing 10 seconds is acceptable

This distinction allows the reactive effect to be efficient while still capturing all important state changes.

### Why Alert Popups?

While console logging is essential for debugging, most users don't have the console open. Alert popups ensure:
- Users are immediately aware of save/load failures
- Critical issues don't go unnoticed
- Users know when to report bugs
- Progress loss is communicated clearly

### Save Frequency Trade-offs

**500ms debounce chosen because:**
- Short enough to feel responsive after user actions
- Long enough to batch rapid changes (e.g., queuing multiple buildings)
- Appropriate for the game's action pace

**10 second periodic save chosen because:**
- Resource loss is negligible (few ore/credits)
- Buildings take 2-30 seconds to construct
- Ships travel for 6+ seconds
- Losing 10 seconds of accumulation is acceptable

### Console Logging Philosophy

The save system uses emoji prefixes and structured logging:
- 📂 File operations (load/save initiation)
- ✓ Success states (parsed, validated, restored)
- 🔍 Validation steps
- 🔄 Migration operations
- 💾 Save operations
- ❌ Failures and errors

This makes it easy to scan console output and diagnose issues quickly.

## Implementation Reference

**File:** `src/utils/gameState.js`
- `loadState()`: Load with error handling and validation
- `saveState()`: Debounce logic (500ms delay)
- `performSave()`: Actual save operation with guards
- `startGameLoop()`: Starts game tick + periodic save interval (10s)
- `stopGameLoop()`: Stops both intervals
- Auto-save effect: Reactive trigger for meaningful state changes

**Variables:**
- `saveTimeout`: Pending debounced save timer reference
- `periodicSaveInterval`: 10-second periodic save interval reference
- `STORAGE_KEY`: 'sol3000_game_state'

**Key Constants:**
- Debounce delay: 500ms (in `saveState()`)
- Periodic save: 10000ms (in `startGameLoop()`)
- Game tick: 100ms (resources update frequency)
