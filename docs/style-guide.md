# Style Guide

## Design Principles

The game follows a **Rothko-inspired minimalist aesthetic** with:
- Pure black and white color scheme
- Glassmorphism (frosted glass) UI elements
- Smooth, professional animations
- High contrast for accessibility
- Geometric, centered composition

## Color Palette

### Core Colors
```css
--bg-black: #000000;
--text-white: #ffffff;
--text-gray: #737373;
```

### Glass Layers (Opacity Variations)
```css
--glass-white-5: rgba(255, 255, 255, 0.05);
--glass-white-8: rgba(255, 255, 255, 0.08);
--glass-white-12: rgba(255, 255, 255, 0.12);
```

### Borders
```css
--border-white-10: rgba(255, 255, 255, 0.10);
--border-white-15: rgba(255, 255, 255, 0.15);
--border-white-20: rgba(255, 255, 255, 0.20);
--border-white-25: rgba(255, 255, 255, 0.25);
```

### Effects
```css
--grid-white: rgba(255, 255, 255, 0.03);
--glow-white: rgba(255, 255, 255, 0.4);
--ftl-line: rgba(255, 255, 255, 0.15);
```

### Star System Colors (White Spectrum)
```css
--star-primary: rgba(255, 255, 255, 1.0);    /* Brightest */
--star-secondary: rgba(255, 255, 255, 0.8);  /* Medium */
--star-tertiary: rgba(255, 255, 255, 0.6);   /* Dimmest */
```

## Typography

### Font Family
```css
font-family: 'JetBrains Mono', monospace;
```

Import via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
```

### Text Styles

**Heading (Main Title)**
```css
font-size: 2rem;           /* 32px */
font-weight: 300;          /* Light */
letter-spacing: 0.2em;     /* Very wide */
color: var(--text-white);
text-align: center;
text-transform: uppercase;
```

**Subtext**
```css
font-size: 0.75rem;        /* 12px */
font-weight: 300;          /* Light */
letter-spacing: 0.15em;    /* Wide */
color: var(--text-gray);
text-transform: uppercase;
```

**System Name**
```css
font-size: 0.875rem;       /* 14px */
font-weight: 400;          /* Regular */
letter-spacing: 0.1em;     /* Moderate */
color: var(--text-white);
text-transform: uppercase;
```

**Body Text**
```css
font-size: 0.6875rem;      /* 11px */
font-weight: 300;          /* Light */
letter-spacing: 0.05em;    /* Slight */
color: var(--text-gray);
```

**Stat Numbers (Large)**
```css
font-size: 2rem;           /* 32px */
font-weight: 500;          /* Medium */
letter-spacing: 0;
color: var(--text-white);
```

## Shadows & Effects

### Shadow Definitions
```css
--shadow-soft: 0 4px 30px rgba(0, 0, 0, 0.5);
--shadow-deep: 0 8px 40px rgba(0, 0, 0, 0.7);
--shadow-button: 0 2px 10px rgba(0, 0, 0, 0.3);
```

### Backdrop Blur (Glassmorphism)
```css
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px); /* Safari support */
```

### Glow Effects
```css
/* Star glow */
filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));

/* Intense glow (hover) */
filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.7));
```

### Inner Highlight (Subtle 3D effect)
```css
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
```

## Layout Specifications

### Grid Background
```css
.grid-background {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridFadeIn 1s ease-out forwards;
}
```

### Rothko Frame Layers (Centered, Nested)

**Layer 1 (Outermost)**
```css
width: 800px;
height: 600px;
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.10);
backdrop-filter: blur(10px);
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
```

**Layer 2**
```css
width: 700px;
height: 500px;
background: rgba(255, 255, 255, 0.08);
border: 1px solid rgba(255, 255, 255, 0.15);
```

**Layer 3**
```css
width: 600px;
height: 400px;
background: rgba(255, 255, 255, 0.12);
border: 1px solid rgba(255, 255, 255, 0.20);
```

**Layer 4 (Galaxy Map Container)**
```css
width: 560px;
height: 360px;
background: #000000;
border: 1px solid rgba(255, 255, 255, 0.25);
```

### Glass Panel Base Style
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 0; /* Sharp corners */
}

.glass-panel:hover {
  border-color: rgba(255, 255, 255, 0.20);
  transition: border-color 0.3s ease;
}
```

## Animation Specifications

### Timing Functions
```css
--ease-out-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out-smooth: cubic-bezier(0.42, 0, 0.58, 1);
```

### Duration Standards
- **Quick**: 200ms (hover, small transitions)
- **Standard**: 400ms (panel slides, fades)
- **Slow**: 1000ms (page load, major transitions)
- **Very Slow**: 2000ms (ambient animations, pulses)

### Core Animations

**Grid Fade In**
```css
@keyframes gridFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Usage: 1s ease-out */
```

**Scale In (Structure Appears)**
```css
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
/* Usage: 1s ease-out 0.5s both */
```

**Fade In Up**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Usage: 0.6s ease-out */
```

**Star Pulse**
```css
@keyframes starPulse {
  0%, 100% {
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
    opacity: 0.85;
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.7));
    opacity: 1;
  }
}
/* Usage: 2s ease-in-out infinite */
/* Randomize with: animation-delay: calc(-1 * var(--star-index) * 0.1s) */
```

**FTL Line Flow**
```css
@keyframes ftlFlow {
  to { stroke-dashoffset: -100; }
}
/* Usage: 20s linear infinite */
```

**Ripple Effect (Click Feedback)**
```css
@keyframes ripple {
  from {
    transform: scale(1);
    opacity: 0.8;
  }
  to {
    transform: scale(8);
    opacity: 0;
  }
}
/* Usage: 0.8s ease-out forwards */
```

**Slide In Left**
```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
/* Usage: 0.4s ease-out */
```

**Slide In Right**
```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
/* Usage: 0.4s ease-out */
```

## Interactive States

### Star System States

**Default**
```css
r: [size];
fill: var(--star-*);
stroke: none;
filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
animation: starPulse 2s ease-in-out infinite;
cursor: default;
```

**Hover**
```css
transform: scale(1.3);
filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.7));
transition: all 0.2s ease-out;
cursor: pointer;
```

**Selected**
```css
stroke: rgba(255, 255, 255, 0.8);
stroke-width: 2px;
filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.8));
```

### Button States

**Default**
```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.15);
color: var(--text-white);
padding: 10px 20px;
font-size: 0.75rem;
letter-spacing: 0.15em;
transition: all 0.2s ease;
cursor: pointer;
```

**Hover**
```css
background: rgba(255, 255, 255, 0.1);
border-color: rgba(255, 255, 255, 0.3);
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
```

**Active (Pressed)**
```css
background: rgba(255, 255, 255, 0.15);
transform: translateY(1px);
```

**Disabled**
```css
opacity: 0.3;
cursor: not-allowed;
pointer-events: none;
```

### Focus Indicators (Accessibility)
```css
:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}
```

## Spacing System

### Padding/Margin Scale
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

### Component Spacing

**Panel Padding**: 20px (var(--space-lg))
**Panel Gap**: 20px between panels
**Content Gap**: 12px between elements
**Button Gap**: 8px between buttons
**Section Gap**: 16px between sections

## Responsive Considerations

While the game targets 1920×1080, maintain proportions:

```css
@media (max-width: 1600px) {
  /* Scale Rothko frames by 0.9 */
  .rothko-layer-1 { width: 720px; height: 540px; }
}

@media (max-width: 1200px) {
  /* Stack panels vertically */
  .glass-panel { width: 100%; }
}
```

## Accessibility

### Contrast Ratios
- White on Black: 21:1 (WCAG AAA)
- Gray text on Black: Minimum 7:1 (WCAG AA)

### Focus States
All interactive elements must have visible focus indicators.

### Motion
Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Implementation Notes

- Use CSS custom properties for all colors/sizes
- Keep animations in separate `animations.css` file
- Use `transform` instead of `left/top` for performance
- Add `will-change: transform` to animated elements
- Avoid inline styles; prefer classes
- Use semantic HTML where possible
