# 001: SVG Gradient Fade on Tether Lines - Technical Challenges

## Overview
Attempted to implement a directional gradient fade effect on FTL tether lines (connections from 2-hop to 3-hop systems) where the lines would fade from opaque at the source to transparent at the target.

## What Was Attempted
Create dynamic SVG `<linearGradient>` elements that:
- Point from the source system to the target system using `gradientUnits="userSpaceOnUse"`
- Fade from 30% opacity at the source to 0% opacity at the target
- Automatically update as the map pans/zooms

## Issues Encountered

### 1. Fragment-Level Defs Don't Work
**Problem:** Defining `<defs>` inside a JSX fragment (`<>...</>`) within a component:
```jsx
<>
  <defs>
    <For each={routes}>
      {/* gradients */}
    </For>
  </defs>
  <For each={routes}>
    {/* lines using gradients */}
  </For>
</>
```
**Result:** Gradients were not accessible to the line elements.

**Root Cause:** SVG elements rendered in fragments don't properly maintain parent-child relationships needed for `url(#id)` references to resolve.

### 2. Scoped Defs in Groups Failed
**Problem:** Wrapping each gradient in its own `<g>` element:
```jsx
<g>
  <defs>
    <linearGradient id={`tether-fade-${idx()}`}>
  </defs>
  <line stroke={`url(#tether-fade-${idx()})`} />
</g>
```
**Result:** Gradients still didn't apply to lines.

**Root Cause:** SVG defs are global to their closest SVG ancestor, not local to a group. Nested defs can create scoping issues.

### 3. Main SVG Defs with Dynamic Coordinates
**Problem:** Moving gradient definitions to the main SVG's `<defs>` block and using dynamic coordinates:
```jsx
<defs>
  <For each={tetherRoutes()}>
    {(tether, idx) => (
      <linearGradient
        id={`tether-fade-${idx()}`}
        x1={tether.source.x}
        y1={tether.source.y}
        x2={tether.target.x}
        y2={tether.target.y}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
        <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
      </linearGradient>
    )}
  </For>
</defs>
```
**Result:** Lines rendered but gradients didn't appear; lines remained completely invisible or showed no fade effect.

**Root Causes:**
- **ID Mismatch:** The `idx()` function call in JSX creates new values on each render. The gradient ID generated during defs creation might not match the ID reference in the tether lines.
- **Coordinate System Issues:** With `gradientUnits="userSpaceOnUse"`, the coordinates are in the global SVG coordinate space. When the SVG is zoomed/panned via a `<g>` transformation, these coordinates become invalid relative to the viewport.
- **Reactivity Timing:** Solid.js reactivity might update the tether lines and gradient defs at different times, causing ID references to be out of sync.

### 4. Why Simple Opacity Works
Reducing opacity to 0.2 works reliably because:
- No external ID references needed
- No coordinate system dependencies
- Simple CSS attribute, applies immediately
- Doesn't depend on gradient scoping rules

## Lessons Learned
1. **SVG `<defs>` are tricky in reactive frameworks:** Dynamic IDs with `For` loops create fragile references that can become misaligned.
2. **`gradientUnits="userSpaceOnUse"` + Transforms = Trouble:** When the SVG has nested transformations (zoom/pan via `<g>`), absolute coordinates in gradients don't update correctly.
3. **Prefer Simple CSS Over SVG Decorators:** For fade effects in a reactive context, opacity is more reliable than gradients.
4. **Fragment Rendering Has Limitations:** Don't assume JSX fragments preserve SVG parent-child semantics needed for resource references.

## Alternative Approaches Not Tried
- **CSS Masks:** Could create a mask with gradient opacity, but would have same coordinate system issues.
- **Multiple Overlay Lines:** Render multiple lines with decreasing opacity at different positions along the route (hacky but might work).
- **Canvas-Based Rendering:** Use canvas instead of SVG for these specific lines (overkill).
- **Static Gradient Definitions:** Pre-define a set of common gradients at a 45-degree angle and reuse them (limits expressiveness).

## Final Solution
Use reduced opacity (`opacity="0.2"`) on tether lines with the standard `ftl-line` class. This:
- Renders consistently across all browsers
- Works with the existing animation system
- Doesn't require debugging ID reference issues
- Gives the visual effect of "fading into the unknown" without complexity
