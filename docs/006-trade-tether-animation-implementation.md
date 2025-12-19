# 006 - Trade Tether Animation Implementation

## Overview

Trade tethers show animated flow when an FTL route connects a Metals Supply (M+) system to a Metals Demand (M-) system. This document covers both implementations: the current CSS-based animation and the archived canvas particle system.

## Current Implementation: CSS Dash Animation

**Status:** Active (in production)
**Location:** `src/index.css` (lines 366-401), `src/components/game/FTLRoute.jsx`

### How It Works

1. **Detection Logic** (`GalaxyMap.jsx`):
   ```javascript
   const connectsMetalsSupplyDemand =
     (hasMetalsSupply(route.source) && hasMetalsDemand(route.target)) ||
     (hasMetalsDemand(route.source) && hasMetalsSupply(route.target));

   isTrade={isBuilt && connectsMetalsSupplyDemand}
   ```

2. **Visual Rendering** (`FTLRoute.jsx`):
   - **Base line**: Static white line (`ftl-line-trade-base`)
   - **Flow overlay**: Animated dashed line on top (`ftl-line-trade-flow`)

3. **CSS Animation**:
   ```css
   @keyframes tradePulse {
     to { stroke-dashoffset: -120; }
   }

   .ftl-line-trade-flow {
     stroke: rgba(255, 255, 255, 0.75);
     stroke-width: 3px;
     stroke-dasharray: 1, 14;
     stroke-dashoffset: 0;
     stroke-linecap: square;
     animation: tradePulse 2.5s linear infinite;
     will-change: stroke-dashoffset;
     opacity: 0.75;
     filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.35));
   }
   ```

### Advantages

- ✅ **Simple**: Pure CSS, no JavaScript animation loop
- ✅ **Performant**: Hardware-accelerated via `will-change`
- ✅ **Lightweight**: No canvas context management
- ✅ **Consistent**: Syncs perfectly with SVG zoom/pan
- ✅ **Fast**: 2.5s loop, highly visible

### Parameters

- **Speed**: 2.5 seconds per animation loop
- **Dash pattern**: `1, 14` (1px dash, 14px gap)
- **Stroke width**: 3px (thicker than base line)
- **Direction**: Can be reversed via `animation-direction: reverse`

## Archived Implementation: Canvas Particle System

**Status:** Archived (not in production)
**Location:** `src/components/game/TetherFlowShowcase.canvas-backup.jsx`

### How It Worked

1. **Canvas Overlay**: Positioned absolutely over SVG with `pointer-events: none`
2. **Particle Management**: 40 particles per trade route
3. **Animation Loop**: `requestAnimationFrame` at 60fps
4. **Transform Sync**: Canvas transform matched D3 zoom/pan state

### Particle Properties

```javascript
{
  t: 0-1,                    // Progress along route
  speed: 0.002-0.004,        // Speed per frame
  size: 2-4px,               // Square particle size
  offset: ±6-10px,           // Perpendicular offset (dual-lane effect)
  opacity: 0.4-0.8,          // Base opacity
  flickerOffset: 0-100       // For optional flicker effect
}
```

### Why It Was Archived

- ❌ **Complex**: Required D3 transform tracking and sync
- ❌ **Overkill**: 60fps animation for simple dash effect
- ❌ **Transform Issues**: Canvas transform needed manual sync with SVG
- ❌ **Visual Issues**: Particle rendering looked "jumpy" at certain zoom levels
- ✅ **Performance**: Was actually quite performant (60fps stable)

### Future Use Cases

The canvas implementation could be useful for:
- **Complex particle effects** (e.g., explosions, warp jumps)
- **Dynamic flow visualization** (varying particle density/speed)
- **Interactive effects** (particles react to mouse/click)
- **Multi-route optimizations** (render all routes in one canvas)

## Implementation Details

### Route ID System

**Critical Fix**: Route IDs must use system IDs, not array indices:

```javascript
// ❌ BAD (breaks on save/load):
const routeId = [i, other.idx].sort().join('-');

// ✅ GOOD (stable across sessions):
const routeId = [sys.id, systems[other.idx].id].sort((a, b) => a - b).join('-');
```

### Reactivity Fix

**Critical**: `builtFTLs` must be passed to component, not pre-computed:

```javascript
// ❌ BAD (doesn't react to changes):
const isBuilt = props.builtFTLs?.has(routeId);

// ✅ GOOD (reactive):
const isBuilt = () => props.builtFTLs?.has(props.routeId);
```

### Market Data Detection

```javascript
const hasMetalsSupply = (system) => (system?.market?.metals?.supply || 0) > 0;
const hasMetalsDemand = (system) => (system?.market?.metals?.demand || 0) > 0;
```

Market data is generated in `generateGalaxy()`:
- **Probability**: 55% chance any system has a market role
- **Supply/Demand**: 50/50 split (with bias based on resources)
- **Values**: 200-1200 units

## Testing

1. **New Game**: Start fresh to get market data
2. **Find M+ system**: Check sidebar for "METALS MARKET → SUPPLY"
3. **Find M- system**: Check sidebar for "METALS MARKET → DEMAND"
4. **Build FTL**: Connect M+ to M- route
5. **Verify**: Should see solid line + animated dashes immediately

Console will log:
```
🔨 Built FTL on route X-Y. Total built: 1
📊 Built FTL Routes: 1 total (1 trade, 0 regular)
🔵 Trade routes (should have ANIMATED flow):
  X-Y: SystemA (S:500 D:0) ↔ SystemB (S:0 D:800)
```

## Migration

Old saves are automatically migrated:
1. **Market data**: Added if missing (`migrateSaveData`)
2. **Route IDs**: Converted from index-based to ID-based (`migrateRouteIds`)

See `src/utils/gameState.js` lines 935-993 for migration logic.

## Related Files

- `src/components/game/FTLRoute.jsx` - Route rendering component
- `src/components/game/GalaxyMap.jsx` - Trade route detection and rendering
- `src/utils/galaxy.js` - Market generation, route ID creation
- `src/utils/gameState.js` - Save migration logic
- `src/index.css` - Animation CSS definitions
