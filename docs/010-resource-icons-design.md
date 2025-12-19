# Resource Icon Design Specifications

This document outlines the visual design for the Sol3000 resource icons, ensuring stylistic coherence across the 6-resource system.

## Design Philosophy
- **Minimalist Geometry**: Icons are built from basic primitives (hexagons, circles, paths).
- **Consistent Weight**: All icons use a **2px stroke** for high legibility at small sizes (12px-24px).
- **Contextual Symbolism**: Each shape reflects the physical state or industrial application of the resource.
- **Thematic Coloration**: Designed to be monochrome (inheriting `currentColor`) to allow for UI-driven status coloring.

---

## 1. Metals (⬡ Hexagon)
**Represents**: Iron, Nickel, Aluminum, Titanium.
**Design**: A hexagon with internal perspective lines.
**Symbolism**: Atomic lattice, structural stability, foundational building blocks.
**SVG Path**:
```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2l9 5.2v10.4l-9 5.2l-9-5.2V7.2L12 2z" />
  <path d="M12 22V12" stroke-width="1.5" stroke-opacity="0.5" />
  <path d="M12 12L3 7.2" stroke-width="1.5" stroke-opacity="0.5" />
  <path d="M12 12l9-4.8" stroke-width="1.5" stroke-opacity="0.5" />
</svg>
```

## 2. Volatiles (💧 Droplet)
**Represents**: Water, Ammonia, Methane.
**Design**: A sleek droplet with a subtle interior highlight.
**Symbolism**: Fluids, life-support, fuel, liquid hydrogen/oxygen.
**SVG Path**:
```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2.6c0 0-9 8.4-9 13.4a9 9 0 1 0 18 0c0-5-9-13.4-9-13.4z" />
  <path d="M12 17a3 3 0 0 0 3-3" stroke-opacity="0.6" />
</svg>
```

## 3. Noble Gases (◉ Rings)
**Represents**: Xenon, Argon, Krypton.
**Design**: Concentric circles with a solid nucleus.
**Symbolism**: Electron shells, ion propulsion, inert stability.
**SVG Path**:
```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="9" />
  <circle cx="12" cy="12" r="5" />
  <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
</svg>
```

## 4. Rare Earths (✦ Crystal)
**Represents**: Lanthanides, Yttrium.
**Design**: A vertically elongated diamond with cross-sections.
**Symbolism**: Mineral precision, rare crystalline structures, electronics.
**SVG Path**:
```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2L4.5 12 12 22l7.5-10L12 2z" />
  <path d="M12 2v20" stroke-opacity="0.5" />
  <path d="M4.5 12h15" stroke-opacity="0.5" />
</svg>
```

## 5. Isotopes (☢ Atom)
**Represents**: He-3, Uranium, Deuterium.
**Design**: A central nucleus with intersecting orbital paths.
**Symbolism**: Nuclear energy, fusion/fission, high-energy potential.
**SVG Path**:
```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
  <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)" />
  <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)" />
</svg>
```

## 6. Exotics (✧ Star)
**Represents**: Antimatter, Crystalline Matrices.
**Design**: A four-pointed star (sparkle) with sharp vertices.
**Symbolism**: High-energy events, black hole artifacts, rare discovery.
**SVG Path**:
```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" />
  <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
</svg>
```
