/**
 * @typedef {Object} StarProps
 * @property {number} size - Star radius in pixels
 * @property {string} color - Star color (HSL string)
 * @property {string} spectralClass - Spectral class (O, B, A, F, G, K, M)
 * @property {number} id - Star ID for unique animation offset
 * @property {boolean} isSelected - Whether the star is selected (adds glow)
 * @property {string} lodClass - Level of detail class for performance
 */

/**
 * Renders a star with appropriate visual styling based on spectral class.
 * This is a pure visual component - no interaction handling.
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
export const Star = (props) => {
  return (
    <circle
      id={`star-${props.id}`}
      r={props.size}
      fill={props.color}
      class={`star ${props.lodClass || ''} ${props.isSelected ? 'selected-glow' : ''}`}
      style={`animation-delay: -${(props.id * 0.3) % 4}s;`}
    />
  );
};
