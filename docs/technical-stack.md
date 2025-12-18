# Technical Stack

## Framework Decisions

### SolidJS (UI Framework)
**Version**: ^1.8.0

**Why SolidJS:**
1. **Fine-grained reactivity** - Updates only what changed, perfect for game state
2. **No Virtual DOM** - Direct DOM manipulation, better performance
3. **Small bundle size** - ~7KB, keeps game lightweight
4. **JSX familiarity** - AI assistants understand it well
5. **No style scoping** - CSS classes work as-is, no fighting with frameworks

**Usage Pattern:**
```jsx
import { createSignal, createEffect } from 'solid-js';

const [gameState, setGameState] = createStore({...});

// Components react automatically to state changes
createEffect(() => {
  if (gameState.selectedSystem) {
    updateVisualization();
  }
});
```

**Alternative Considered:**
- **Svelte**: Better DX, but CSS scoping conflicts with existing animations
- **React**: Too large (40KB+), slower updates
- **Vue**: Better than React, but SolidJS is faster
- **Angular**: Way too heavy for a mini-game

### D3.js (Visualization)
**Version**: ^7.9.0

**Why D3:**
1. **Built for data visualization** - Perfect for galaxy maps
2. **Pan/zoom built-in** - `d3.zoom()` handles all the complexity
3. **Powerful selections** - Update DOM efficiently with `.join()`
4. **Force simulations** - Can generate organic galaxy layouts
5. **SVG manipulation** - Clean, scalable vector graphics

**Core D3 Modules Used:**
- `d3-selection` - DOM manipulation
- `d3-zoom` - Pan and zoom behavior
- `d3-transition` - Smooth animations
- `d3-force` - (Optional) Force-directed graph layout
- `d3-path` - Drawing FTL routes

**Usage Pattern:**
```javascript
const svg = d3.select(containerRef).append('svg');

svg.selectAll('.star')
  .data(systems)
  .join('circle')
  .attr('cx', d => d.x)
  .attr('cy', d => d.y)
  .on('click', handleClick);
```

**Alternative Considered:**
- **Canvas API**: Faster for 1000+ objects, but harder hit detection
- **Three.js**: Overkill for 2D, no advantage
- **PixiJS**: Great for games, but less helpful for data-driven visualizations
- **Konva**: Good, but D3 has better zoom/pan

### Pure CSS (Styling)
**No CSS-in-JS library**

**Why Pure CSS:**
1. **Reuse existing animations** - Drop in any CSS library
2. **Hardware acceleration** - CSS transforms use GPU
3. **No runtime cost** - Styles parsed once, not on every render
4. **Framework agnostic** - Easy to port to other frameworks
5. **Better performance** - No JS overhead for styling

**Structure:**
```
styles/
├── globals.css        # CSS variables, resets
├── animations.css     # All @keyframes
├── glass.css          # Glassmorphism utilities
└── components/        # Component-specific styles
    ├── galaxy-map.css
    ├── panels.css
    └── buttons.css
```

**Alternative Considered:**
- **Tailwind CSS**: Great, but overhead for this small project
- **styled-components**: Runtime cost, not needed
- **CSS Modules**: Scoping conflicts with D3
- **Sass/Less**: Not needed for this scale

## Build Tool

### Vite
**Version**: ^5.0.0

**Why Vite:**
1. **Fast dev server** - Instant hot module reload
2. **Optimized builds** - Tree-shaking, code splitting
3. **SolidJS plugin** - First-class support
4. **Zero config** - Works out of the box
5. **Modern by default** - ES modules, no legacy bundle

**Configuration:**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'd3': ['d3']
        }
      }
    }
  }
});
```

## State Management

### Solid Store (Built-in)
**No external state library needed**

**Why Solid Store:**
1. **Built into SolidJS** - No extra dependency
2. **Nested reactivity** - Track changes deep in objects
3. **Simple API** - `createStore()` and done
4. **Type-safe** - Works great with TypeScript
5. **Dev tools** - Browser extension for debugging

**State Structure:**
```javascript
import { createStore } from 'solid-js/store';

const [gameState, setGameState] = createStore({
  // Galaxy data
  systems: [],
  routes: [],
  ships: [],

  // UI state
  selectedSystem: null,
  hoveredSystem: null,

  // Game state
  turn: 1,
  credits: 100,

  // View state
  transform: { x: 0, y: 0, k: 1 }
});

// Update patterns
setGameState('credits', c => c + 100);
setGameState('systems', 0, 'population', 1000000);
```

**Alternative Considered:**
- **Redux**: Too much boilerplate
- **Zustand**: Good, but Solid Store is simpler
- **MobX**: Solid's reactivity is better
- **Context API**: Solid Store is more powerful

## Development Tools

### Package Manager: npm
Standard, ships with Node.js

### Code Editor: Any
Designed to work with:
- VS Code (recommended)
- WebStorm
- Neovim with LSP

### Browser DevTools
- Chrome DevTools (primary)
- Firefox DevTools (secondary)
- Solid DevTools Extension

### Linting & Formatting
**ESLint + Prettier** (optional, not required for Phase 1)

## Type System

### TypeScript (Optional)
**Not required for initial implementation**

**If using TypeScript:**
```typescript
interface StarSystem {
  id: number;
  name: string;
  x: number;
  y: number;
  size: number;
  color: string;
  explored: boolean;
  owner: string | null;
  population: number;
}

interface FTLRoute {
  source: number;  // System ID
  target: number;  // System ID
}

interface Ship {
  id: number;
  type: 'scout' | 'colony' | 'fighter' | 'cruiser';
  position: { x: number; y: number };
  targetSystem: number | null;
  progress: number; // 0-1
  owner: string;
}
```

## Performance Optimizations

### Rendering Optimizations
1. **Use CSS transforms** - Not left/top positioning
2. **will-change hints** - On animated elements
3. **Debounce pan/zoom** - Limit updates to 60fps
4. **Batch D3 updates** - Use `.join()` pattern
5. **Minimize re-renders** - Fine-grained Solid updates

### Bundle Optimizations
1. **Code splitting** - Separate D3 into its own chunk
2. **Tree shaking** - Import only used D3 modules
3. **Minification** - Terser for production builds
4. **Compression** - Gzip/Brotli on server

### Runtime Optimizations
1. **RequestAnimationFrame** - For smooth animations
2. **Avoid layout thrashing** - Batch DOM reads/writes
3. **Memoize calculations** - Cache expensive computations
4. **Lazy load** - Only render visible systems (future)

## Browser Support

### Target Browsers
- **Chrome/Edge**: 100+
- **Firefox**: 100+
- **Safari**: 15+

### Required Features
- ES2022 syntax
- CSS Grid & Flexbox
- SVG support
- CSS backdrop-filter (glassmorphism)
- CSS custom properties
- CSS animations

### Progressive Enhancement
- Works without JavaScript: No (requires JS)
- Works without CSS: No (presentation layer)
- Works on mobile: Yes (responsive design)

## Deployment

### Static Hosting
**Any static file host:**
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

### Build Output
```bash
npm run build
# Generates: dist/
#   ├── index.html
#   ├── assets/
#   │   ├── index-[hash].js
#   │   └── index-[hash].css
#   └── fonts/ (if embedded)
```

### Environment Variables
None required (no backend, no API keys)

## Testing Strategy (Future)

### Unit Tests
- **Vitest** - Fast unit test runner
- Test game logic functions
- Test state transformations

### Integration Tests
- **Playwright** - E2E testing
- Test user interactions
- Test game flow

### Visual Regression
- **Percy** or **Chromatic**
- Catch visual bugs
- Test across browsers

## File Size Targets

### Production Bundle
- **JS**: < 150KB gzipped (SolidJS + D3 + game code)
- **CSS**: < 10KB gzipped
- **Fonts**: ~30KB (JetBrains Mono woff2)
- **Total**: < 200KB first load

### Load Performance
- **First Paint**: < 1 second
- **Interactive**: < 2 seconds
- **Fully Loaded**: < 3 seconds

## Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
```

### Production Build
```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Deployment
```bash
npm run build
# Upload dist/ folder to static host
```

## Architecture Patterns

### Component Communication
```
GameState (Store)
     ↓
   App.jsx
     ↓
  ┌──┴──┬──────┬─────────┐
  ↓     ↓      ↓         ↓
Rothko Galaxy System  Stats
Frame   Map   Panel   Panel
        ↓
    (D3 SVG)
```

### Data Flow
```
User Interaction (Click)
     ↓
Event Handler
     ↓
Update Store (setGameState)
     ↓
Solid Reactive Updates
     ↓
createEffect Triggers
     ↓
D3 Re-render
```

### Separation of Concerns
- **SolidJS**: UI state, reactive updates, event handling
- **D3.js**: Visualization, pan/zoom, SVG manipulation
- **Pure CSS**: All styling and animations
- **Store**: Game logic and state management

## Dependencies Summary

```json
{
  "dependencies": {
    "solid-js": "^1.8.0",
    "d3": "^7.9.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-solid": "^2.10.0"
  }
}
```

**Total production dependencies: 2**
**Total bundle size: ~160KB (gzipped)**

## Key Technical Decisions Summary

| Choice | Reason | Trade-off |
|--------|--------|-----------|
| SolidJS | Fast, small, reactive | Smaller ecosystem than React |
| D3.js | Perfect for data viz | Learning curve |
| Pure CSS | Performance, reusability | More files to manage |
| Vite | Fast dev, zero config | Node.js required for dev |
| No TypeScript | Faster iteration | Less type safety |
| No testing (Phase 1) | Ship faster | Manual testing needed |
| Client-only | Simple deployment | No multiplayer (Phase 1) |

## Future Technical Considerations

### Phase 2 (AI Opponents)
- **Web Workers**: Run AI logic off main thread
- **IndexedDB**: Save game state locally

### Phase 3 (Multiplayer)
- **WebSockets**: Real-time communication
- **Backend**: Node.js + Express or Deno
- **Database**: PostgreSQL or Firebase

### Phase 4 (Mobile)
- **Touch events**: Pinch-to-zoom, drag gestures
- **PWA**: Install as app
- **Responsive layout**: Adapt to smaller screens
