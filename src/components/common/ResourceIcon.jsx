import { mergeProps } from 'solid-js';

/**
 * @typedef {'metals' | 'volatiles' | 'nobleGases' | 'rareEarths' | 'isotopes' | 'exotics' | 'ore' | 'credits'} ResourceType
 */

/**
 * @typedef {Object} ResourceIconProps
 * @property {ResourceType} type - The type of resource to display
 * @property {number} [size] - Size in pixels (default: 24)
 * @property {string} [class] - Additional CSS classes
 */

/**
 * Stylistically coherent SVG icons for Sol3000 resources.
 * Designed to be geometric, minimal, and read well at small sizes.
 *
 * @param {ResourceIconProps} props
 */
export const ResourceIcon = (props) => {
  const merged = mergeProps({ size: 24, class: '' }, props);

  // Common SVG attributes for consistent style
  // Using fill="none" and stroke="currentColor" allows styling via text color classes
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

  const icons = {
    // 1. Metals: ⬡ Hexagon
    // Represents: Fe, Ni, Al, Ti, W. Foundation of industry.
    metals: () => (
      <svg {...svgAttrs()}>
        <path d="M12 2l9 5.2v10.4l-9 5.2l-9-5.2V7.2L12 2z" />
        <path d="M12 22V12" stroke-width="1.5" stroke-opacity="0.5" />
        <path d="M12 12L3 7.2" stroke-width="1.5" stroke-opacity="0.5" />
        <path d="M12 12l9-4.8" stroke-width="1.5" stroke-opacity="0.5" />
      </svg>
    ),
    
    // Mapping 'ore' to 'metals' as it's the base resource currently used
    ore: () => (
      <svg {...svgAttrs()}>
         <path d="M12 2l9 5.2v10.4l-9 5.2l-9-5.2V7.2L12 2z" />
         <circle cx="12" cy="12" r="3" />
      </svg>
    ),

    // 2. Volatiles: ☍ Molecular Structure
    // Represents: Water, Ammonia, Methane (Chemical Compounds).
    volatiles: () => (
      <svg {...svgAttrs()}>
        <path d="M12 12l0-8M12 12l-7 8M12 12l7 8" stroke-opacity="0.7" />
        <rect x="11" y="11" width="2" height="2" fill="currentColor" stroke="none" />
        <path d="M10 2h4v3h-4zM3 18h4v3H3zM17 18h4v3h-4z" fill="currentColor" stroke="none" />
      </svg>
    ),

    // 3. Noble Gases: ◉ Rings
    // Represents: Xenon, Argon. Propulsion.
    nobleGases: () => (
      <svg {...svgAttrs()}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),

    // 4. Rare Earths: ✦ Crystal
    // Represents: Neodymium, Yttrium. Electronics & Adv. Tech.
    rareEarths: () => (
      <svg {...svgAttrs()}>
        <path d="M12 2L4.5 12 12 22l7.5-10L12 2z" />
        <path d="M12 2v20" stroke-opacity="0.5" />
        <path d="M4.5 12h15" stroke-opacity="0.5" />
      </svg>
    ),

    // 5. Isotopes: ☢ Modern Atom
    // Represents: He-3, Uranium. Energy.
    isotopes: () => (
      <svg {...svgAttrs()}>
        <rect x="11" y="11" width="2" height="2" transform="rotate(45 12 12)" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="10" stroke-opacity="0.5" stroke-dasharray="2 4" />
        <path d="M12 2l7 10-7 10-7-10z" />
        <path d="M2 12l10-7 10 7-10 7z" />
      </svg>
    ),

    // 6. Exotics: ✧ Faceted Star
    // Represents: Antimatter, Artifacts. Wonders.
    exotics: () => (
      <svg {...svgAttrs()}>
        <path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8z" />
        <path d="M9 9l6 6M15 9l-6 6" stroke-width="1" stroke-opacity="0.5" />
        <rect x="11" y="11" width="2" height="2" transform="rotate(45 12 12)" fill="currentColor" stroke="none" />
      </svg>
    ),

    // Credits: ⬢ Data Chip
    // Represents: Digital Currency, Trade Units.
    credits: () => (
      <svg {...svgAttrs()}>
        <path d="M2 9l5-5h10l5 5v6l-5 5H7l-5-5V9z" />
        <path d="M12 7v10" stroke-width="1.5" stroke-opacity="0.3" />
        <path d="M8 12h8" stroke-width="1.5" stroke-opacity="0.3" />
        <rect x="10" y="10" width="4" height="4" fill="currentColor" stroke="none" />
      </svg>
    )
  };

  return icons[merged.type] ? icons[merged.type]() : null;
};
