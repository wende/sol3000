# StatsPanel Component

## Purpose

Top-left glassmorphism panel displaying real-time game statistics: resources with production rates, systems controlled (dominion), and active research progress.

## File Location
```
src/components/game/StatsPanel.jsx
```

## Responsibilities

1. **Display Resources** - Ore, Energy, Credits with live production rates (+X/s)
2. **Show Dominion** - Owned systems / total systems
3. **Research Progress** - Current tech being researched with countdown timer

## Component Structure

```jsx
export function StatsPanel(props) {
  const { gameState } = props;

  return (
    <div class="stats-panel glass-panel">
      {/* Resource displays with production rates */}
      <ResourceDisplay
        label="ORE"
        value={gameState.resources().ore}
        rate={gameState.productionRates().ore}
      />
      <ResourceDisplay
        label="ENERGY"
        value={gameState.resources().energy}
        rate={gameState.productionRates().energy}
      />
      <ResourceDisplay
        label="CREDITS"
        value={gameState.resources().credits}
        rate={gameState.productionRates().credits}
      />

      <Divider />

      {/* Dominion (systems owned) */}
      <div class="dominion-display">
        DOMINION {ownedSystems()} / {totalSystems}
      </div>

      {/* Research progress (if active) */}
      <Show when={gameState.tech().current}>
        <div class="research-progress">
          <span>RESEARCH: {techName}</span>
          <ProgressBar progress={progress} />
          <span>{formatTime(remaining)}</span>
        </div>
      </Show>
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
  left: 20px;
  width: 280px;
  animation: slideInLeft 0.4s ease-out 0.5s both;
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
const ownedSystems = createMemo(() =>
  props.galaxyData()?.systems.filter(s => s.owner === 'Player').length ?? 0
);
```

### Format Resource Value
```javascript
function formatValue(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return Math.floor(value).toString();
}
```

### Format Production Rate
```javascript
function formatRate(rate) {
  if (rate >= 0) {
    return `+${rate.toFixed(1)}/s`;
  }
  return `${rate.toFixed(1)}/s`;
}
```

### Format Time Remaining
```javascript
function formatTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
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
// src/components/game/StatsPanel.jsx
import { createMemo, Show } from 'solid-js';
import { TECH_TREE } from '../../utils/gameState';

export function StatsPanel(props) {
  const { gameState, galaxyData } = props;

  const ownedSystems = createMemo(() =>
    galaxyData()?.systems.filter(s => s.owner === 'Player').length ?? 0
  );

  const totalSystems = createMemo(() =>
    galaxyData()?.systems.length ?? 0
  );

  const formatValue = (value) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.floor(value).toString();
  };

  const formatRate = (rate) => `+${rate.toFixed(1)}/s`;

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div class="stats-panel glass-panel">
      {/* Resources with production rates */}
      <div class="resource-row">
        <span class="resource-label">ORE</span>
        <span class="resource-value">{formatValue(gameState.resources().ore)}</span>
        <span class="resource-rate">{formatRate(gameState.productionRates().ore)}</span>
      </div>
      <div class="resource-row">
        <span class="resource-label">ENERGY</span>
        <span class="resource-value">{formatValue(gameState.resources().energy)}</span>
        <span class="resource-rate">{formatRate(gameState.productionRates().energy)}</span>
      </div>
      <div class="resource-row">
        <span class="resource-label">CREDITS</span>
        <span class="resource-value">{formatValue(gameState.resources().credits)}</span>
        <span class="resource-rate">{formatRate(gameState.productionRates().credits)}</span>
      </div>

      <div class="stat-divider" />

      {/* Dominion */}
      <div class="dominion-row">
        <span>DOMINION</span>
        <span>{ownedSystems()} / {totalSystems()}</span>
      </div>

      {/* Research progress */}
      <Show when={gameState.tech().current}>
        {(current) => (
          <div class="research-row">
            <span>RESEARCH: {TECH_TREE[current().id]?.name}</span>
            <div class="progress-bar">
              <div class="progress-fill" style={{ width: `${(1 - current().remainingTime / current().duration) * 100}%` }} />
            </div>
            <span>{formatTime(current().remainingTime)}</span>
          </div>
        )}
      </Show>
    </div>
  );
}
```
