# HexGrid Progress Ring Post-Mortem

## Summary

The construction progress ring in HexGrid (planet view) was not animating - it rendered once but never updated. Debugging took an extended time due to multiple red herrings before finding the root cause.

## Root Cause

The `onMount` callback was being passed as an option to `useZoomableSvg()`, but that hook doesn't support an `onMount` option. It only supports `onInitialize` and `onDispose`.

```javascript
// BROKEN - onMount is not a supported option
const { setSvgRef, setGroupRef } = useZoomableSvg({
  minScale: MIN_SCALE,
  maxScale: MAX_SCALE,
  onZoom: (event) => { ... },
  onInitialize: ({ svg, zoomBehavior, d3 }) => { ... },
  onMount: () => {  // <-- NEVER CALLED
    const progressInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
    return () => clearInterval(progressInterval);
  }
});
```

Because `onMount` was never called, the interval that updates `currentTime` every 100ms was never started. This meant:
1. `currentTime` signal stayed at its initial value
2. `createEffect` tracking `currentTime()` only ran once
3. Progress never updated, ring stayed static

## The Fix

Move the interval setup to SolidJS's proper `onMount` lifecycle hook:

```javascript
const { setSvgRef, setGroupRef } = useZoomableSvg({
  minScale: MIN_SCALE,
  maxScale: MAX_SCALE,
  onZoom: (event) => { ... },
  onInitialize: ({ svg, zoomBehavior, d3 }) => { ... }
});

// Use SolidJS onMount, not a hook option
onMount(() => {
  const progressInterval = setInterval(() => {
    setCurrentTime(Date.now());
  }, 100);
  onCleanup(() => clearInterval(progressInterval));
});
```

## Additional Fixes Required

### 1. createMemo vs createEffect for time-based updates

`createMemo` doesn't properly re-run when `currentTime()` changes because it caches the result. Changed to `createEffect` + signal:

```javascript
// Before (broken)
const constructionProgressMap = createMemo(() => {
  const now = currentTime();
  // ...
});

// After (working)
const [constructionProgressMap, setConstructionProgressMap] = createSignal(new Map());

createEffect(() => {
  const now = currentTime();
  // ...
  setConstructionProgressMap(map);
});
```

### 2. SVG pathLength attribute issues

The `SystemProgressRing` component used `pathLength={100}` which didn't render in the HexGrid context. Replaced with inline circle using manual circumference calculation:

```javascript
<circle
  stroke-dasharray={`${(progress / 100) * 2 * Math.PI * r} ${2 * Math.PI * r}`}
  transform="rotate(-90)"
  style={{ transition: 'stroke-dasharray 150ms linear' }}
/>
```

### 3. Boundary segments showing buildings, not selection

The `boundarySegments` memo was checking `selectedSet` but should check `hexBuildings` to outline all built hexes:

```javascript
// Before
const selectedHexes = props.hexes.filter(h => selected.has(h.id));

// After
const builtHexes = props.hexes.filter(h => buildings[h.id]);
```

### 4. Smooth animation

Added CSS transition to prevent stuttery updates (100ms interval → 150ms transition):

```javascript
style={{ transition: 'stroke-dasharray 150ms linear' }}
```

## Red Herrings During Debugging

1. **SVG `pathLength` attribute** - Suspected browser compatibility issues. Partially correct - it worked in GalaxyMap but not HexGrid for unclear reasons.

2. **`createMemo` reactivity** - Suspected memo wasn't tracking `currentTime()` properly. This was actually a real issue that needed fixing.

3. **SVG `transform` attribute** - Suspected `transform="rotate(-90)"` wasn't working in nested SVG context. Tried CSS transforms, `<g>` wrappers. Not the issue.

4. **Negative progress values** - Console showed progress like `-375.05` because `currentTime()` was stale (set at component mount) while `construction.startTime` was fresh. This was a symptom, not the cause.

## Lessons Learned

1. **Check if hook options actually exist** - When passing options to a custom hook, verify the hook actually reads those options. TypeScript would have caught this.

2. **Debug the timer first** - When animations don't update, verify the timer/interval is actually running before investigating rendering issues.

3. **Console log at the source** - The breakthrough came when logging showed the effect only ran once and progress was negative, pointing to a stale `currentTime`.

4. **Don't overwrite entire files** - During debugging, reverting files caused additional breakage that complicated the debugging process.

5. **Verify working state before debugging** - The feature was added but never actually worked. Checking if it ever worked would have saved time.

## Files Changed

- `src/components/game/HexGrid.jsx`:
  - Fixed `onMount` placement (use SolidJS lifecycle, not hook option)
  - Changed `createMemo` to `createEffect` + signal for progress map
  - Changed boundary segments to outline buildings instead of selected hexes
  - Added inline circle implementation with CSS transition for smooth animation
  - Made `isSelected` a function for proper reactivity
