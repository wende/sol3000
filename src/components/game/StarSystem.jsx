import { Show } from 'solid-js';
import { Star } from './Star';

/**
 * @typedef {Object} StarSystemProps
 * @property {Object} system - The star system data
 * @property {number} system.id - System ID
 * @property {string} system.name - System name
 * @property {number} system.x - X position
 * @property {number} system.y - Y position
 * @property {number} system.size - Star radius
 * @property {string} system.color - Star color (HSL with faint hue)
 * @property {string} system.spectralClass - Spectral class (O, B, A, F, G, K, M)
 * @property {string} system.owner - System owner
 * @property {boolean} isSelected - Whether this system is selected
 * @property {boolean} isHome - Whether this is the home system
 * @property {boolean} shouldFade - Whether the system should fade out (fog of war transition)
 * @property {boolean} shouldFadeIn - Whether the system should fade in (newly revealed)
 * @property {number} zoomLevel - Current zoom level for LOD
 * @property {Function} onClick - Click handler
 */

/**
 * Renders a single star system with interaction elements and the Star visual.
 * Handles hit areas, selection rings, ownership indicators, and labels.
 *
 * @param {StarSystemProps} props
 */
export const StarSystem = (props) => {
  const isOwned = () => props.system.owner === 'Player';
  const metals = () => props.system.market?.metals;
  const hasMetalsSupply = () => (metals()?.supply || 0) > 0;
  const hasMetalsDemand = () => (metals()?.demand || 0) > 0;

  const lodClass = () => {
    if (props.zoomLevel < 0.2) return 'lod-ultra-low';
    if (props.zoomLevel < 0.4) return 'lod-low';
    return '';
  };

  // Determine opacity: fade-in animation handles its own opacity
  const getOpacityStyle = () => {
    if (props.shouldFadeIn) return {}; // Let CSS animation control opacity
    return {
      opacity: props.shouldFade ? 0 : 1,
      transition: 'opacity 700ms ease-out'
    };
  };

  return (
    <g
      id={`system-${props.system.id}`}
      transform={`translate(${props.system.x}, ${props.system.y})`}
      onClick={props.onClick}
      class={`group cursor-pointer ${props.shouldFadeIn ? 'fog-fade-in' : ''}`}
      style={getOpacityStyle()}
    >
      <title>
        {props.system.name}
        {hasMetalsSupply() ? `\nMetals Supply: ${metals().supply}` : ''}
        {hasMetalsDemand() ? `\nMetals Demand: ${metals().demand}` : ''}
      </title>

      {/* Invisible larger hit area for easier clicking */}
      <circle
        r={props.system.size + 20}
        fill="transparent"
        class="pointer-events-auto"
      />

      {/* Ownership indicator ring */}
      <Show when={isOwned() && !props.isHome}>
        <circle
          r={props.system.size + 15}
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          stroke-width={1}
          class="opacity-50"
        />
      </Show>

      {/* Home System Ring - Dotted circle for home system */}
      <Show when={props.isHome}>
        <circle
          r={props.system.size + 20}
          fill="none"
          stroke="white"
          stroke-width={2}
          stroke-dasharray="8,4"
          class="opacity-70 home-ring"
        />
      </Show>

      {/* Selection Ring */}
      <circle
        r={props.system.size + 12}
        fill="none"
        stroke={props.isSelected ? 'white' : 'transparent'}
        stroke-width={1.5}
        class="opacity-60"
      />

      {/* The Star - visual component */}
      <Star
        id={props.system.id}
        size={props.system.size}
        color={props.system.color}
        spectralClass={props.system.spectralClass}
        isSelected={props.isSelected}
        lodClass={lodClass()}
      />

      {/* Hover Ring - shown on hover */}
      <circle
        r={props.system.size + 6}
        fill="none"
        stroke="white"
        stroke-width="1"
        class="opacity-0 group-hover:opacity-40 pointer-events-none"
      />

      {/* Hover Label - Only show when zoomed in */}
      <Show when={props.zoomLevel >= 0.4}>
        <text
          y={-props.system.size - 15}
          text-anchor="middle"
          fill="white"
          font-size="14"
          class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none tracking-widest font-mono font-bold drop-shadow-lg"
        >
          {props.system.name}
        </text>
      </Show>

      {/* Market Marker - Only show when zoomed in */}
      <Show when={props.zoomLevel >= 0.4 && (hasMetalsSupply() || hasMetalsDemand())}>
        <g class="opacity-70 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <rect
            x={-18}
            y={props.system.size + 10}
            width={36}
            height={16}
            rx={2}
            fill="rgba(255, 255, 255, 0.06)"
            stroke="rgba(255, 255, 255, 0.18)"
            stroke-width={1}
          />
          <text
            x={0}
            y={props.system.size + 22}
            text-anchor="middle"
            fill="white"
            font-size="10"
            class="tracking-widest font-mono"
          >
            {hasMetalsSupply() ? 'M+' : 'M-'}
          </text>
        </g>
      </Show>
    </g>
  );
};
