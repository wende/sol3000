# CommandBar Component

## Purpose

Bottom glassmorphism panel containing primary game actions (Next Turn) and future expansion buttons (Research, Diplomacy). Includes keyboard shortcut hints.

## File Location
```
src/components/CommandBar.jsx
```

## Responsibilities

1. **Next Turn Button** - Primary action to advance the game
2. **Future Actions** - Placeholder buttons for Phase 2 features
3. **Keyboard Hints** - Show shortcut keys for actions
4. **Loading State** - Show spinner during turn processing

## Component Structure

```jsx
export function CommandBar() {
  const [isProcessing, setIsProcessing] = createSignal(false);

  async function handleNextTurn() {
    setIsProcessing(true);
    await processTurn();
    setIsProcessing(false);
  }

  return (
    <div class="command-bar glass-panel">
      <button
        class="primary-button"
        onClick={handleNextTurn}
        disabled={isProcessing()}
      >
        <Show when={!isProcessing()} fallback={<Spinner />}>
          Next Turn
        </Show>
        <span class="shortcut-hint">Space</span>
      </button>

      <button class="secondary-button" disabled>
        Research
        <span class="coming-soon">Phase 2</span>
      </button>

      <button class="secondary-button" disabled>
        Diplomacy
        <span class="coming-soon">Phase 2</span>
      </button>
    </div>
  );
}
```

## Layout

### Position
```css
.command-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: fadeInUp 0.6s ease-out 2s both;
}
```

### Glass Styling
```css
.command-bar {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  padding: 12px 20px;
}
```

## Button Styles

### Primary Button (Next Turn)
```css
.primary-button {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--text-white);
  padding: 12px 24px;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-family: 'JetBrains Mono', monospace;
}

.primary-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.primary-button:active:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(0);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Secondary Buttons
```css
.secondary-button {
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-gray);
  padding: 12px 20px;
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: not-allowed;
  opacity: 0.5;
  position: relative;
  font-family: 'JetBrains Mono', monospace;
}
```

## Shortcut Hints

### Hint Display
```css
.shortcut-hint {
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  color: var(--text-gray);
  letter-spacing: 0.1em;
  white-space: nowrap;
}
```

### Coming Soon Badge
```css
.coming-soon {
  position: absolute;
  top: -8px;
  right: -8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  font-size: 0.5rem;
  letter-spacing: 0.05em;
  border-radius: 2px;
}
```

## Loading Spinner

```jsx
function Spinner() {
  return (
    <div class="spinner">
      <div class="spinner-circle" />
    </div>
  );
}
```

```css
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
}

.spinner-circle {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## Turn Processing Logic

```javascript
async function processTurn() {
  // 1. Move ships
  gameState.ships.forEach(ship => {
    if (ship.targetSystem !== null) {
      ship.progress += 0.33; // 3 turns to reach destination
      if (ship.progress >= 1) {
        // Ship arrived
        handleShipArrival(ship);
      }
    }
  });

  // 2. Update production
  gameState.systems.forEach(system => {
    if (system.production) {
      system.production.turnsLeft--;
      if (system.production.turnsLeft <= 0) {
        // Complete production
        createShip(system, system.production.type);
        system.production = null;
      }
    }
  });

  // 3. Collect resources
  const income = gameState.systems
    .filter(s => s.owner === 'player')
    .reduce((sum, s) => sum + Math.floor(s.population / 100000), 0);

  setGameState('credits', c => c + income);

  // 4. AI turns (future)
  // await processAITurns();

  // 5. Increment turn
  setGameState('turn', t => t + 1);

  // Add small delay for visual feedback
  await new Promise(resolve => setTimeout(resolve, 300));
}
```

## Animations

### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
```

### Button Press Effect
```css
.primary-button:active:not(:disabled) {
  animation: buttonPress 0.1s ease;
}

@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}
```

## Responsive Behavior

```css
@media (max-width: 768px) {
  .command-bar {
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
    transform: none;
    flex-direction: column;
    height: auto;
    gap: 8px;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }

  .shortcut-hint {
    display: none; /* Hide on mobile */
  }
}
```

## Complete Code Example

```jsx
// src/components/CommandBar.jsx
import { createSignal, Show } from 'solid-js';
import { gameState, setGameState } from '../store/gameState';
import './command-bar.css';

export function CommandBar() {
  const [isProcessing, setIsProcessing] = createSignal(false);

  async function handleNextTurn() {
    setIsProcessing(true);

    // Process turn logic
    await processTurn();

    setIsProcessing(false);
  }

  async function processTurn() {
    // Move ships
    gameState.ships.forEach(ship => {
      if (ship.targetSystem !== null) {
        // Update ship positions
      }
    });

    // Collect income
    const income = gameState.systems
      .filter(s => s.owner === 'player')
      .reduce((sum, s) => sum + Math.floor(s.population / 100000), 0);

    setGameState('credits', c => c + income);
    setGameState('turn', t => t + 1);

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return (
    <div class="command-bar glass-panel">
      <button
        class="primary-button"
        onClick={handleNextTurn}
        disabled={isProcessing()}
      >
        <Show when={!isProcessing()} fallback={
          <div class="spinner">
            <div class="spinner-circle" />
          </div>
        }>
          Next Turn
        </Show>
        <span class="shortcut-hint">Space</span>
      </button>

      <button class="secondary-button" disabled>
        Research
        <span class="coming-soon">Phase 2</span>
      </button>

      <button class="secondary-button" disabled>
        Diplomacy
        <span class="coming-soon">Phase 2</span>
      </button>
    </div>
  );
}
```
