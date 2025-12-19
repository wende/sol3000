import { mergeProps } from 'solid-js';

/**
 * @typedef {'stargate' | 'dockingHub' | 'logisticsCenter' | 'unknown'} BuildingType
 */

/**
 * @typedef {Object} BuildingIconProps
 * @property {BuildingType} type - The type of building to display
 * @property {number} [size] - Size in pixels (default: 24)
 * @property {string} [class] - Additional CSS classes
 */

/**
 * Stylistically coherent SVG icons for Sol3000 buildings.
 * Follows the same design principles as ResourceIcon (Geometric, 2px stroke).
 *
 * @param {BuildingIconProps} props
 */
export const BuildingIcon = (props) => {
  const merged = mergeProps({ size: 24, class: '' }, props);

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
    // 1. Star Gate (Gate)
    // Symbolizes: Connection, travel, gateway.
    stargate: () => (
      <svg {...svgAttrs()}>
        {/* Outer / inner rings */}
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="7.2" />

        {/* Event horizon */}
        <circle cx="12" cy="12" r="5.4" fill="currentColor" stroke="none" opacity="0.15" />

        {/* Chevrons */}
        <path d="M10.8 4.6L12 3.2l1.2 1.4" />
        <path d="M10.8 19.4L12 20.8l1.2-1.4" />
        <path d="M4.6 10.8L3.2 12l1.4 1.2" />
        <path d="M19.4 10.8L20.8 12l-1.4 1.2" />
        <path d="M6.2 5.6L5 5l.6 1.8" />
        <path d="M17.8 5.6L19 5l-.6 1.8" />
        <path d="M6.2 18.4L5 19l.6-1.8" />
        <path d="M17.8 18.4L19 19l-.6-1.8" />
      </svg>
    ),

    // 2. Docking Hub (✣ Nexus)
    // Symbolizes: Convergence, fleet capacity, parking.
    dockingHub: () => (
      <svg {...svgAttrs()}>
        {/* Central hub */}
        <circle cx="12" cy="12" r="4.25" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />

        {/* Docking arms */}
        <path d="M12 7.75V6" />
        <path d="M12 18v-1.75" />
        <path d="M7.75 12H6" />
        <path d="M18 12h-1.75" />

        {/* Docking ports */}
        <rect x="10.5" y="2.5" width="3" height="3" rx="0.75" />
        <rect x="10.5" y="18.5" width="3" height="3" rx="0.75" />
        <rect x="2.5" y="10.5" width="3" height="3" rx="0.75" />
        <rect x="18.5" y="10.5" width="3" height="3" rx="0.75" />

        {/* Approach beacons */}
        <path d="M9 9l-1-1" opacity="0.6" />
        <path d="M15 9l1-1" opacity="0.6" />
        <path d="M9 15l-1 1" opacity="0.6" />
        <path d="M15 15l1 1" opacity="0.6" />
      </svg>
    ),

    // 3. Logistics Center (☍ Network)
    // Symbolizes: Supply chain, distribution, storage.
    logisticsCenter: () => (
      <svg {...svgAttrs()}>
        {/* Connected nodes / routing (angular) */}
        <path d="M12 12L6.5 6.5" />
        <path d="M12 12L17.5 6.5" />
        <path d="M12 12L6.5 17.5" />
        <path d="M12 12L17.5 17.5" />

        <rect x="5" y="5" width="3" height="3" rx="0" />
        <rect x="16" y="5" width="3" height="3" rx="0" />
        <rect x="5" y="16" width="3" height="3" rx="0" />
        <rect x="16" y="16" width="3" height="3" rx="0" />

        <rect x="11" y="11" width="2" height="2" fill="currentColor" stroke="none" />
      </svg>
    ),

    // Fallback
    unknown: () => (
      <svg {...svgAttrs()}>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 4" />
        <path d="M9 9l6 6m0-6l-6 6" stroke-opacity="0.5" />
      </svg>
    )
  };

  return icons[merged.type] ? icons[merged.type]() : icons.unknown();
};
