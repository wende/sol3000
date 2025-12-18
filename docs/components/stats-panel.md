# StatsPanel Component

## Purpose

Right-side glassmorphism panel displaying overall game statistics: turn counter, credits, systems controlled, and fleet size.

## File Location
```
src/components/StatsPanel.jsx
```

## Responsibilities

1. **Display Turn Counter** - Current turn number
2. **Show Credits** - Player's available credits
3. **System Count** - Owned systems / total systems
4. **Fleet Size** - Total number of ships

## Component Structure

```jsx
export function StatsPanel() {
  return (
    <div class="stats-panel glass-panel">
      <StatDisplay label="Turn" value={gameState.turn} large />
      <Divider />
      <StatDisplay label="Credits" value={formatCredits(gameState.credits)} large />
      <Divider />
      <StatDisplay
        label="Systems"
        value={`${ownedSystems()} / ${gameState.systems.length}`}
      />
      <Divider />
      <StatDisplay label="Fleet Size" value={gameState.ships.length} />
    </div>
  );
}
```

## Layout

### Position
```css
.stats-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 200px;
  animation: slideInRight 0.4s ease-out 1.5s both;
}
```

### Glass Styling
```css
.stats-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  padding: 20px;
}
```

## Stat Display Component

### Basic Structure
```jsx
function StatDisplay(props) {
  return (
    <div class="stat-display" classList={{ large: props.large }}>
      <div class="stat-display-label">{props.label}</div>
      <div class="stat-display-value">{props.value}</div>
    </div>
  );
}
```

### Styling
```css
.stat-display {
  text-align: center;
  padding: 12px 0;
}

.stat-display-label {
  font-size: 0.6875rem;
  font-weight: 300;
  letter-spacing: 0.1em;
  color: var(--text-gray);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.stat-display-value {
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--text-white);
  letter-spacing: 0.05em;
}

/* Large variant for important stats */
.stat-display.large .stat-display-value {
  font-size: 2rem;
  font-weight: 500;
}
```

## Divider Component

```jsx
function Divider() {
  return <div class="stat-divider" />;
}
```

```css
.stat-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}
```

## Computed Values

### Owned Systems
```javascript
function ownedSystems() {
  return gameState.systems.filter(s => s.owner === 'player').length;
}
```

### Format Credits
```javascript
function formatCredits(credits) {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}K`;
  }
  return credits.toString();
}
```

### Credits Per Turn
```javascript
function creditsPerTurn() {
  return gameState.systems
    .filter(s => s.owner === 'player')
    .reduce((sum, s) => sum + (s.population / 100000), 0);
}
```

## Animations

### Slide In
```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Value Change Animation
```jsx
// Animate numbers when they change
const [displayValue, setDisplayValue] = createSignal(gameState.credits);

createEffect(() => {
  const target = gameState.credits;
  const current = displayValue();

  if (target !== current) {
    const step = (target - current) / 10;
    const interval = setInterval(() => {
      setDisplayValue(v => {
        const next = v + step;
        if (Math.abs(next - target) < Math.abs(step)) {
          clearInterval(interval);
          return target;
        }
        return next;
      });
    }, 50);
  }
});
```

## Responsive Behavior

```css
@media (max-width: 1200px) {
  .stats-panel {
    top: auto;
    bottom: 80px;
    right: 20px;
    left: auto;
    width: 180px;
  }
}

@media (max-width: 768px) {
  .stats-panel {
    display: flex;
    flex-direction: row;
    width: auto;
    left: 20px;
    right: 20px;
  }

  .stat-display {
    flex: 1;
  }

  .stat-divider {
    width: 1px;
    height: auto;
    margin: 0 12px;
  }
}
```

## Complete Code Example

```jsx
// src/components/StatsPanel.jsx
import { createMemo } from 'solid-js';
import { gameState } from '../store/gameState';
import './stats-panel.css';

export function StatsPanel() {
  const ownedSystems = createMemo(() =>
    gameState.systems.filter(s => s.owner === 'player').length
  );

  const formatCredits = (credits) => {
    if (credits >= 1000) return `${(credits / 1000).toFixed(1)}K`;
    return credits.toString();
  };

  return (
    <div class="stats-panel glass-panel">
      <div class="stat-display large">
        <div class="stat-display-label">Turn</div>
        <div class="stat-display-value">{gameState.turn}</div>
      </div>

      <div class="stat-divider" />

      <div class="stat-display large">
        <div class="stat-display-label">Credits</div>
        <div class="stat-display-value">{formatCredits(gameState.credits)}</div>
      </div>

      <div class="stat-divider" />

      <div class="stat-display">
        <div class="stat-display-label">Systems</div>
        <div class="stat-display-value">
          {ownedSystems()} / {gameState.systems.length}
        </div>
      </div>

      <div class="stat-divider" />

      <div class="stat-display">
        <div class="stat-display-label">Fleet Size</div>
        <div class="stat-display-value">{gameState.ships.length}</div>
      </div>
    </div>
  );
}
```
