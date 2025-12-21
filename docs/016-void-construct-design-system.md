# Void Construct Design System

## 1. Design Philosophy

The **Void Construct** style (also referred to as "Luminescent Structuralism") is a UI and illustrative aesthetic that combines the abstraction of color field painting (Rothko) with the rigid logic of architectural schematics.

It is defined by:

- **Monochrome Minimalism:** Strictly grayscale. Depth is conveyed through opacity, not color.
- **Grid-Based Abstraction:** All forms are derived from a strict coordinate system (typically 5x5), representing complex objects through low-resolution silhouettes.
- **Luminosity:** The interface mimics light projected through glass or suspended in a void. "Core" elements act as light sources.
- **Negative Space:** The black background is not empty space; it is the medium in which the structures float.

## 2. The Palette

The system uses a single hue (White `#FFFFFF`) varying only in alpha transparency against a Pure Black `#000000` background.

| **Variable** | **Value** | **Usage** |
|---|---|---|
| **Canvas** | `#000000` | The background. Absolute void. |
| **Depth** | `rgba(255, 255, 255, 0.04)` | Background layers, shadows, distant structures. |
| **Structure** | `rgba(255, 255, 255, 0.08)` | Main body of buildings, standard components. |
| **Accent** | `rgba(255, 255, 255, 0.15)` | Highlights, windows, secondary details. |
| **Borders** | `rgba(255, 255, 255, 0.25)` | Edge definition. Often slightly brighter than the fill. |
| **Core** | `#FFFFFF` | Energy sources, focal points, active UI elements. |
| **Glow** | `0 0 20px rgba(255, 255, 255, 0.5)` | Applied to Cores to simulate light emission. |

## 3. The Grid System

Every object lives within a relative grid container.

- **Standard Grid:** 5x5 matrix.
- **CSS Implementation:**

```css
.construct-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    width: 180px;
    height: 180px;
}
```

- **Overlapping:** Elements are **not** restricted to single cells. They span multiple rows/columns using `grid-area`.
- **Layering:** Elements occupy the same grid cells to create depth. A `.depth` block might sit at `1/1/6/6` (covering the whole grid) while a `.structure` block sits on top at `3/2/5/5`.

## 4. Element Hierarchy (CSS Classes)

To reproduce the style, assign these classes to your grid `div`s:

1. **`.depth`**: The foundation. No border or very faint border. Pushes visual weight backward.
   - *Use for:* Background framing, shadows, rear infrastructure.

2. **`.structure`**: The defining shape. Visible borders.
   - *Use for:* Walls, roofs, main chassis.

3. **`.accent`**: Decorative details. Higher opacity.
   - *Use for:* Pipes, cables, support beams, secondary plating.

4. **`.core`**: The "Active" element. Solid white + Glow.
   - *Use for:* Reactors, windows, resources, data nodes.

5. **`.res-shape` / Custom Shapes**: Used for non-square elements.
   - *Technique:* Use `clip-path` to carve triangles, hexagons, or trapezoids out of standard blocks.

## 5. Animation Guidelines

Animations must be **functional** and **responsive**, never random.

- **Trigger:** Almost always `hover`. The world is static until interacted with.
- **Easing:** Use `cubic-bezier` (e.g., `0.16, 1, 0.3, 1`) for a "heavy, mechanical" feel. Avoid linear ease.
- **Types:**
  - *Expansion:* Scale up (1.05x to 1.1x) to suggest activation.
  - *Mechanical:* Translation (sliding parts), Rotation (gears/radar).
  - *Deconstruction:* Elements drifting apart (like the Volatiles icon).
  - *Juggling:* Elements swapping coordinates (like the Isotopes icon).

## 6. How to Create a New Element

**Task:** Create a **Satellite Dish**.

**Step 1: The Silhouette (Mental Map)**

- A base (bottom center).
- A neck (middle).
- A large dish (curved or angled, top).
- A signal emitter (focus point).

**Step 2: The Grid Mapping**

- *Base:* Row 5, Columns 2-5 (`5 / 2 / 6 / 5`).
- *Neck:* Row 4, Column 3 (`4 / 3 / 5 / 4`).
- *Dish:* Needs to be wide. Rows 2-3, Columns 1-6. We might use `clip-path` to make it a crescent or trapezoid.
- *Emitter:* Floating in Row 1 or 2.

**Step 3: The Code Construction**

```jsx
<div class="building-wrapper">
    <div class="construct-grid satellite">
        <!-- 1. The Dish (Background/Depth) -->
        <div class="block structure dish"></div>
        <!-- 2. The Neck (Structure) -->
        <div class="block accent neck"></div>
        <!-- 3. The Base (Foundation) -->
        <div class="block depth base"></div>
        <!-- 4. The Signal (Core/Glow) -->
        <div class="block core emitter"></div>
    </div>
    <div class="label">COMM_RELAY</div>
</div>
```

**Step 4: The Styling (CSS)**

```css
/* Base: Wide and grounded */
.satellite .base { grid-area: 5 / 2 / 6 / 5; }

/* Neck: Thin vertical connector */
.satellite .neck { grid-area: 4 / 3 / 5 / 4; }

/* Dish: Abstract trapezoid shape */
.satellite .dish {
    grid-area: 2 / 1 / 4 / 6;
    clip-path: polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%); /* Inverted Trapezoid */
}

/* Emitter: Floating point above */
.satellite .emitter {
    grid-area: 1 / 3 / 2 / 4;
    border-radius: 50%;
    width: 50%;
    height: 50%;
    justify-self: center;
    align-self: center;
}

/* Interaction: Tilt the dish on hover */
.satellite .dish {
    transition: transform 0.5s ease;
    transform-origin: bottom center;
}

.building-wrapper:hover .satellite .dish {
    transform: rotate(-15deg);
}
```

## Reference Implementation

The Void Construct system is designed to be:

- **Systematic:** Follow the grid, palette, and hierarchy consistently.
- **Extensible:** New elements can be created by combining grid regions and clip-path techniques.
- **Responsive:** Animations add interactivity without breaking the minimalist aesthetic.
- **Performant:** Grid-based layout and opacity changes are GPU-accelerated.

When designing new UI components or building icons, reference this system to maintain visual cohesion across the game.
