# Building Icon Design Specifications

This document outlines the visual design for new building structures in Sol3000, maintaining stylistic consistency with the Resource Icon System.

## Design Philosophy
- **Style**: Geometric, minimalist, 2px stroke weight.
- **Color**: Monochrome (`currentColor`) for UI adaptability.
- **Grid**: 24x24 pixel viewbox.

---

## 1. Star Gate (◎ Portal)
**Function**: Instant travel between distant systems.
**Design**: A dominant outer ring representing the frame, with an inner event horizon and distinct "chevrons" or nodes.
**Symbolism**: Connection, artificial wormhole, gateway.
**SVG Structure**:
- Outer Ring: `circle` (r=10)
- Chevrons: 3 triangular or rectangular notches on the rim (Top, Bottom-Left, Bottom-Right).
- Horizon: A subtle inner circle or vortex line.

```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- Main Ring -->
  <circle cx="12" cy="12" r="9" />
  <!-- Nodes/Chevrons -->
  <path d="M12 2v3" />
  <path d="M12 22v-3" />
  <path d="M22 12h-3" />
  <path d="M2 12h3" />
  <!-- Event Horizon (Inner) -->
  <circle cx="12" cy="12" r="3" opacity="0.5" />
</svg>
```

## 2. Docking Hub (✣ Nexus)
**Function**: Ship repair, trade capacity, fleet cap.
**Design**: A central hub with multiple extending arms ending in docking cradles.
**Symbolism**: Convergence, anchor point, parking.
**SVG Structure**:
- Core: Small central square or circle.
- Arms: 4 lines extending diagonally (X-shape) or cardinally (+ shape).
- Cradles: U-shapes at the end of arms facing inward.

```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- Central Hub -->
  <rect x="10" y="10" width="4" height="4" rx="1" />
  <!-- Top Dock -->
  <path d="M12 10V4" />
  <path d="M9 4h6" stroke-linecap="round" />
  <!-- Bottom Dock -->
  <path d="M12 14v6" />
  <path d="M9 20h6" stroke-linecap="round" />
  <!-- Left Dock -->
  <path d="M10 12H4" />
  <path d="M4 9v6" stroke-linecap="round" />
  <!-- Right Dock -->
  <path d="M14 12h6" />
  <path d="M20 9v6" stroke-linecap="round" />
</svg>
```

## 3. Logistics Center (☍ Network)
**Function**: Resource distribution, trade route efficiency, storage.
**Design**: Nodes connected by circuit-like paths, implying flow and organization.
**Symbolism**: Supply chain, connection, sorting.
**SVG Structure**:
- Nodes: 3 small squares arranged in a triangle.
- Links: Lines connecting them, perhaps with directional arrows or simple traces.

```xml
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- Top Node -->
  <rect x="10" y="3" width="4" height="4" rx="1" />
  <!-- Bottom Left Node -->
  <rect x="4" y="15" width="4" height="4" rx="1" />
  <!-- Bottom Right Node -->
  <rect x="16" y="15" width="4" height="4" rx="1" />
  <!-- Connections (Y-shape split) -->
  <path d="M12 7v5" />
  <path d="M12 12l-4 3" />
  <path d="M12 12l4 3" />
  <!-- Activity dots -->
  <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
</svg>
```
