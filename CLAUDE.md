# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sol3000 is a minimalist 4X strategy browser game featuring a procedurally-generated galaxy map with a black-and-white aesthetic and glassmorphism UI. Built with SolidJS for reactive UI and D3.js for interactive galaxy visualization.

> **See [PROJECT_TREE.md](./PROJECT_TREE.md)** for a complete feature map, component dependency graph, and utility function reference.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview

# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run
```

## Architecture

### Core Technologies
- **SolidJS** (^2.11.10 via vite-plugin-solid): Fine-grained reactive UI framework with no virtual DOM
- **D3.js** (^7.9.0): Pan/zoom and SVG-based galaxy visualization
- **Vite** (^7.2.4): Build tool and dev server
- **Vitest** (^4.0.16): Unit testing framework with jsdom environment
- **Tailwind CSS**: Utility-first CSS framework
- **Testing Library**: `@solidjs/testing-library` for component testing

### Project Structure
```
src/
├── App.jsx                  # Root component with global state (signals)
├── index.jsx                # Application entry point
├── utils/
│   └── galaxy.js           # Galaxy generation logic (systems + routes)
└── components/
    ├── common/
    │   └── GlassPanel.jsx  # Reusable glassmorphism container
    └── game/
        ├── GalaxyMap.jsx   # D3-powered SVG map with zoom/pan
        ├── Sidebar.jsx     # System details panel (right side)
        ├── StatsPanel.jsx  # Game stats overlay (top left)
        ├── CommandBar.jsx  # Action bar (bottom)
        └── BuildingList.jsx # Building management UI
```

### State Management Pattern
SolidJS signals are used for reactive state, primarily managed in `App.jsx`:
- `galaxyData()` - Systems and routes from `generateGalaxy()`
- `selectedSystemId()` - Currently selected star system
- `gameState` - Real-time game state (resources, ships, tech, construction queues)
- `ripples()` - Transient UI effects
- `zoomLevel()` - LOD (Level of Detail) optimization trigger

State flows down via props; callbacks flow up for updates.

### Key Architecture Details

**Galaxy Generation (`src/utils/galaxy.js`)**
- Generates 120 star systems in a donut distribution (400-1100px radius)
- Systems avoid black hole center (< 400px) and overlap each other
- Routes connect 2-3 nearest neighbors within 400px range
- Returns `{ systems[], routes[] }` consumed by GalaxyMap

**D3 Integration (`src/components/game/GalaxyMap.jsx`)**
- D3 controls zoom/pan behavior (`d3.zoom()`) but SolidJS renders the DOM
- LOD system: zoom level triggers CSS class changes for performance
  - Ultra-low detail (< 0.25): No animations or filters
  - Low detail (< 0.5): Simplified animations
  - Full detail (≥ 0.5): All effects enabled
- Double-click prevention: Custom handler instead of D3 default
- Ripple effects triggered by system selection, cleanup after 1s

**Styling Philosophy**
- **Tailwind CSS** - Used for utility classes and layout.
- **Pure CSS** - Used for complex animations and specific glassmorphism effects where Tailwind is insufficient.
- All animations in `<style>` block in App.jsx using CSS keyframes
- Hardware-accelerated transforms (`will-change`, GPU-accelerated properties)
- Glassmorphism via `backdrop-filter: blur(16px)` with rgba backgrounds
- Black (#000000) background with white (#ffffff) text and UI elements
- Use inline styles or CSS files for component styling when necessary

**Component Patterns**
- Use JSDoc type annotations for props (see GlassPanel.jsx, GalaxyMap.jsx examples)
- Components use SolidJS `createSignal`, `createEffect`, `createMemo`, `Show`, `For`
- Icon usage: `lucide-solid` package for UI icons
- Event handlers: Stop propagation when clicking within panels to prevent deselection

## Development Notes

- **Tree Locator**: `@treelocator/runtime` is enabled in dev mode (index.jsx:7-9) for component inspection
- **Vite Config**: Babel plugin `@locator/babel-jsx` configured for development environment only
- **Documentation**: Extensive docs in `docs/` folder including style guide, technical decisions, and component specs

## Testing

### Test Structure
Tests live alongside source files with `.test.js` suffix:
```
src/utils/
├── galaxy.js           # Galaxy generation
├── galaxy.test.js      # Galaxy tests
├── gameState.js        # Game state management
└── gameState.test.js   # Game state tests
```

### Testing Patterns

**Pure functions (galaxy.js)**
- Test directly without special setup
- Run multiple iterations for randomized logic to catch edge cases

**SolidJS reactive code (gameState.js)**
- Wrap tests in `createRoot()` from solid-js to provide reactive context
- Call `dispose()` and `stopGameLoop()` in cleanup to prevent memory leaks

```javascript
import { createRoot } from 'solid-js';

it('should do something', () => {
  createRoot(dispose => {
    const gameState = createGameState();
    // ... test logic
    gameState.stopGameLoop();
    dispose();
  });
});
```

**Component Testing (New)**
- Use `@solidjs/testing-library` for UI testing.
- Use `render` to mount components and `screen` to query them.
- Use `@testing-library/user-event` or `fireEvent` for interactions.

```javascript
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(() => <MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**localStorage mocking**
- Use `vi.fn()` to mock localStorage methods
- Clear mocks between tests with `beforeEach`

**Timers**
- Use `vi.useFakeTimers()` for setTimeout/setInterval
- Advance time with `vi.advanceTimersByTime(ms)`
- Restore with `vi.useRealTimers()` in `afterEach`

### What to Test
- Galaxy generation invariants (no Player ownership, valid structure)
- Save/load corruption detection
- Critical state transitions (newGame, colonization)
- Building cost calculations

## Common Tasks

**Adding a New UI Panel**
1. Create component in `src/components/game/`
2. Use `GlassPanel` wrapper for consistent styling
3. Add to `App.jsx` with slide-in animation classes (`slide-in-left`, `slide-in-bottom`, etc.)
4. Connect to signals for reactivity

**Modifying Galaxy Generation**
- Edit `src/utils/galaxy.js`
- Constants: `MAP_WIDTH`, `MAP_HEIGHT`, `CENTER_X`, `CENTER_Y` define coordinate space
- System properties: id, name, x, y, size, color, population, resources, owner, description

**Performance Optimization**
- LOD system is already implemented via zoom level in GalaxyMap.jsx
- For more systems (> 120), adjust LOD thresholds or reduce animation complexity
- Use `will-change` CSS property sparingly; already applied to critical animations

**Keyboard Shortcuts**
Implemented in App.jsx
- Escape: Deselect system
- Add new shortcuts by extending the `handleKeyDown` function
- You don't have to run npm dev every time. The server has hot code reloading

## Documentation File Naming Convention

Technical decision records and implementation notes live in `docs/` with the following naming pattern:

**Format:** `XXX-description-with-dashes.md`

- **XXX**: Sequential three-digit number (001, 002, 003, etc.)
- **Description**: Kebab-case (hyphens, no underscores)
- **File Extension**: `.md`

**Examples:**
- `001-initial-setup-hardware-acceleration.md` - Initial setup decisions
- `002-LOD-and-hardware-acceleration.md` - Performance optimizations
- `005-tether-gradient-fade-issues.md` - Technical challenges and solutions

These docs capture decisions, debugging findings, and architectural rationale that don't fit in code comments.
- Tests are never 'unrelated' to changes. Whenever we start we start with a full passing suite. New errors means we need to fix them