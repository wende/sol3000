# SystemPanel Component

## Purpose

Left-side glassmorphism panel that displays information about the currently selected star system and provides build/upgrade actions.

## File Location
```
src/components/SystemPanel.jsx
```

## Responsibilities

1. **Display System Info** - Show name, population, resources
2. **Build Actions** - Buttons to build ships and structures
3. **Production Queue** - Show what's currently being built
4. **Conditional Rendering** - Hide when no system selected

## Component Structure

```jsx
export function SystemPanel() {
  return (
    <Show
      when={gameState.selectedSystem}
      fallback={
        <div class="system-panel glass-panel">
          <p class="hint-text">Click a star system</p>
        </div>
      }
    >
      {(system) => (
        <div class="system-panel glass-panel">
          <SystemInfo system={system()} />
          <SystemActions system={system()} />
        </div>
      )}
    </Show>
  );
}
```

## Props

**None** - Reads from global game state

## Layout

### Position
```css
.system-panel {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 280px;
  animation: slideInLeft 0.4s ease-out 1.5s both;
}
```

### Glass Styling
```css
.system-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  padding: 20px;
}
```

## System Information Display

### System Name Header
```jsx
<h2 class="system-name">
  {system().name}
</h2>
```

```css
.system-name {
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  color: var(--text-white);
  text-transform: uppercase;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
}
```

### Stats Grid
```jsx
<div class="system-stats">
  <StatRow label="Population" value={formatNumber(system().population)} />
  <StatRow label="Credits/Turn" value={`+${system().income}`} />
  <StatRow label="Owner" value={system().owner || 'Unowned'} />
  <Show when={system().production}>
    <StatRow
      label="Production"
      value={`${system().production.type} (${system().production.turnsLeft} turns)`}
    />
  </Show>
</div>
```

### Stat Row Component
```jsx
function StatRow(props) {
  return (
    <div class="stat-row">
      <span class="stat-label">{props.label}</span>
      <span class="stat-value">{props.value}</span>
    </div>
  );
}
```

```css
.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 300;
  letter-spacing: 0.05em;
  color: var(--text-gray);
  text-transform: uppercase;
}

.stat-value {
  font-size: 0.6875rem;
  font-weight: 400;
  color: var(--text-white);
}
```

## Action Buttons

### Button Grid
```jsx
<div class="action-buttons">
  <Show when={system().owner === 'player'}>
    <Button onClick={() => buildShip(system().id, 'scout')}>
      Build Scout
      <span class="cost">50¢</span>
    </Button>
    <Button onClick={() => buildShip(system().id, 'colony')}>
      Build Colony
      <span class="cost">100¢</span>
    </Button>
    <Button onClick={() => upgradeSystem(system().id)}>
      Upgrade Pop
      <span class="cost">150¢</span>
    </Button>
  </Show>
  <Show when={!system().owner}>
    <Button onClick={() => colonize(system().id)}>
      Colonize System
    </Button>
  </Show>
</div>
```

### Button Component
```jsx
function Button(props) {
  return (
    <button
      class="glass-button"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}
```

```css
.glass-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-white);
  padding: 10px 16px;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'JetBrains Mono', monospace;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.glass-button:active {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(1px);
}

.glass-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.cost {
  display: inline-block;
  margin-left: 8px;
  font-size: 0.625rem;
  color: var(--text-gray);
}
```

## Action Handlers

### Build Ship
```javascript
function buildShip(systemId, shipType) {
  const costs = {
    scout: 50,
    colony: 100,
    fighter: 80,
    cruiser: 200
  };

  if (gameState.credits >= costs[shipType]) {
    setGameState('credits', c => c - costs[shipType]);
    setGameState('systems', sys => sys.id === systemId, 'production', {
      type: shipType,
      turnsLeft: shipType === 'scout' ? 2 : 3
    });
  }
}
```

### Upgrade System
```javascript
function upgradeSystem(systemId) {
  const cost = 150;

  if (gameState.credits >= cost) {
    setGameState('credits', c => c - cost);
    setGameState('systems', sys => sys.id === systemId, 'population', pop => pop + 500000);
  }
}
```

### Colonize
```javascript
function colonize(systemId) {
  // Check if player has colony ship nearby
  const nearbyColonyShip = gameState.ships.find(
    ship => ship.type === 'colony' && ship.targetSystem === systemId
  );

  if (nearbyColonyShip) {
    setGameState('systems', sys => sys.id === systemId, 'owner', 'player');
    setGameState('systems', sys => sys.id === systemId, 'population', 100000);
    // Remove colony ship
    setGameState('ships', ships => ships.filter(s => s.id !== nearbyColonyShip.id));
  }
}
```

## Animations

### Slide In
```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Content Update
```css
.system-stats {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Responsive Behavior

```css
@media (max-width: 1200px) {
  .system-panel {
    top: auto;
    bottom: 80px;
    left: 20px;
    right: 20px;
    width: auto;
  }
}
```

## Complete Code Example

```jsx
// src/components/SystemPanel.jsx
import { Show } from 'solid-js';
import { gameState, setGameState } from '../store/gameState';
import './system-panel.css';

export function SystemPanel() {
  function buildShip(systemId, shipType) {
    const costs = { scout: 50, colony: 100, fighter: 80, cruiser: 200 };
    if (gameState.credits >= costs[shipType]) {
      setGameState('credits', c => c - costs[shipType]);
      setGameState('systems', s => s.id === systemId, 'production', {
        type: shipType,
        turnsLeft: 2
      });
    }
  }

  function formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  return (
    <Show
      when={gameState.selectedSystem}
      fallback={
        <div class="system-panel glass-panel">
          <p class="hint-text">Click a star system</p>
        </div>
      }
    >
      {(system) => (
        <div class="system-panel glass-panel">
          <h2 class="system-name">{system().name}</h2>

          <div class="system-stats">
            <div class="stat-row">
              <span class="stat-label">Population</span>
              <span class="stat-value">{formatNumber(system().population)}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Credits/Turn</span>
              <span class="stat-value">+{system().income || 0}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Owner</span>
              <span class="stat-value">{system().owner || 'Unowned'}</span>
            </div>
          </div>

          <Show when={system().owner === 'player'}>
            <div class="action-buttons">
              <button
                class="glass-button"
                onClick={() => buildShip(system().id, 'scout')}
                disabled={gameState.credits < 50}
              >
                Build Scout <span class="cost">50¢</span>
              </button>
              <button
                class="glass-button"
                onClick={() => buildShip(system().id, 'colony')}
                disabled={gameState.credits < 100}
              >
                Build Colony <span class="cost">100¢</span>
              </button>
            </div>
          </Show>
        </div>
      )}
    </Show>
  );
}
```
