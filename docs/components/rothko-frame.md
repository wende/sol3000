# RothkoFrame Component

## Purpose

Creates the nested glassmorphism frame layers inspired by Mark Rothko's color field paintings. Provides the visual container for the galaxy map with 4 concentric glass layers.

## File Location
```
src/components/RothkoFrame.jsx
```

## Responsibilities

1. **Visual Hierarchy** - Create 4 nested rectangular frames
2. **Centering** - Center the entire structure on screen
3. **Glassmorphism** - Apply backdrop blur and transparency effects
4. **Animation** - Scale in on load
5. **Container** - Provide mounting point for galaxy map

## Component Structure

```jsx
export function RothkoFrame(props) {
  return (
    <div class="rothko-container">
      <div class="rothko-layer rothko-layer-1">
        <div class="rothko-layer rothko-layer-2">
          <div class="rothko-layer rothko-layer-3">
            <div class="rothko-layer rothko-layer-4">
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Props

### children
- **Type**: `JSXElement`
- **Required**: Yes
- **Description**: Galaxy map component to render inside innermost layer

### Example Usage
```jsx
<RothkoFrame>
  <GalaxyMap />
</RothkoFrame>
```

## Layer Specifications

### Layer 1 (Outermost)
```css
.rothko-layer-1 {
  width: 800px;
  height: 600px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}
```

**Purpose**: Outermost glass layer, establishes the visual boundary

### Layer 2
```css
.rothko-layer-2 {
  width: 700px;
  height: 500px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

**Purpose**: Mid-outer layer, increases opacity slightly

### Layer 3
```css
.rothko-layer-3 {
  width: 600px;
  height: 400px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.20);
}
```

**Purpose**: Mid-inner layer, continues opacity progression

### Layer 4 (Innermost - Galaxy Container)
```css
.rothko-layer-4 {
  width: 560px;
  height: 360px;
  background: #000000;  /* Pure black for galaxy */
  border: 1px solid rgba(255, 255, 255, 0.25);
}
```

**Purpose**: Actual galaxy map container, black background for stars

## Layout & Positioning

### Container
```css
.rothko-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
```

**Centering Strategy**: Use fixed positioning with transform to perfectly center

### Layer Centering
```css
.rothko-layer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**Each layer centers its child using flexbox**

## Animations

### Initial Load Animation
```css
.rothko-container {
  animation: scaleIn 1s ease-out 0.5s both;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
```

**Timing**:
- Delay: 0.5s (after grid appears)
- Duration: 1s
- Effect: Fade in while scaling from 95% to 100%

### Hover Effects (Optional Polish)
```css
.rothko-layer:hover {
  border-color: rgba(255, 255, 255, 0.3);
  transition: border-color 0.3s ease;
}
```

**Interactive feedback on frame hover**

## Responsive Behavior

### Desktop (1920×1080)
Full size as specified

### Laptop (1600×900)
```css
@media (max-width: 1600px) {
  .rothko-layer-1 { width: 720px; height: 540px; }
  .rothko-layer-2 { width: 630px; height: 450px; }
  .rothko-layer-3 { width: 540px; height: 360px; }
  .rothko-layer-4 { width: 504px; height: 324px; }
}
```

**Scale factor: 0.9**

### Tablet (1200×800)
```css
@media (max-width: 1200px) {
  .rothko-layer-1 { width: 640px; height: 480px; }
  .rothko-layer-2 { width: 560px; height: 400px; }
  .rothko-layer-3 { width: 480px; height: 320px; }
  .rothko-layer-4 { width: 448px; height: 288px; }
}
```

**Scale factor: 0.8**

## Visual Hierarchy Rationale

### Size Progression
```
Layer 1: 800×600 (outer)
  ↓ -100px width, -100px height
Layer 2: 700×500
  ↓ -100px width, -100px height
Layer 3: 600×400
  ↓ -40px width, -40px height
Layer 4: 560×360 (inner)
```

**Narrower gap for final layer to maintain visual balance**

### Opacity Progression
```
Layer 1: 5%  opacity (subtle)
Layer 2: 8%  opacity (+3%)
Layer 3: 12% opacity (+4%)
Layer 4: 100% opacity (solid black)
```

**Gradual increase creates depth perception**

### Border Progression
```
Layer 1: 10% opacity border
Layer 2: 15% opacity border
Layer 3: 20% opacity border
Layer 4: 25% opacity border
```

**Increasing contrast as you go inward**

## Browser Support

### Backdrop Filter (Critical)
```css
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px); /* Safari */
```

**Fallback for unsupported browsers:**
```css
@supports not (backdrop-filter: blur(10px)) {
  .rothko-layer {
    background: rgba(255, 255, 255, 0.15); /* Slightly more opaque */
  }
}
```

## Accessibility

### Semantic Structure
The component is purely presentational, no interactive elements

### Screen Reader
```jsx
<div
  class="rothko-container"
  role="presentation"
  aria-hidden="true"
>
  {/* Layers */}
</div>
```

**Mark as presentation since it's decorative**

## Performance

### GPU Acceleration
```css
.rothko-layer {
  transform: translate3d(0, 0, 0); /* Force GPU layer */
  will-change: transform, opacity;
}
```

### Optimization Notes
- Backdrop filter is expensive, but only applied to 3 elements
- Static layout, no re-renders after initial load
- Use `will-change` sparingly (only during animation)

## Styling Variations (Future)

### Different Themes
```jsx
// Could accept theme prop for different color schemes
<RothkoFrame theme="blue">  {/* Blue glass layers */}
<RothkoFrame theme="red">   {/* Red accent */}
<RothkoFrame theme="green"> {/* Future: faction colors */}
```

### Custom Sizes
```jsx
// Accept size multiplier prop
<RothkoFrame scale={1.2}>  {/* 20% larger */}
```

## Complete CSS

```css
/* rothko-frame.css */

.rothko-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  animation: scaleIn 1s ease-out 0.5s both;
}

.rothko-layer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s ease;
}

.rothko-layer-1 {
  width: 800px;
  height: 600px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.rothko-layer-2 {
  width: 700px;
  height: 500px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.rothko-layer-3 {
  width: 600px;
  height: 400px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.20);
}

.rothko-layer-4 {
  width: 560px;
  height: 360px;
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.25);
  overflow: hidden; /* Clip galaxy map */
}

.rothko-layer:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Responsive scaling */
@media (max-width: 1600px) {
  .rothko-layer-1 { width: 720px; height: 540px; }
  .rothko-layer-2 { width: 630px; height: 450px; }
  .rothko-layer-3 { width: 540px; height: 360px; }
  .rothko-layer-4 { width: 504px; height: 324px; }
}

@media (max-width: 1200px) {
  .rothko-layer-1 { width: 640px; height: 480px; }
  .rothko-layer-2 { width: 560px; height: 400px; }
  .rothko-layer-3 { width: 480px; height: 320px; }
  .rothko-layer-4 { width: 448px; height: 288px; }
}

/* Backdrop filter fallback */
@supports not (backdrop-filter: blur(10px)) {
  .rothko-layer-1,
  .rothko-layer-2,
  .rothko-layer-3 {
    background: rgba(255, 255, 255, 0.15);
  }
}
```

## Code Example

```jsx
// src/components/RothkoFrame.jsx
import './rothko-frame.css';

export function RothkoFrame(props) {
  return (
    <div class="rothko-container" role="presentation" aria-hidden="true">
      <div class="rothko-layer rothko-layer-1">
        <div class="rothko-layer rothko-layer-2">
          <div class="rothko-layer rothko-layer-3">
            <div class="rothko-layer rothko-layer-4">
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```
