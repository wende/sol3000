# CommandBar Component

## Purpose

Bottom glassmorphism panel containing quick-access buttons to game modals (Tech Tree, Fleet Management) in the real-time idle game.

## File Location
```
src/components/game/CommandBar.jsx
```

## Responsibilities

1. **TECH Button** - Opens TechModal for researching new technologies
2. **FLEET Button** - Opens FleetModal showing docked and in-transit ships
3. **Modal Management** - Toggles visibility of game modals

## Component Structure

```jsx
export function CommandBar(props) {
  const { showTechModal, setShowTechModal, showFleetModal, setShowFleetModal } = props;

  return (
    <div class="command-bar glass-panel">
      <button
        class="command-button"
        classList={{ active: showTechModal() }}
        onClick={() => setShowTechModal(!showTechModal())}
      >
        TECH
      </button>

      <button
        class="command-button"
        classList={{ active: showFleetModal() }}
        onClick={() => setShowFleetModal(!showFleetModal())}
      >
        FLEET
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

### Command Button
```css
.command-button {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-white);
  padding: 12px 24px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'JetBrains Mono', monospace;
}

.command-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.command-button.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}
```

## Notes

The CommandBar in the real-time version is simplified compared to the original turn-based design. The game loop runs continuously (10 ticks/second) via `gameState.js`, so there's no need for a "Next Turn" button.

Modal state is managed in App.jsx and passed down as props:
- `showTechModal` / `setShowTechModal` - Controls TechModal visibility
- `showFleetModal` / `setShowFleetModal` - Controls FleetModal visibility

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
.command-button:active {
  transform: scale(0.98);
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
  }

  .command-button {
    padding: 10px 16px;
    font-size: 0.7rem;
  }
}
```

## Complete Code Example

```jsx
// src/components/game/CommandBar.jsx

export function CommandBar(props) {
  const { showTechModal, setShowTechModal, showFleetModal, setShowFleetModal } = props;

  return (
    <div class="command-bar glass-panel">
      <button
        class="command-button"
        classList={{ active: showTechModal() }}
        onClick={() => setShowTechModal(!showTechModal())}
      >
        TECH
      </button>

      <button
        class="command-button"
        classList={{ active: showFleetModal() }}
        onClick={() => setShowFleetModal(!showFleetModal())}
      >
        FLEET
      </button>
    </div>
  );
}
```
