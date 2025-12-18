# GalaxyMap Component

## Purpose

The core D3.js visualization component that renders the galaxy, handles pan/zoom interactions, and manages star system selection. This is where D3 and SolidJS integrate.

## File Location
```
src/components/GalaxyMap.jsx
```

## Responsibilities

1. **D3 SVG Rendering** - Create and update SVG elements for stars and FTL routes
2. **Pan & Zoom** - Implement d3.zoom() for navigation
3. **Interaction Handling** - Click, hover, drag events on star systems
4. **Animation** - Pulsing stars, flowing FTL lines, ripple effects
5. **State Synchronization** - React to game state changes and update visualization

## Component Structure

```jsx
export function GalaxyMap() {
  let containerRef;
  let svg, gContainer;

  onMount(() => {
    initializeD3();
  });

  createEffect(() => {
    if (gContainer) {
      updateVisualization();
    }
  });

  return (
    <div ref={containerRef} class="galaxy-map-container" />
  );
}
```

## Props

**None** - Reads from global game state

## State Management

### Local Refs (D3 Elements)
```javascript
let containerRef;       // DOM reference for D3 to mount to
let svg;                // D3 selection of <svg>
let gContainer;         // D3 selection of transform group
let linksGroup;         // D3 selection for FTL lines
let starsGroup;         // D3 selection for star systems
```

### Global State (from store)
```javascript
import { gameState, setGameState, selectSystem } from '../store/gameState';

// Reactive to:
// - gameState.systems (star system data)
// - gameState.routes (FTL route connections)
// - gameState.selectedSystem (which system is selected)
// - gameState.hoveredSystem (which system is being hovered)
```

## D3 Initialization

### Create SVG
```javascript
function initializeD3() {
  const width = 560;
  const height = 360;

  svg = d3.select(containerRef)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#000')
    .style('cursor', 'grab');

  // Create transform group for pan/zoom
  gContainer = svg.append('g').attr('class', 'g-container');

  // Create layer groups (order matters for z-index)
  linksGroup = gContainer.append('g').attr('class', 'links-layer');
  starsGroup = gContainer.append('g').attr('class', 'stars-layer');

  setupZoom();
  renderGalaxy();
}
```

### Setup Zoom
```javascript
function setupZoom() {
  const zoom = d3.zoom()
    .scaleExtent([0.8, 3.0])  // Min/max zoom levels
    .translateExtent([        // Bounds for panning
      [-200, -200],
      [760, 560]
    ])
    .on('zoom', (event) => {
      gContainer.attr('transform', event.transform);

      // Optional: save transform to game state
      setGameState('viewTransform', {
        x: event.transform.x,
        y: event.transform.y,
        k: event.transform.k
      });
    });

  svg.call(zoom);

  // Set initial transform if loading saved game
  if (gameState.viewTransform) {
    const { x, y, k } = gameState.viewTransform;
    svg.call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(k));
  }
}
```

## Rendering Functions

### Render FTL Routes (Lines)
```javascript
function renderFTLRoutes() {
  const links = linksGroup
    .selectAll('line.ftl-route')
    .data(gameState.routes, d => `${d.source}-${d.target}`)
    .join(
      enter => enter.append('line')
        .attr('class', 'ftl-route')
        .attr('stroke', 'rgba(255, 255, 255, 0.15)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,8')
        .attr('x1', d => gameState.systems[d.source].x)
        .attr('y1', d => gameState.systems[d.source].y)
        .attr('x2', d => gameState.systems[d.target].x)
        .attr('y2', d => gameState.systems[d.target].y)
        .style('opacity', 0)
        .transition()
        .duration(600)
        .style('opacity', 1),
      update => update,
      exit => exit
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove()
    );
}
```

### Render Star Systems
```javascript
function renderStarSystems() {
  const stars = starsGroup
    .selectAll('circle.star-system')
    .data(gameState.systems, d => d.id)
    .join(
      enter => {
        const group = enter.append('g')
          .attr('class', 'star-group')
          .attr('transform', d => `translate(${d.x}, ${d.y})`)
          .style('opacity', 0)
          .on('click', handleStarClick)
          .on('mouseenter', handleStarHover)
          .on('mouseleave', handleStarLeave);

        // Main star circle
        group.append('circle')
          .attr('class', 'star-system')
          .attr('r', d => d.size)
          .attr('fill', d => d.color)
          .style('--star-index', (d, i) => i); // For animation delay

        // Selection ring (hidden by default)
        group.append('circle')
          .attr('class', 'selection-ring')
          .attr('r', d => d.size + 3)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(255, 255, 255, 0.8)')
          .attr('stroke-width', 2)
          .style('opacity', 0);

        return group.transition()
          .delay((d, i) => i * 50)
          .duration(600)
          .style('opacity', 1);
      },
      update => {
        // Update selection ring visibility
        update.select('.selection-ring')
          .style('opacity', d =>
            d.id === gameState.selectedSystem?.id ? 1 : 0
          );
        return update;
      },
      exit => exit
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove()
    );
}
```

## Event Handlers

### Star Click
```javascript
function handleStarClick(event, systemData) {
  // Prevent zoom from triggering
  event.stopPropagation();

  // Update game state (triggers reactive update)
  selectSystem(systemData.id);

  // Create ripple effect
  createRippleEffect(event.clientX, event.clientY);
}
```

### Star Hover
```javascript
function handleStarHover(event, systemData) {
  // Change cursor
  d3.select(event.currentTarget)
    .style('cursor', 'pointer');

  // Scale up star
  d3.select(event.currentTarget).select('.star-system')
    .transition()
    .duration(200)
    .attr('r', systemData.size * 1.3)
    .style('filter', 'drop-shadow(0 0 18px rgba(255, 255, 255, 0.7))');

  // Update game state for tooltip
  setGameState('hoveredSystem', systemData);
}
```

### Star Leave
```javascript
function handleStarLeave(event, systemData) {
  // Reset cursor
  d3.select(event.currentTarget)
    .style('cursor', 'default');

  // Scale down star
  d3.select(event.currentTarget).select('.star-system')
    .transition()
    .duration(200)
    .attr('r', systemData.size)
    .style('filter', 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))');

  // Clear hovered state
  setGameState('hoveredSystem', null);
}
```

## Visual Effects

### Ripple Effect (Click Feedback)
```javascript
function createRippleEffect(x, y) {
  // Convert screen coordinates to SVG coordinates
  const pt = svg.node().createSVGPoint();
  pt.x = x;
  pt.y = y;
  const svgP = pt.matrixTransform(
    gContainer.node().getScreenCTM().inverse()
  );

  // Create ripple circle
  const ripple = gContainer.append('circle')
    .attr('class', 'ripple-effect')
    .attr('cx', svgP.x)
    .attr('cy', svgP.y)
    .attr('r', 5)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(255, 255, 255, 0.8)')
    .attr('stroke-width', 2);

  // Animate ripple
  ripple
    .transition()
    .duration(800)
    .ease(d3.easeCircleOut)
    .attr('r', 40)
    .style('opacity', 0)
    .on('end', function() {
      d3.select(this).remove();
    });
}
```

### Tooltip (follows cursor)
```jsx
// In JSX, overlay on SVG
<Show when={gameState.hoveredSystem}>
  <div
    class="system-tooltip"
    style={{
      position: 'fixed',
      left: `${mouseX()}px`,
      top: `${mouseY()}px`,
      transform: 'translate(-50%, -120%)'
    }}
  >
    {gameState.hoveredSystem.name}
  </div>
</Show>
```

## Reactive Updates

### Update on Game State Changes
```javascript
createEffect(() => {
  // This runs whenever systems, routes, or selection changes
  if (gContainer) {
    renderFTLRoutes();
    renderStarSystems();
  }
});

// More granular effects for performance
createEffect(() => {
  // Only update selection rings when selected system changes
  if (starsGroup) {
    starsGroup.selectAll('.selection-ring')
      .style('opacity', d =>
        d.id === gameState.selectedSystem?.id ? 1 : 0
      );
  }
});
```

## CSS Animations

### Star Pulse Animation
```css
.star-system {
  animation: starPulse 2s ease-in-out infinite;
  animation-delay: calc(-1 * var(--star-index) * 0.1s);
}

@keyframes starPulse {
  0%, 100% {
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
    opacity: 0.85;
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.7));
    opacity: 1;
  }
}
```

### FTL Line Flow
```css
.ftl-route {
  animation: ftlFlow 20s linear infinite;
}

@keyframes ftlFlow {
  to { stroke-dashoffset: -100; }
}
```

## Performance Optimizations

### Limit Re-renders
```javascript
// Only update when necessary
const memoizedSystems = createMemo(() => gameState.systems);
const memoizedRoutes = createMemo(() => gameState.routes);

createEffect(() => {
  if (gContainer && memoizedSystems()) {
    renderStarSystems();
  }
});
```

### Use D3's .join() Pattern
```javascript
// Efficient enter/update/exit pattern
.join(
  enter => enter.append('circle').attr(...),
  update => update.attr(...),
  exit => exit.remove()
)
```

### Debounce Expensive Operations
```javascript
let zoomTimeout;
const zoom = d3.zoom().on('zoom', (event) => {
  // Apply transform immediately (smooth)
  gContainer.attr('transform', event.transform);

  // Debounce state update (expensive)
  clearTimeout(zoomTimeout);
  zoomTimeout = setTimeout(() => {
    setGameState('viewTransform', { /* ... */ });
  }, 100);
});
```

## Accessibility

### Keyboard Navigation (when focused)
```javascript
onMount(() => {
  containerRef.tabIndex = 0; // Make focusable

  containerRef.addEventListener('keydown', (event) => {
    switch(event.key) {
      case 'ArrowUp':
        panView(0, -50);
        break;
      case 'ArrowDown':
        panView(0, 50);
        break;
      case 'ArrowLeft':
        panView(-50, 0);
        break;
      case 'ArrowRight':
        panView(50, 0);
        break;
    }
  });
});
```

### ARIA Labels
```jsx
<div
  ref={containerRef}
  class="galaxy-map-container"
  role="application"
  aria-label="Galaxy Map - Use arrow keys to pan, scroll to zoom"
  tabindex="0"
/>
```

## Testing Considerations

### Mock D3 in Tests
```javascript
// Test star system click without full D3
test('clicking star selects system', () => {
  const mockSystem = { id: 1, name: 'Alpha' };
  handleStarClick({ stopPropagation: () => {} }, mockSystem);
  expect(gameState.selectedSystem.id).toBe(1);
});
```

## Complete Code Example

```jsx
// src/components/GalaxyMap.jsx
import { onMount, createEffect, createMemo } from 'solid-js';
import * as d3 from 'd3';
import { gameState, setGameState, selectSystem } from '../store/gameState';
import './galaxy-map.css';

export function GalaxyMap() {
  let containerRef;
  let svg, gContainer, linksGroup, starsGroup;

  onMount(() => {
    initializeD3();
  });

  createEffect(() => {
    if (gContainer) {
      renderFTLRoutes();
      renderStarSystems();
    }
  });

  function initializeD3() {
    const width = 560;
    const height = 360;

    svg = d3.select(containerRef)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#000');

    gContainer = svg.append('g');
    linksGroup = gContainer.append('g').attr('class', 'links-layer');
    starsGroup = gContainer.append('g').attr('class', 'stars-layer');

    const zoom = d3.zoom()
      .scaleExtent([0.8, 3.0])
      .translateExtent([[-200, -200], [760, 560]])
      .on('zoom', (event) => {
        gContainer.attr('transform', event.transform);
      });

    svg.call(zoom);
  }

  function renderFTLRoutes() {
    linksGroup
      .selectAll('line.ftl-route')
      .data(gameState.routes, d => `${d.source}-${d.target}`)
      .join('line')
      .attr('class', 'ftl-route')
      .attr('stroke', 'rgba(255, 255, 255, 0.15)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,8')
      .attr('x1', d => gameState.systems[d.source].x)
      .attr('y1', d => gameState.systems[d.source].y)
      .attr('x2', d => gameState.systems[d.target].x)
      .attr('y2', d => gameState.systems[d.target].y);
  }

  function renderStarSystems() {
    const stars = starsGroup
      .selectAll('g.star-group')
      .data(gameState.systems, d => d.id)
      .join(
        enter => {
          const group = enter.append('g')
            .attr('class', 'star-group')
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .on('click', handleStarClick)
            .on('mouseenter', handleStarHover)
            .on('mouseleave', handleStarLeave);

          group.append('circle')
            .attr('class', 'star-system')
            .attr('r', d => d.size)
            .attr('fill', d => d.color);

          group.append('circle')
            .attr('class', 'selection-ring')
            .attr('r', d => d.size + 3)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255, 255, 255, 0.8)')
            .attr('stroke-width', 2)
            .style('opacity', 0);

          return group;
        }
      );

    // Update selection rings
    stars.select('.selection-ring')
      .style('opacity', d =>
        d.id === gameState.selectedSystem?.id ? 1 : 0
      );
  }

  function handleStarClick(event, data) {
    event.stopPropagation();
    selectSystem(data.id);
  }

  function handleStarHover(event, data) {
    d3.select(event.currentTarget).select('.star-system')
      .transition()
      .duration(200)
      .attr('r', data.size * 1.3);

    setGameState('hoveredSystem', data);
  }

  function handleStarLeave(event, data) {
    d3.select(event.currentTarget).select('.star-system')
      .transition()
      .duration(200)
      .attr('r', data.size);

    setGameState('hoveredSystem', null);
  }

  return (
    <div
      ref={containerRef}
      class="galaxy-map-container"
      role="application"
      aria-label="Galaxy Map"
      tabindex="0"
    />
  );
}
```
