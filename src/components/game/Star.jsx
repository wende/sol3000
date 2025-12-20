import { SPECTRAL_CLASSES } from '../../utils/galaxy';

/**
 * Spectral class visual configuration.
 * HSL ranges for star colors based on stellar physics.
 * @type {Record<string, {hue: [number, number], saturation: [number, number], lightness: [number, number]}>}
 */
const SPECTRAL_VISUALS = {
  O: { hue: [220, 240], saturation: [28, 45], lightness: [85, 95] },
  B: { hue: [200, 225], saturation: [26, 40], lightness: [88, 96] },
  A: { hue: [190, 210], saturation: [18, 30], lightness: [90, 97] },
  F: { hue: [45, 60], saturation: [22, 36], lightness: [88, 95] },
  G: { hue: [38, 52], saturation: [28, 45], lightness: [85, 93] },
  K: { hue: [22, 38], saturation: [30, 48], lightness: [82, 92] },
  M: { hue: [0, 22], saturation: [35, 52], lightness: [78, 90] }
};

/**
 * Simple deterministic hash for a number.
 * Returns a value between 0 and 1.
 * @param {number} n - Input number
 * @param {number} seed - Additional seed value
 * @returns {number} Pseudo-random value 0-1
 */
function hash(n, seed = 0) {
  const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Generates a star color deterministically based on spectral class and system ID.
 * Uses HSL with faint saturation to maintain the black-and-white aesthetic.
 * @param {string} spectralClass - The star's spectral classification
 * @param {number} systemId - System ID for deterministic randomness
 * @param {number} [size] - Optional star size for brightness calculation
 * @returns {string} HSL color string
 */
export function getStarColor(spectralClass, systemId, size) {
  const visuals = SPECTRAL_VISUALS[spectralClass] || SPECTRAL_VISUALS.G;
  const cls = SPECTRAL_CLASSES[spectralClass];

  // Deterministic "random" values based on system ID
  const hueRand = hash(systemId, 1);
  const satRand = hash(systemId, 2);
  const litRand = hash(systemId, 3);

  const hue = visuals.hue[0] + hueRand * (visuals.hue[1] - visuals.hue[0]);
  const saturation = visuals.saturation[0] + satRand * (visuals.saturation[1] - visuals.saturation[0]);

  // Calculate brightness based on size if provided
  let lightness;
  if (size !== undefined && cls) {
    const sizeRange = cls.size;
    const brightness = 0.6 + ((size - sizeRange[0]) / (sizeRange[1] - sizeRange[0])) * 0.4;
    lightness = visuals.lightness[0] + (brightness - 0.6) * (visuals.lightness[1] - visuals.lightness[0]) / 0.4;
  } else {
    lightness = visuals.lightness[0] + litRand * (visuals.lightness[1] - visuals.lightness[0]);
  }

  return `hsl(${Math.floor(hue)}, ${Math.floor(saturation)}%, ${Math.floor(lightness)}%)`;
}

/**
 * @typedef {Object} StarProps
 * @property {number} size - Star radius in pixels
 * @property {string} spectralClass - Spectral class (O, B, A, F, G, K, M)
 * @property {number} id - Star ID for unique animation offset and color derivation
 * @property {boolean} isSelected - Whether the star is selected (adds glow)
 * @property {string} lodClass - Level of detail class for performance
 * @property {boolean} isTransitioning - Whether the system is mid zoom animation
 */

/**
 * Renders a star with appropriate visual styling based on spectral class.
 * This is a pure visual component - no interaction handling.
 * Color is derived deterministically from spectralClass and system ID.
 *
 * Star colors follow real stellar physics:
 * - O-type: Deep blue (hottest, largest, rarest)
 * - B-type: Blue-white
 * - A-type: White with blue tint
 * - F-type: Yellow-white
 * - G-type: Yellow (Sol-like)
 * - K-type: Orange
 * - M-type: Red-orange (coolest, smallest, most common)
 *
 * @param {StarProps} props
 */
const SYSTEM_VIEW_STAR_SCALE = 10; // SystemView star radius multiplier
const SYSTEM_VIEW_OUTER_SHADOW = 60;
const SYSTEM_VIEW_INNER_SHADOW = 15;
const MAP_GLOW_OUTER_SHADOW = SYSTEM_VIEW_OUTER_SHADOW / SYSTEM_VIEW_STAR_SCALE; // 6px relative
const MAP_GLOW_INNER_SHADOW = SYSTEM_VIEW_INNER_SHADOW / SYSTEM_VIEW_STAR_SCALE; // 1.5px relative

export const Star = (props) => {
  const color = () => getStarColor(props.spectralClass, props.id, props.size);
  const starStyle = () => ({
    '--star-color': color(),
    ...(props.isTransitioning ? {
      '--transition-glow-outer': `${MAP_GLOW_OUTER_SHADOW}px`,
      '--transition-glow-inner': `${MAP_GLOW_INNER_SHADOW}px`
    } : {})
  });

  const baseRadius = props.size;
  const glowRadii = {
    outer: baseRadius * 1.4, // matches 14/10 ratio from SystemView
    middle: baseRadius,      // aligns with main star body
    inner: baseRadius * 0.8  // inner highlight ratio 8/10
  };

  return (
    <g style={starStyle()}>
      {/* Cinematic glow stack for system transitions */}
      {props.isTransitioning && (
        <g class="transition-glow" style="pointer-events: none;">
          <circle
            r={glowRadii.outer}
            fill={color()}
            opacity="0.1"
            filter="url(#star-glow-map)"
          />
          <circle
            r={glowRadii.middle}
            fill={color()}
            filter="url(#star-glow-map)"
          />
          <circle
            r={glowRadii.inner}
            fill="white"
            opacity="0.2"
          />
        </g>
      )}
      <circle
        id={`star-${props.id}`}
        r={props.size}
        fill={color()}
        class={`star ${props.isTransitioning ? '' : (props.lodClass || '')} ${props.isSelected ? 'selected-glow' : ''} ${props.isTransitioning ? 'transition-glow' : ''}`}
        style={`animation-delay: -${(props.id * 0.3) % 4}s;`}
      />
    </g>
  );
};
