# Game State Store

## Purpose

Central reactive state management using SolidJS stores. Contains all game data, UI state, and provides actions for state mutations.

## File Location
```
src/store/gameState.js
```

## Responsibilities

1. **State Definition** - Define complete game state structure
2. **State Initialization** - Generate initial galaxy and game setup
3. **State Updates** - Provide actions for mutating state
4. **Computed Values** - Derive values from state
5. **Persistence** - (Future) Save/load game state

## State Structure

```javascript
import { createStore } from 'solid-js/store';

const [gameState, setGameState] = createStore({
  // Galaxy data
  systems: [],      // Array of star system objects
  routes: [],       // Array of FTL route connections
  ships: [],        // Array of ship objects

  // Game state
  turn: 1,
  credits: 100,

  // UI state
  selectedSystem: null,   // System object or null
  hoveredSystem: null,    // System object or null
  viewTransform: {        // Pan/zoom state
    x: 0,
    y: 0,
    k: 1
  },

  // Player state
  player: {
    id: 'player',
    name: 'Commander',
    color: 'rgba(255, 255, 255, 1)'
  },

  // AI opponents (Phase 2)
  aiPlayers: []
});

export { gameState, setGameState };
```

## Data Schemas

### Star System Schema
```javascript
{
  id: number,                    // Unique identifier
  name: string,                  // e.g., "Alpha Centauri"
  x: number,                     // Position in galaxy (0-560)
  y: number,                     // Position in galaxy (0-360)
  size: number,                  // Visual size (3-12)
  color: string,                 // rgba(255,255,255,0.6-1.0)
  explored: boolean,             // Has been discovered
  owner: string | null,          // 'player' | 'ai1' | null
  population: number,            // e.g., 1000000
  income: number,                // Credits per turn
  production: {                  // Current build queue
    type: string,                // 'scout' | 'colony' | 'fighter'
    turnsLeft: number
  } | null
}
```

### FTL Route Schema
```javascript
{
  source: number,  // System ID
  target: number   // System ID
}
```

### Ship Schema
```javascript
{
  id: number,                    // Unique identifier
  type: string,                  // 'scout' | 'colony' | 'fighter' | 'cruiser'
  owner: string,                 // 'player' | 'ai1'
  position: {                    // Current position
    x: number,
    y: number
  },
  currentSystem: number | null,  // System ID if docked
  targetSystem: number | null,   // Destination system ID
  route: number[],               // Array of system IDs along path
  progress: number,              // 0-1 progress along current route segment
  stats: {
    speed: number,               // Systems per turn
    combat: number,              // Combat strength
    cost: number                 // Build cost
  }
}
```

## Initialization

### Generate Galaxy
```javascript
function generateGalaxy() {
  const systems = [];
  const routes = [];

  // Generate 25 star systems in a grid with jitter
  const gridSize = 7;
  const cellW = 560 / gridSize;
  const cellH = 360 / gridSize;
  const jitter = 30;

  for (let i = 0; i < 25; i++) {
    const gridX = i % gridSize;
    const gridY = Math.floor(i / gridSize);

    systems.push({
      id: i,
      name: generateSystemName(i),
      x: gridX * cellW + cellW / 2 + (Math.random() - 0.5) * jitter,
      y: gridY * cellH + cellH / 2 + (Math.random() - 0.5) * jitter,
      size: 4 + Math.random() * 6,
      color: pickRandomWhiteShade(),
      explored: i === 0, // Only home system explored
      owner: i === 0 ? 'player' : null,
      population: i === 0 ? 1000000 : 0,
      income: i === 0 ? 10 : 0,
      production: null
    });
  }

  // Generate routes (connect to 2-4 nearest neighbors)
  systems.forEach((system, i) => {
    const distances = systems
      .map((s, j) => ({
        idx: j,
        dist: Math.hypot(s.x - system.x, s.y - system.y)
      }))
      .filter(d => d.idx !== i)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    distances.forEach(d => {
      // Avoid duplicate routes
      if (!routes.some(r =>
        (r.source === i && r.target === d.idx) ||
        (r.source === d.idx && r.target === i)
      )) {
        routes.push({ source: i, target: d.idx });
      }
    });
  });

  return { systems, routes };
}
```

### Helper Functions
```javascript
function generateSystemName(index) {
  const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
  const suffixes = ['Centauri', 'Draconis', 'Orionis', 'Aquilae', 'Cygni'];

  const prefix = prefixes[index % prefixes.length];
  const suffix = suffixes[Math.floor(index / prefixes.length) % suffixes.length];

  return `${prefix} ${suffix}`;
}

function pickRandomWhiteShade() {
  const shades = [
    'rgba(255, 255, 255, 1.0)',
    'rgba(255, 255, 255, 0.8)',
    'rgba(255, 255, 255, 0.6)'
  ];
  return shades[Math.floor(Math.random() * shades.length)];
}
```

### Initialize Game
```javascript
export function initializeGame() {
  const { systems, routes } = generateGalaxy();

  setGameState({
    systems,
    routes,
    ships: [],
    turn: 1,
    credits: 100,
    selectedSystem: null,
    hoveredSystem: null,
    viewTransform: { x: 0, y: 0, k: 1 }
  });
}
```

## Actions

### System Selection
```javascript
export function selectSystem(systemId) {
  const system = gameState.systems.find(s => s.id === systemId);
  setGameState('selectedSystem', system || null);
}

export function deselectSystem() {
  setGameState('selectedSystem', null);
}
```

### Build Ship
```javascript
export function buildShip(systemId, shipType) {
  const costs = {
    scout: 50,
    colony: 100,
    fighter: 80,
    cruiser: 200
  };

  const cost = costs[shipType];

  if (gameState.credits >= cost) {
    // Deduct credits
    setGameState('credits', c => c - cost);

    // Start production
    setGameState(
      'systems',
      sys => sys.id === systemId,
      'production',
      {
        type: shipType,
        turnsLeft: shipType === 'scout' ? 2 : 3
      }
    );
  }
}
```

### Create Ship (when production completes)
```javascript
export function createShip(system, shipType) {
  const shipStats = {
    scout: { speed: 1, combat: 0, cost: 50 },
    colony: { speed: 0.5, combat: 0, cost: 100 },
    fighter: { speed: 0.75, combat: 1, cost: 80 },
    cruiser: { speed: 0.5, combat: 3, cost: 200 }
  };

  const newShip = {
    id: Date.now(),
    type: shipType,
    owner: system.owner,
    position: { x: system.x, y: system.y },
    currentSystem: system.id,
    targetSystem: null,
    route: [],
    progress: 0,
    stats: shipStats[shipType]
  };

  setGameState('ships', ships => [...ships, newShip]);
}
```

### Move Ship
```javascript
export function moveShip(shipId, targetSystemId) {
  const ship = gameState.ships.find(s => s.id === shipId);
  if (!ship) return;

  // Calculate route using pathfinding
  const route = findPath(ship.currentSystem, targetSystemId);

  setGameState(
    'ships',
    s => s.id === shipId,
    {
      targetSystem: targetSystemId,
      route,
      progress: 0
    }
  );
}
```

### Next Turn
```javascript
export function nextTurn() {
  // 1. Move ships
  gameState.ships.forEach((ship, index) => {
    if (ship.targetSystem !== null) {
      const newProgress = ship.progress + ship.stats.speed;

      if (newProgress >= 1) {
        // Ship reached next system in route
        const nextSystemIndex = ship.route.indexOf(ship.currentSystem) + 1;

        if (nextSystemIndex < ship.route.length) {
          // Move to next system
          setGameState('ships', index, {
            currentSystem: ship.route[nextSystemIndex],
            progress: 0
          });
        } else {
          // Reached final destination
          setGameState('ships', index, {
            currentSystem: ship.targetSystem,
            targetSystem: null,
            route: [],
            progress: 0
          });
        }
      } else {
        // Update progress
        setGameState('ships', index, 'progress', newProgress);
      }
    }
  });

  // 2. Update production
  gameState.systems.forEach((system, index) => {
    if (system.production) {
      const turnsLeft = system.production.turnsLeft - 1;

      if (turnsLeft <= 0) {
        // Production complete
        createShip(system, system.production.type);
        setGameState('systems', index, 'production', null);
      } else {
        setGameState('systems', index, 'production', 'turnsLeft', turnsLeft);
      }
    }
  });

  // 3. Collect income
  const income = gameState.systems
    .filter(s => s.owner === 'player')
    .reduce((sum, s) => sum + s.income, 0);

  setGameState('credits', c => c + income);

  // 4. Increment turn
  setGameState('turn', t => t + 1);
}
```

## Computed Values (Using createMemo)

```javascript
import { createMemo } from 'solid-js';

// In components:
const ownedSystems = createMemo(() =>
  gameState.systems.filter(s => s.owner === 'player')
);

const totalIncome = createMemo(() =>
  ownedSystems().reduce((sum, s) => sum + s.income, 0)
);

const fleetSize = createMemo(() =>
  gameState.ships.filter(s => s.owner === 'player').length
);
```

## Pathfinding (A* Algorithm)

```javascript
function findPath(startId, endId) {
  // Build adjacency list from routes
  const graph = {};
  gameState.routes.forEach(route => {
    if (!graph[route.source]) graph[route.source] = [];
    if (!graph[route.target]) graph[route.target] = [];
    graph[route.source].push(route.target);
    graph[route.target].push(route.source);
  });

  // A* implementation
  const openSet = [startId];
  const cameFrom = {};
  const gScore = { [startId]: 0 };
  const fScore = { [startId]: heuristic(startId, endId) };

  while (openSet.length > 0) {
    // Get node with lowest fScore
    const current = openSet.reduce((min, id) =>
      fScore[id] < fScore[min] ? id : min
    );

    if (current === endId) {
      // Reconstruct path
      return reconstructPath(cameFrom, current);
    }

    openSet.splice(openSet.indexOf(current), 1);

    (graph[current] || []).forEach(neighbor => {
      const tentativeGScore = gScore[current] + 1;

      if (tentativeGScore < (gScore[neighbor] || Infinity)) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = tentativeGScore + heuristic(neighbor, endId);

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    });
  }

  return []; // No path found
}

function heuristic(systemId1, systemId2) {
  const s1 = gameState.systems[systemId1];
  const s2 = gameState.systems[systemId2];
  return Math.hypot(s2.x - s1.x, s2.y - s1.y);
}

function reconstructPath(cameFrom, current) {
  const path = [current];
  while (cameFrom[current]) {
    current = cameFrom[current];
    path.unshift(current);
  }
  return path;
}
```

## Persistence (Future)

### Save Game
```javascript
export function saveGame() {
  const saveData = {
    version: '1.0.0',
    timestamp: Date.now(),
    state: gameState
  };

  localStorage.setItem('galaxy-game-save', JSON.stringify(saveData));
}
```

### Load Game
```javascript
export function loadGame() {
  const saved = localStorage.getItem('galaxy-game-save');

  if (saved) {
    const saveData = JSON.parse(saved);
    setGameState(saveData.state);
    return true;
  }

  return false;
}
```

## Complete Code Example

```javascript
// src/store/gameState.js
import { createStore } from 'solid-js/store';

const [gameState, setGameState] = createStore({
  systems: [],
  routes: [],
  ships: [],
  turn: 1,
  credits: 100,
  selectedSystem: null,
  hoveredSystem: null,
  viewTransform: { x: 0, y: 0, k: 1 }
});

export { gameState, setGameState };

export function initializeGame() {
  const { systems, routes } = generateGalaxy();
  setGameState({ systems, routes });
}

export function selectSystem(systemId) {
  const system = gameState.systems.find(s => s.id === systemId);
  setGameState('selectedSystem', system || null);
}

export function buildShip(systemId, shipType) {
  const costs = { scout: 50, colony: 100, fighter: 80, cruiser: 200 };
  const cost = costs[shipType];

  if (gameState.credits >= cost) {
    setGameState('credits', c => c - cost);
    setGameState(
      'systems',
      s => s.id === systemId,
      'production',
      { type: shipType, turnsLeft: 2 }
    );
  }
}

export function nextTurn() {
  // Move ships, process production, collect income
  setGameState('turn', t => t + 1);
}

function generateGalaxy() {
  // Generate 25 systems with routes
  const systems = /* ... */;
  const routes = /* ... */;
  return { systems, routes };
}
```
