import { mergeProps } from 'solid-js';
import './ResourceIcon.css';

/**
 * @typedef {'metals' | 'volatiles' | 'nobleGases' | 'rareEarths' | 'isotopes' | 'exotics' | 'ore' | 'credits' | 'energy'} ResourceType
 */

/**
 * @typedef {Object} ResourceIconProps
 * @property {ResourceType} type - The type of resource to display
 * @property {number} [size] - Size in pixels (default: 24)
 * @property {string} [class] - Additional CSS classes
 */

/**
 * Stylistically coherent icons for Sol3000 resources.
 * Supports both the new CSS-grid based animated icons and legacy SVGs.
 *
 * @param {ResourceIconProps} props
 */
export const ResourceIcon = (props) => {
  const merged = mergeProps({ size: 24, class: '' }, props);

  // Configuration for CSS-based icons (from Architectural Compendium)
  // Base size for these icons is 180px, so we scale them down.
  const cssIcons = {
    // 1. Volatiles: Abstract Unstable Cluster
    volatiles: () => (
      <div class="construct-grid vol-new">
        <div class="block core v1"></div>
        <div class="block core v2"></div>
        <div class="block core v3"></div>
      </div>
    ),
    
    // 2. Metals: Single Ingot with Glow
    metals: () => (
      <div class="construct-grid met-new">
        <div class="ingot-wrapper">
          <div class="ingot-shape"></div>
        </div>
      </div>
    ),
    
    // Map 'ore' to the new metals icon
    ore: () => (
      <div class="construct-grid met-new">
        <div class="ingot-wrapper">
          <div class="ingot-shape"></div>
        </div>
      </div>
    ),

    // 3. Isotopes: Juggle Transition
    isotopes: () => (
      <div class="construct-grid iso-1">
        <div class="s1"></div>
        <div class="s2"></div>
        <div class="s3"></div>
      </div>
    ),

    // 4. Energy: Power Bar
    energy: () => (
      <div class="construct-grid nrg-1">
        <div class="res-shape shape"></div>
      </div>
    ),

    // 5. Credits: Diamond Coin
    credits: () => (
      <div class="construct-grid crd-2">
        <div class="res-shape shape"></div>
      </div>
    )
  };

  // Fallback SVG icons for types not yet converted to CSS grid
  const svgIcons = {
    // 3. Noble Gases: ◉ Rings
    nobleGases: () => (
      <svg {...svgAttrs()}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),

    // 4. Rare Earths: ✦ Crystal
    rareEarths: () => (
      <svg {...svgAttrs()}>
        <path d="M12 2L4.5 12 12 22l7.5-10L12 2z" />
        <path d="M12 2v20" stroke-opacity="0.5" />
        <path d="M4.5 12h15" stroke-opacity="0.5" />
      </svg>
    ),

    // 6. Exotics: ✧ Faceted Star
    exotics: () => (
      <svg {...svgAttrs()}>
        <path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8z" />
        <path d="M9 9l6 6M15 9l-6 6" stroke-width="1" stroke-opacity="0.5" />
        <rect x="11" y="11" width="2" height="2" transform="rotate(45 12 12)" fill="currentColor" stroke="none" />
      </svg>
    )
  };

  const svgAttrs = () => ({
    width: merged.size,
    height: merged.size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    class: merged.class,
    xmlns: "http://www.w3.org/2000/svg"
  });

  // Render Logic
  if (cssIcons[merged.type]) {
    // Scale 180px grid to requested size
    const scale = merged.size / 180;
    
    return (
      <div 
        class={`resource-icon-wrapper relative overflow-hidden ${merged.class}`}
        style={{ width: `${merged.size}px`, height: `${merged.size}px` }}
      >
        <div 
          style={{ 
            width: '180px', 
            height: '180px', 
            transform: `scale(${scale})`, 
            'transform-origin': 'top left',
            // Ensure pointer events pass through if needed, though 'block' has pointer-events: none
          }}
        >
          {cssIcons[merged.type]()}
        </div>
      </div>
    );
  } else if (svgIcons[merged.type]) {
    return svgIcons[merged.type]();
  } else {
    // Default fallback (unknown type)
    return null;
  }
};