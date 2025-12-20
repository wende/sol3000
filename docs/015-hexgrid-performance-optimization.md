# 015 - HexGrid Performance Optimization

## Summary

This document captures the journey of optimizing the HexGrid (planet view) component from ~11-16 FPS during interaction to a smooth 120 FPS. The final solution was surprisingly simple, but we learned important lessons about what doesn't work along the way.

## The Problem

The HexGrid view displayed building components in a hex pattern. Performance degraded severely when:
- Adding more buildings to the grid
- Dragging/panning the view
- Zooming in and out

Initial measurements showed **11-16 FPS** while dragging with 80 buildings displayed.

---

## What We Tried (And Failed)

### 1. JavaScript-Level Optimizations

**Attempted:**
- Memoized hex array generation in App.jsx
- Made construction timer conditional
- Pre-computed hex polygon points and edge offsets
- Memoized hex pixel positions with `createMemo`

**Result:** No measurable improvement. The bottleneck wasn't in JS computation.

---

### 2. SVG foreignObject Approach

**The Setup:** Buildings were rendered inside SVG using `<foreignObject>` to embed HTML components within the SVG coordinate system.

**The Problem:** `foreignObject` is expensive because it bridges two rendering contexts (SVG and HTML). The browser has to:
1. Render the HTML content
2. Composite it into the SVG layer
3. Handle coordinate transformations between the two systems

**Result:** This was identified as a major performance culprit. Even with all other optimizations, foreignObject added significant overhead per element.

---

### 3. HTML Overlay Layer

**Attempted:** Separate the SVG (for hex outlines) from HTML (for buildings) into two layers:
- SVG layer for hex grid lines
- HTML layer positioned on top for building components

**Initial Bug:** Each building was calculating its own screen position on every frame instead of using a single container transform.

**After Fix:** Better, but still not great. The issue was the sheer number of animated elements.

---

### 4. Pre-rendering Buildings to Images

We attempted to "bake" the BuildingConstruct components to static images at startup, then render simple `<img>` tags instead of complex component trees.

#### Attempt 4a: html2canvas
```javascript
import html2canvas from 'html2canvas';
const canvas = await html2canvas(element);
```
**Result:** Failed with `[Violation] Avoid using document.write()`. The library uses techniques incompatible with modern CSP and causes console spam.

#### Attempt 4b: html-to-image
```javascript
import { toPng } from 'html-to-image';
const dataUrl = await toPng(element);
```
**Result:** Elements rendered off-screen (for capture) produced empty/blank images. Moving them on-screen with `opacity: 0` didn't help reliably.

#### Attempt 4c: Native SVG foreignObject to Canvas
```javascript
const svgString = `<svg><foreignObject>${element.outerHTML}</foreignObject></svg>`;
const blob = new Blob([svgString], { type: 'image/svg+xml' });
const img = new Image();
img.src = URL.createObjectURL(blob);
ctx.drawImage(img, 0, 0);
canvas.toDataURL(); // ERROR!
```
**Result:** `SecurityError: Tainted canvases may not be exported`. When you draw an image from a blob URL containing foreignObject, the canvas becomes "tainted" and cannot be exported. This is a browser security restriction that cannot be bypassed.

**Conclusion:** Pre-rendering HTML components to images is effectively impossible in browsers due to security restrictions. All three major approaches failed.

---

### 5. Simplified SVG Building Icons

**Attempted:** Created `BuildingIcons.jsx` with lightweight pure-SVG versions of each building type. These were hand-crafted SVG shapes that approximated the look of BuildingConstruct.

**Result:** Performed great, but **looked completely different** from the original designs. The BuildingConstruct components have a distinctive CSS Grid-based isometric block style that couldn't be replicated with simple SVG paths.

**User Feedback:** "There's no point in optimizing if they look completely different."

---

### 6. View Rendering Overlap

**Discovery:** The GalaxyMap SVG was still being rendered underneath the HexGrid, even when not visible. Both views were always in the DOM, just with different z-index/opacity.

**Fix:** Made views mutually exclusive using SolidJS `<Show when={}>`:
```jsx
<Show when={gameState.viewState() === 'galaxy'}>
  <GalaxyMap ... />
</Show>
<Show when={gameState.viewState() === 'planet'}>
  <HexGrid ... />
</Show>
```

**Result:** Helped, but wasn't the main issue.

---

## What Actually Worked

### The Revelation

We stripped everything back to basics: display the actual BuildingConstruct components in a simple HTML grid with just CSS positioning. No SVG wrappers, no foreignObject, no pre-rendering tricks.

**Test setup:**
- 80 BuildingConstruct components
- Pure HTML/CSS positioning
- `overflow: auto` for scrolling

**Result:** The components themselves performed fine! The issue was never the components - it was all the "optimization" layers we'd added around them.

---

### The Winning Optimizations

#### 1. Container-Level Transforms

Instead of each building calculating its own position during pan/zoom:

```jsx
// BAD - each element transforms
<div style={{ transform: `translate(${pan.x + item.x}, ${pan.y + item.y})` }}>

// GOOD - container transforms, children use static positions
<div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
  <div style={{ position: 'absolute', left: item.x, top: item.y }}>
```

#### 2. CSS `contain` Property

```jsx
<div style={{ contain: 'layout style paint' }}>
  <BuildingConstruct ... />
</div>
```

This tells the browser that changes inside this element don't affect anything outside, allowing it to optimize repaints.

#### 3. Disable Transitions During Interaction (Initial Approach)

```jsx
<div class={isDragging() ? 'dragging' : ''}>
  ...
</div>

<style>{`
  .dragging * {
    transition: none !important;
    animation: none !important;
  }
`}</style>
```

**Result:** Jumped from **11-16 FPS to 120 FPS**. The CSS transitions were the killer - the browser was recalculating styles for 80+ components on every frame during drag.

#### 4. Flip the Transition Logic (Final Optimization)

The initial approach caused a stutter when starting/stopping a drag because toggling the class triggered a mass style recalculation.

**Solution:** Keep transitions OFF by default, only enable on hover:

```jsx
<div class={`hex-grid-container ${isInteracting() ? '' : 'allow-hover'}`}>

<style>{`
  /* Transitions OFF by default - no mass recalc on drag start */
  .hex-grid-container * {
    transition: none !important;
    animation: none !important;
  }
  /* Only enable on the specific hovered element when idle */
  .hex-grid-container.allow-hover *:hover,
  .hex-grid-container.allow-hover *:hover * {
    transition: all 0.15s ease !important;
  }
`}</style>
```

**Why this works:** Starting a drag only affects the single currently-hovered element (if any), not all 120 elements. No mass recalculation = no stutter.

#### 5. D3-Style Exponential Zoom

For natural-feeling zoom, use multiplicative scaling (like D3) instead of additive:

```javascript
// BAD - linear zoom feels unnatural
const newZoom = zoom + direction * 0.1;

// GOOD - exponential zoom, consistent feel at all levels
const wheelDelta = -e.deltaY * 0.002;
const zoomFactor = Math.pow(2, wheelDelta);
const newZoom = zoom * zoomFactor;
```

#### 6. Zoom Toward Cursor

```javascript
const rect = e.currentTarget.getBoundingClientRect();
const mouseX = e.clientX - rect.left;
const mouseY = e.clientY - rect.top;

const zoomRatio = newZoom / zoom();
const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
```

---

## Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Container (overflow: hidden, cursor: grab)              │
│ - Mouse event handlers for drag                         │
│ - Wheel handler for zoom                                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Transform Layer                                   │  │
│  │ transform: translate(pan) scale(zoom)             │  │
│  │ will-change: transform                            │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ SVG Layer (pointer-events: none)            │  │  │
│  │  │ - Hex grid outlines                         │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                   │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │  │
│  │  │Building │ │Building │ │Building │ ...        │  │
│  │  │contain: │ │contain: │ │contain: │            │  │
│  │  │layout   │ │layout   │ │layout   │            │  │
│  │  └─────────┘ └─────────┘ └─────────┘            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Key Lessons

### 1. CSS Transitions Are Expensive at Scale
Having `transition: all 0.3s` on 80+ elements means the browser recalculates styles for all of them every frame during any change. This is the #1 performance killer.

### 2. foreignObject Is a Performance Anti-Pattern
Embedding HTML in SVG via foreignObject should be avoided for frequently-updated or numerous elements. Use separate HTML/SVG layers instead.

### 3. Pre-rendering HTML to Images Is Impossible
Browser security restrictions (tainted canvas) make it impossible to reliably convert HTML components to static images. Don't waste time on this approach.

### 4. Simple HTML/CSS Often Beats Complex Optimizations
Before adding SVG wrappers, canvas rendering, or other "optimizations", try the simplest possible approach. It might already be fast enough.

### 5. Measure First
Adding an FPS counter early in the process (`requestAnimationFrame` loop counting frames per second) made it easy to quantify improvements and identify regressions.

### 6. Flip the Default for Conditional Styling
Instead of "enable X by default, disable during interaction" (causes mass recalc when starting), use "disable X by default, enable only for specific elements on hover" (affects only 1 element at a time).

---

## Performance Results

| Configuration | FPS (while dragging) |
|--------------|---------------------|
| Original (foreignObject + transitions) | 11-16 FPS |
| HTML overlay + transitions disabled during drag | 120 FPS |
| Final (transitions off by default) | 120 FPS, no stutter |

---

## Files Modified

- `src/components/game/HexGrid.jsx` - Complete rewrite using HTML/CSS approach
- `src/App.jsx` - Made views mutually exclusive with `<Show when={}>`
- `src/hooks/useBuildingImages.js` - Created then abandoned (pre-rendering doesn't work)
- `src/components/game/BuildingIcons.jsx` - Created then abandoned (looked different)

---

## Future Considerations

### Virtualization
For very large grids (hundreds of hexes), consider only rendering buildings visible in the viewport. The current approach renders all 120 buildings regardless of visibility.

### LOD (Level of Detail)
At very low zoom levels, could swap complex BuildingConstruct components for simpler representations (colored circles, icons, etc.).

### Web Workers
Style calculations could potentially be offloaded, but likely unnecessary given current performance.
