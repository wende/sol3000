# App Component

## Purpose

The root component that orchestrates the entire game. Manages the layout structure, coordinates child components, and handles initial game setup.

## File Location
```
src/App.jsx
```

## Responsibilities

1. **Layout Management** - Arrange all UI components in proper hierarchy
2. **Initial Setup** - Trigger animations, load fonts, initialize game state
3. **Component Coordination** - Pass state and callbacks to child components
4. **Global Event Handling** - Keyboard shortcuts, window resize

## Component Structure

```jsx
export default function App() {
  return (
    <div class="app-container">
      {/* Grid Background */}
      <div class="grid-background" />

      {/* Main Content - Centered Rothko Frames */}
      <RothkoFrame>
        <GalaxyMap />
      </RothkoFrame>

      {/* UI Overlays */}
      <SystemPanel />
      <StatsPanel />
      <CommandBar />
    </div>
  );
}
```

## Props

**None** - App is the root component

## State Management

### Local State
```javascript
// Window dimensions (for responsive layout)
const [windowSize, setWindowSize] = createSignal({
  width: window.innerWidth,
  height: window.innerHeight
});

// Animation state (for load sequence)
const [isLoaded, setIsLoaded] = createSignal(false);
```

### Global State (from store)
```javascript
import { gameState } from './store/gameState';

// Access in component:
// gameState.selectedSystem
// gameState.turn
// gameState.credits
```

## Lifecycle

### onMount
```javascript
onMount(() => {
  // 1. Trigger load animations
  setTimeout(() => setIsLoaded(true), 100);

  // 2. Setup window resize listener
  window.addEventListener('resize', handleResize);

  // 3. Setup keyboard shortcuts
  window.addEventListener('keydown', handleKeyboard);

  // 4. Initialize game state (if needed)
  if (gameState.systems.length === 0) {
    initializeGalaxy();
  }
});
```

### onCleanup
```javascript
onCleanup(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyboard);
});
```

## Event Handlers

### Keyboard Shortcuts
```javascript
function handleKeyboard(event) {
  switch(event.key) {
    case ' ':  // Space
      event.preventDefault();
      nextTurn();
      break;
    case 'Escape':
      deselectSystem();
      break;
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      selectSystemByIndex(parseInt(event.key) - 1);
      break;
    case '+':
    case '=':
      zoomIn();
      break;
    case '-':
      zoomOut();
      break;
  }
}
```

### Window Resize
```javascript
function handleResize() {
  setWindowSize({
    width: window.innerWidth,
    height: window.innerHeight
  });
}
```

## Layout Specifications

### Container Structure
```css
.app-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
}
```

### Grid Background
```css
.grid-background {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridFadeIn 1s ease-out forwards;
  z-index: 0;
}

@keyframes gridFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Animation Sequence

### Load Timeline
```javascript
Timeline:
0ms    - Grid starts fading in
500ms  - Rothko frames start scaling in
1000ms - Galaxy map elements appear
1500ms - UI panels slide in
2000ms - Keyboard hints appear
2500ms - All animations complete, game interactive
```

### Implementation
```jsx
<div
  class="grid-background"
  style={{
    animation: 'gridFadeIn 1s ease-out forwards'
  }}
/>

<RothkoFrame
  style={{
    animation: 'scaleIn 1s ease-out 0.5s both'
  }}
>
  <GalaxyMap />
</RothkoFrame>

<SystemPanel
  style={{
    animation: 'slideInLeft 0.4s ease-out 1.5s both'
  }}
/>

<StatsPanel
  style={{
    animation: 'slideInRight 0.4s ease-out 1.5s both'
  }}
/>
```

## Child Components

### RothkoFrame
- Contains the galaxy map
- Provides nested glassmorphism layers
- Handles centering and scaling

### GalaxyMap
- D3.js visualization
- Pan/zoom interaction
- Star system rendering

### SystemPanel
- Left-side info panel
- Shows selected system details
- Build/upgrade actions

### StatsPanel
- Right-side stats display
- Turn counter, credits, fleet size
- Empire statistics

### CommandBar
- Bottom action bar
- Next turn button
- Research, diplomacy (future)

## Responsive Behavior

### Desktop (1920×1080+)
- Full layout as specified
- All panels visible
- Optimal viewing experience

### Laptop (1600×900)
- Rothko frames scale to 90%
- Panels remain same size
- Still comfortable to play

### Tablet (1200×800)
- Panels stack or become collapsible
- Map takes more space
- Touch-friendly interactions

### Mobile (<768px)
- Not officially supported in Phase 1
- Future: Simplified UI for mobile

## Styling

### CSS Classes
```css
/* Container */
.app-container { /* ... */ }

/* Background */
.grid-background { /* ... */ }

/* Animation states */
.is-loading { /* ... */ }
.is-loaded { /* ... */ }

/* Focus management */
.app-container:focus-within .rothko-frame {
  /* Enhance focus indicators when any child is focused */
}
```

### CSS Variables (consumed by children)
```css
:root {
  --app-width: 1920px;
  --app-height: 1080px;
  --rothko-scale: 1.0;  /* Adjusts based on window size */
}
```

## Accessibility

### Focus Management
- On load, focus moves to galaxy map
- Tab order: Galaxy Map → System Panel → Stats Panel → Command Bar
- Escape always returns to galaxy map

### Keyboard Navigation
```
Tab       - Next focusable element
Shift+Tab - Previous focusable element
Space     - Next turn (global)
Escape    - Deselect / Close modals (global)
1-9       - Quick select systems
Arrow keys - Pan map (when map focused)
+/-       - Zoom map (when map focused)
```

### Screen Reader Announcements
```javascript
// Announce turn changes
announceToScreenReader(`Turn ${gameState.turn}`);

// Announce system selection
announceToScreenReader(
  `Selected ${system.name}. Population ${system.population}`
);

// Announce game events
announceToScreenReader(
  `Scout ship discovered ${system.name}`
);
```

## Error Handling

### Initialization Errors
```javascript
try {
  initializeGalaxy();
} catch (error) {
  console.error('Failed to initialize galaxy:', error);
  showErrorMessage('Failed to start game. Please refresh.');
}
```

### Runtime Errors
```javascript
// Global error boundary (if using solid-js/error-boundary)
<ErrorBoundary fallback={(err) => (
  <div class="error-screen">
    <h1>Something went wrong</h1>
    <p>{err.message}</p>
    <button onClick={() => window.location.reload()}>
      Restart Game
    </button>
  </div>
)}>
  <App />
</ErrorBoundary>
```

## Performance Considerations

### Render Optimization
- Use `createMemo` for expensive calculations
- Lazy load panels that aren't visible
- Debounce window resize handler

### Memory Management
- Clean up event listeners on unmount
- Remove D3 elements when component unmounts
- Clear animation timers

## Testing Considerations

### Unit Tests
```javascript
// Test keyboard shortcuts
test('Space key triggers next turn', () => {
  const { container } = render(<App />);
  fireEvent.keyDown(window, { key: ' ' });
  expect(gameState.turn).toBe(2);
});

// Test responsive behavior
test('Scales rothko frames on small screens', () => {
  window.innerWidth = 1200;
  window.dispatchEvent(new Event('resize'));
  expect(getRothkoScale()).toBe(0.9);
});
```

### Integration Tests
```javascript
// Test full load sequence
test('Completes load animation sequence', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByClass('grid-background')).toHaveStyle(
      'opacity: 1'
    );
  }, { timeout: 3000 });
});
```

## Future Enhancements

### Phase 2
- Add loading screen with progress bar
- Implement game menu (start, options, credits)
- Add pause functionality
- Tutorial overlay system

### Phase 3
- Multiple game modes (skirmish, campaign)
- Save/load game state
- Settings panel (audio, graphics)
- Achievement notifications

## Code Example

```jsx
// src/App.jsx
import { onMount, onCleanup, createSignal } from 'solid-js';
import { gameState, setGameState, nextTurn } from './store/gameState';
import { RothkoFrame } from './components/RothkoFrame';
import { GalaxyMap } from './components/GalaxyMap';
import { SystemPanel } from './components/SystemPanel';
import { StatsPanel } from './components/StatsPanel';
import { CommandBar } from './components/CommandBar';
import './styles/globals.css';
import './styles/animations.css';

export default function App() {
  const [isLoaded, setIsLoaded] = createSignal(false);

  onMount(() => {
    // Trigger load animation
    setTimeout(() => setIsLoaded(true), 100);

    // Setup keyboard shortcuts
    window.addEventListener('keydown', handleKeyboard);
  });

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyboard);
  });

  function handleKeyboard(event) {
    switch(event.key) {
      case ' ':
        event.preventDefault();
        nextTurn();
        break;
      case 'Escape':
        setGameState('selectedSystem', null);
        break;
    }
  }

  return (
    <div class="app-container" classList={{ 'is-loaded': isLoaded() }}>
      <div class="grid-background" />

      <RothkoFrame>
        <GalaxyMap />
      </RothkoFrame>

      <SystemPanel />
      <StatsPanel />
      <CommandBar />
    </div>
  );
}
```
