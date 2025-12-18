# Galaxy Map 4X Mini-Game - Documentation

A minimalist, browser-based 4X strategy game featuring a clean black-and-white aesthetic with glassmorphism UI and smooth D3.js-powered galaxy visualization.

## Documentation Structure

### Core Documentation
- [Style Guide](./style-guide.md) - Design system, colors, typography, and visual specifications
- [Game Concept](./game-concept.md) - Core gameplay mechanics and 4X elements
- [Technical Stack](./technical-stack.md) - Frameworks, libraries, and technical decisions

### Component Documentation
- [App Component](./components/app.md) - Root application component
- [RothkoFrame Component](./components/rothko-frame.md) - Nested glassmorphism frame layers
- [GalaxyMap Component](./components/galaxy-map.md) - D3.js visualization container
- [SystemPanel Component](./components/system-panel.md) - Left-side system information panel
- [StatsPanel Component](./components/stats-panel.md) - Right-side game statistics panel
- [CommandBar Component](./components/command-bar.md) - Bottom action bar
- [Game State Store](./components/game-state.md) - Solid.js reactive state management

## Quick Start

The game combines:
- **SolidJS** for reactive UI components
- **D3.js** for galaxy map visualization
- **Pure CSS** for animations (no CSS-in-JS)
- **Glassmorphism** design aesthetic

## Visual Preview

```
┌─────────────────────────────────────────┐
│ Grid Background (40px × 40px)           │
│                                         │
│    ┌─────────────────────────┐        │
│    │   Rothko Frame Layers    │        │
│    │   (4 nested glass boxes) │        │
│    │                          │        │
│    │  ┌──────────────────┐   │        │
│    │  │  Galaxy Map SVG  │   │        │
│    │  │  • • • ─ • • •   │   │        │
│    │  │  • ─ • • ─ • •   │   │        │
│    │  └──────────────────┘   │        │
│    └─────────────────────────┘        │
│                                         │
│  [System Panel]              [Stats]   │
│  [──────── Command Bar ────────────]   │
└─────────────────────────────────────────┘
```

## Key Features

- **Pan & Zoom** - Smooth d3.zoom() navigation
- **Star Systems** - 25 procedurally generated systems
- **FTL Routes** - Animated connection lines between systems
- **Glassmorphism UI** - Modern frosted glass panels
- **Keyboard Shortcuts** - Space for next turn, ESC to deselect
- **CSS Animations** - Pulsing stars, flowing routes, ripple effects

## Implementation Priority

1. Base layout (grid + Rothko frames)
2. Galaxy generation (systems + routes data)
3. D3 rendering (stars + FTL lines)
4. Pan & zoom (d3.zoom setup)
5. Selection interaction (click handler + ripple)
6. System panel (glassmorphism overlay)
7. Animations (pulse, flow, transitions)
8. Stats panel + Command bar
9. Keyboard shortcuts
10. Polish (hover states, tooltips)

## Design Philosophy

- **Minimalism** - Black and white only, no colors
- **Clarity** - Every element serves a purpose
- **Elegance** - Smooth animations, soft shadows
- **Performance** - CSS over JS for animations
- **Accessibility** - Keyboard navigation, WCAG AAA contrast
