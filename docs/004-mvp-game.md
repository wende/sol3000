# MVP Real-Time Idle 4X Game Implementation

## Overview

Transformed Sol3000 from a turn-based concept to a real-time idle/incremental 4X game with Cookie Clicker-inspired mechanics. The game features automatic resource production, timer-based construction queues, tech research, and colonization via ships.

## Design Decisions

- **Session-based**: Progress only while tab is open (no offline catch-up)
- **3 Resources**: Ore, Energy, Credits
- **No enemies**: Pure expansion gameplay for MVP
- **Real-time**: 100ms tick interval (10 ticks/second)

---

## Core Systems Implemented

### 1. Game Tick System (`src/utils/gameState.js`)

```javascript
const TICK_INTERVAL = 100; // 100ms = 10 ticks per second

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
```

**Key Features:**
- Delta time handling for consistent updates regardless of frame rate
- Separate functions for production, construction, ships, and research
- Auto-save via SolidJS `createEffect` watching state changes

### 2. Resource Production System

**Production Formula:**
```
rate = buildingLevel * baseRate * resourceMultiplier * techBonus * allBonus
```

**Resource Multipliers by System Type:**
| System Type | Multiplier |
|-------------|------------|
| Rich | 1.5x |
| Normal | 1.0x |
| Poor | 0.6x |

**Starting Resources:** 100 Ore, 50 Energy, 200 Credits

### 3. Building System

**4 Buildings per System:**

| Building | Base Cost | Production | Build Time |
|----------|-----------|------------|------------|
| Ore Mine | 50 Ore, 10 Energy | +0.5 Ore/s per level | 30s |
| Solar Plant | 30 Ore | +0.3 Energy/s per level | 20s |
| Trade Hub | 80 Ore, 20 Energy | +0.2 Credits/s per level | 45s |
| Shipyard | 200 Ore, 50 Energy, 100 Cr | Enables ships, -10% build time | 120s |

**Cost Scaling:**
```javascript
cost = baseCost * Math.pow(1.15, level)
```

**Construction Queue:**
- 1 slot per system
- Progress tracked via `startTime` and `duration`
- Completion triggers building level increment or ship spawn

### 4. Ship & Colonization System

**Colony Ship:**
- Cost: 500 Ore, 200 Energy, 300 Credits
- Build Time: 180s (reduced by Shipyard level: 0.9^level)
- Travel: 60s per FTL hop (affected by Warp Drives tech)

**Pathfinding (BFS):**
```javascript
const findPath = (galaxy, startId, endId) => {
  // Build adjacency list from FTL routes
  const adjacency = {};
  galaxy.systems.forEach(s => adjacency[s.id] = []);
  routes.forEach(r => {
    adjacency[r.source.id].push(r.target.id);
    adjacency[r.target.id].push(r.source.id);
  });

  // BFS to find shortest path
  const queue = [[startId]];
  const visited = new Set([startId]);
  // ... returns array of system IDs to traverse
};
```

**Ship Movement:**
- Ships track `currentSegment` and `segmentProgress` (0-1)
- Position interpolated between waypoints for smooth animation
- On arrival: system ownership transfers, bonus resources granted

### 5. Tech Tree System

**6-Node Tech Tree:**
```
[Efficient Mining] ──► [Advanced Reactors] ──► [Warp Drives]
        │
        └──► [Trade Networks] ──► [Colonial Administration]
                    │
                    └──► [Galactic Dominion]
```

| Tech | Cost | Time | Effect |
|------|------|------|--------|
| Efficient Mining | 200 Cr | 2m | +25% Ore production |
| Advanced Reactors | 400 Cr | 3m | +25% Energy production |
| Trade Networks | 350 Cr | 2m 30s | +25% Credits production |
| Warp Drives | 600 Cr | 4m | -25% ship travel time |
| Colonial Admin | 500 Cr | 3m 20s | New colonies start with Lvl 1 buildings |
| Galactic Dominion | 1000 Cr | 5m | +50% all production |

**Tech Bonus Calculation:**
```javascript
function calculateTechBonuses(researched) {
  const bonuses = { ore: 1, energy: 1, credits: 1, travel: 1, colonyBonus: false, all: 1 };

  researched.forEach(techId => {
    const tech = TECH_TREE[techId];
    if (tech.effect.oreBonus) bonuses.ore += tech.effect.oreBonus;
    if (tech.effect.allBonus) bonuses.all += tech.effect.allBonus;
    // ... etc
  });

  return bonuses;
}
```

---

## UI Components Modified

### StatsPanel (`src/components/game/StatsPanel.jsx`)

**Removed:**
- Turn counter
- Turn-based styling

**Added:**
- Live resource display with production rates (+X/s)
- Tech research progress bar with countdown timer
- DOMINION display (systems owned / total)

**Reactive Timer Fix:**
```javascript
// Tech signal now includes remainingTime updated every tick
setTech(t => ({
  ...t,
  current: {
    ...t.current,
    remainingTime: remaining  // Triggers SolidJS reactivity
  }
}));
```

### CommandBar (`src/components/game/CommandBar.jsx`)

**Removed:**
- "Next Turn" button
- Space bar turn advancement

**Added:**
- TECH button → Opens TechModal
- FLEET button → Opens FleetModal (shows docked/transit ships)

### Sidebar (`src/components/game/Sidebar.jsx`)

**Added:**
- Construction queue display with progress bars
- Docked ships list with LAUNCH button
- Launch view showing reachable unclaimed systems sorted by distance

### BuildingList (`src/components/game/BuildingList.jsx`)

**Wired to Global State:**
- Removed local signals, now uses `props.gameState`
- Multi-resource cost display (Ore, Energy, Credits)
- Build time display
- "BUILDING..." status during construction
- Ship construction section (requires Shipyard)

### GalaxyMap (`src/components/game/GalaxyMap.jsx`)

**Added Ship Visualization:**
```jsx
<For each={transitShips()}>
  {(ship) => (
    <g transform={`translate(${ship.x}, ${ship.y})`}>
      {/* Ship trail */}
      <line ... stroke="rgba(59, 130, 246, 0.3)" />

      {/* Ship icon with glow */}
      <g transform={`rotate(${ship.angle})`} filter="url(#shipGlow)">
        <polygon points="0,-8 5,8 0,4 -5,8" fill="#3b82f6" />
      </g>

      {/* Destination line */}
      <Show when={props.zoomLevel >= 0.4 && ship.destSystem}>
        <line ... stroke="rgba(59, 130, 246, 0.2)" stroke-dasharray="4,4" />
      </Show>
    </g>
  )}
</For>
```

---

## Data Structures

### System Object (Extended)
```javascript
{
  id: number,
  name: string,
  x: number,
  y: number,
  size: number,
  color: string,
  population: string,
  resources: 'Rich' | 'Normal' | 'Poor',
  owner: 'Player' | 'Unclaimed' | 'Enemy',
  description: string,
  // New fields:
  buildings: {
    oreMine: { level: 0 },
    solarPlant: { level: 0 },
    tradeHub: { level: 0 },
    shipyard: { level: 0 }
  },
  constructionQueue: [
    { type: 'building' | 'ship', target: string, startTime: timestamp, duration: ms }
  ]
}
```

### Ship Object
```javascript
{
  id: number,
  type: 'colony',
  systemId: number,        // Origin system
  status: 'docked' | 'transit',
  // Transit-only fields:
  destinationId: number,
  route: [systemId, ...],  // Path of system IDs
  currentSegment: number,  // Current leg of journey
  segmentProgress: number, // 0-1 within current segment
  launchTime: timestamp
}
```

### Tech State
```javascript
{
  researched: ['efficientMining', ...],
  current: {
    id: 'tradeNetworks',
    startTime: timestamp,
    duration: ms,
    remainingTime: ms  // Updated every tick for reactive UI
  } | null
}
```

---

## Bugs Fixed During Implementation

### 1. New Game Showing Multiple Systems
**Problem:** Galaxy generation randomly assigned "Player" ownership to ~10% of systems.

**Solution:** In `newGame()`, reset all system ownership before selecting home:
```javascript
const resetSystems = newGalaxy.systems.map(s => ({
  ...s,
  owner: s.owner === 'Enemy' ? 'Enemy' : 'Unclaimed',
  buildings: undefined,
  constructionQueue: undefined
}));
```

### 2. Research Timer Not Counting Down
**Problem:** `techProgress()` used `Date.now()` which isn't reactive in SolidJS.

**Solution:** Update tech signal with `remainingTime` every tick:
```javascript
const updateTechResearch = () => {
  // ... calculate remaining

  // Update remaining time for UI (triggers reactivity)
  setTech(t => ({
    ...t,
    current: { ...t.current, remainingTime: remaining }
  }));
};
```

---

## Files Changed

| File | Changes |
|------|---------|
| `src/utils/gameState.js` | Major rewrite: tick system, resources, ships, tech, construction |
| `src/utils/galaxy.js` | Minor: buildings structure added to generated systems |
| `src/components/game/BuildingList.jsx` | Wired to global state, added timers |
| `src/components/game/BuildingList.css` | Added building-in-progress, cost-time styles |
| `src/components/game/StatsPanel.jsx` | Replaced turn with live resources, added tech progress |
| `src/components/game/CommandBar.jsx` | Removed turn button, added TECH/FLEET modals |
| `src/components/game/GalaxyMap.jsx` | Added ship visualization layer |
| `src/components/game/Sidebar.jsx` | Added construction queue, ship management |
| `src/App.jsx` | Removed turn keyboard handling, updated props passing |

---

## Balance Targets

| Time | Systems | Ore/sec | Milestone |
|------|---------|---------|-----------|
| 2 min | 1 | 0.5 | First building done |
| 5 min | 1 | 1.5 | Multiple buildings |
| 10 min | 1 | 3.0 | Shipyard complete, building first ship |
| 15 min | 2 | 5.0 | First colony! |
| 30 min | 4 | 15.0 | Exponential growth begins |
| 60 min | 8+ | 50+ | Tech bonuses stacking |
