# View Manipulation - Double-Click Zoom and Center

## Overview
Implemented double-click zoom functionality that centers a system in the viewport and zooms to a fixed level.

## Implementation Details

### Key Components

1. **Double-Click Detection** (App.jsx:161-162, 229-254)
   - Track click timing with `lastClickTime` and `lastClickId`
   - Detect double-clicks within 300ms window on the same system
   - Custom handler prevents conflicts with D3's built-in behavior

2. **Center and Zoom Function** (App.jsx:189-226)
   ```javascript
   const centerOnSystem = (sys) => {
     const svg = d3.select(svgRef);
     const targetScale = 1.5; // Fixed zoom level

     const centerX = window.innerWidth / 2;
     const centerY = window.innerHeight / 2;

     // Transform composition: translate to center, scale, translate system to origin
     const transform = d3.zoomIdentity
       .translate(centerX, centerY)
       .scale(targetScale)
       .translate(-sys.x, -sys.y);

     svg.transition()
       .duration(750)
       .call(zoomBehavior.transform, transform);
   };
   ```

3. **Disable D3's Default Double-Click** (App.jsx:180)
   ```javascript
   svg.on('dblclick.zoom', null);
   ```

## Critical Fix

**Problem**: D3.zoom has a built-in double-click behavior that zooms incrementally (2x from current position), which conflicts with custom zoom-to-fixed-level behavior.

**Solution**: After calling `svg.call(zoomBehavior)`, immediately disable the default handler with `svg.on('dblclick.zoom', null)`. This allows only our custom handler to run.

## D3 Transform Composition

The correct way to zoom to a point and center it:
```javascript
d3.zoomIdentity
  .translate(viewportCenterX, viewportCenterY)  // Move to viewport center
  .scale(targetScale)                            // Apply zoom
  .translate(-targetX, -targetY)                 // Move target to origin
```

This ensures the target point ends up exactly centered in the viewport at the desired zoom level.

## Behavior

- **Single Click**: Selects system (opens sidebar)
- **Double Click**: Selects system AND centers/zooms to it
  - Target zoom level: 1.5x (fixed, not incremental)
  - Animation duration: 750ms
  - Smooth transition with D3's built-in interpolation

## Related Files
- `src/App.jsx`: GalaxyMap component (lines 156-315)
