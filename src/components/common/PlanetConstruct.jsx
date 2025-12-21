import { splitProps, For } from "solid-js";

/**
 * Planet type identifiers for the 5x5 grid construct icons
 * @typedef {'terrestrial' | 'gas-giant' | 'ice' | 'volcanic' | 'desert' | 'ocean' | 'barren' | 'toxic'} PlanetConstructType
 */

/**
 * @typedef {Object} PlanetConstructProps
 * @property {PlanetConstructType} type - The planet type to render
 * @property {number} [size=48] - Size in pixels (width and height)
 * @property {string} [class] - Additional CSS classes
 * @property {boolean} [isHomePlanet=false] - Whether this is the home planet
 * @property {boolean} [interactive=true] - Whether to show hover effects
 */

/**
 * Planet block definitions - maps planet types to their grid layouts
 * Using Void Construct design system: monochrome, grid-based, luminescent
 */
const PLANET_DEFINITIONS = {
  // TERRESTRIAL - Classic spherical world with surface features
  terrestrial: {
    label: "TERRESTRIAL",
    blocks: [
      { type: "depth", style: { "grid-area": "1 / 1 / 6 / 6", "border-radius": "50%", opacity: 0.5 } },
      { type: "structure", style: { "grid-area": "2 / 2 / 5 / 5", "border-radius": "50%" } },
      { type: "accent", style: { "grid-area": "2 / 2 / 4 / 4", "border-radius": "50% 0 0 0", opacity: 0.4 } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4", "border-radius": "50%", width: "60%", height: "60%", "justify-self": "center", "align-self": "center" } },
    ],
  },

  // GAS GIANT - Banded layers suggesting atmospheric zones
  "gas-giant": {
    label: "GAS_GIANT",
    blocks: [
      { type: "depth", style: { "grid-area": "1 / 1 / 6 / 6", "border-radius": "50%" } },
      { type: "structure", style: { "grid-area": "2 / 1 / 3 / 6", "border-radius": "20px 20px 0 0" } },
      { type: "accent", style: { "grid-area": "3 / 1 / 4 / 6" } },
      { type: "structure", style: { "grid-area": "4 / 1 / 5 / 6", "border-radius": "0 0 20px 20px" } },
      { type: "core", style: { "grid-area": "3 / 2 / 4 / 3", "border-radius": "50%", width: "70%", height: "50%", "justify-self": "center", "align-self": "center" } },
    ],
  },

  // ICE - Crystalline structure with sharp edges
  ice: {
    label: "ICE_WORLD",
    blocks: [
      { type: "depth", style: { "grid-area": "1 / 1 / 6 / 6", "border-radius": "50%", opacity: 0.3 } },
      { type: "structure", style: { "grid-area": "2 / 2 / 5 / 5", transform: "rotate(45deg)", "border-radius": "4px" } },
      { type: "accent", style: { "grid-area": "1 / 3 / 3 / 4", "border-radius": "2px" } },
      { type: "accent", style: { "grid-area": "4 / 3 / 6 / 4", "border-radius": "2px" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4", "border-radius": "2px", transform: "rotate(45deg)" } },
    ],
  },

  // VOLCANIC - Active core with emanating energy
  volcanic: {
    label: "VOLCANIC",
    blocks: [
      { type: "depth", style: { "grid-area": "1 / 1 / 6 / 6", "border-radius": "50%" } },
      { type: "structure", style: { "grid-area": "2 / 2 / 5 / 5", "border-radius": "50%" } },
      { type: "accent", style: { "grid-area": "1 / 3 / 3 / 4", width: "2px", "justify-self": "center", opacity: 0.6 } },
      { type: "accent", style: { "grid-area": "2 / 1 / 4 / 3", width: "2px", transform: "rotate(-30deg)", "justify-self": "end", opacity: 0.5 } },
      { type: "accent", style: { "grid-area": "2 / 4 / 4 / 6", width: "2px", transform: "rotate(30deg)", "justify-self": "start", opacity: 0.5 } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4", "border-radius": "50%" } },
    ],
  },

  // DESERT - Minimal features, stark and barren
  desert: {
    label: "DESERT",
    blocks: [
      { type: "depth", style: { "grid-area": "1 / 1 / 6 / 6", "border-radius": "50%", opacity: 0.4 } },
      { type: "structure", style: { "grid-area": "2 / 2 / 5 / 5", "border-radius": "50%", opacity: 0.7 } },
      { type: "accent", style: { "grid-area": "3 / 2 / 4 / 5", height: "1px", "align-self": "center", opacity: 0.4 } },
      { type: "core", style: { "grid-area": "3 / 4 / 4 / 5", "border-radius": "50%", width: "40%", height: "40%", "justify-self": "center", "align-self": "center", opacity: 0.8 } },
    ],
  },

  // OCEAN - Fluid, with wave-like structures
  ocean: {
    label: "OCEAN",
    blocks: [
      { type: "depth", style: { "grid-area": "1 / 1 / 6 / 6", "border-radius": "50%" } },
      { type: "structure", style: { "grid-area": "2 / 2 / 5 / 5", "border-radius": "50%" } },
      { type: "accent", style: { "grid-area": "2 / 2 / 3 / 5", "border-radius": "20px 20px 0 0", opacity: 0.5 } },
      { type: "accent", style: { "grid-area": "4 / 2 / 5 / 5", "border-radius": "0 0 20px 20px", opacity: 0.3 } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4", "border-radius": "50%", width: "50%", height: "50%", "justify-self": "center", "align-self": "center" } },
    ],
  },

  // BARREN - Dead world, minimal structure
  barren: {
    label: "BARREN",
    blocks: [
      { type: "depth", style: { "grid-area": "1 / 1 / 6 / 6", "border-radius": "50%", opacity: 0.3 } },
      { type: "structure", style: { "grid-area": "2 / 2 / 5 / 5", "border-radius": "50%", opacity: 0.5 } },
      { type: "depth", style: { "grid-area": "3 / 2 / 4 / 3", "border-radius": "50%", opacity: 0.4 } },
      { type: "depth", style: { "grid-area": "2 / 4 / 3 / 5", "border-radius": "50%", opacity: 0.3 } },
    ],
  },

  // TOXIC - Hazardous atmosphere with warning indicators
  toxic: {
    label: "TOXIC",
    blocks: [
      { type: "depth", style: { "grid-area": "1 / 1 / 6 / 6", "border-radius": "50%", border: "1px dashed rgba(255,255,255,0.2)" } },
      { type: "structure", style: { "grid-area": "2 / 2 / 5 / 5", "border-radius": "50%" } },
      { type: "accent", style: { "grid-area": "1 / 2 / 2 / 3", "border-radius": "50%", width: "4px", height: "4px", "justify-self": "center", "align-self": "center" } },
      { type: "accent", style: { "grid-area": "1 / 4 / 2 / 5", "border-radius": "50%", width: "4px", height: "4px", "justify-self": "center", "align-self": "center" } },
      { type: "accent", style: { "grid-area": "5 / 3 / 6 / 4", "border-radius": "50%", width: "4px", height: "4px", "justify-self": "center", "align-self": "center" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4", "border-radius": "50%", opacity: 0.9 } },
    ],
  },
};

/** All available planet construct types */
export const PLANET_CONSTRUCT_TYPES = /** @type {PlanetConstructType[]} */ (Object.keys(PLANET_DEFINITIONS));

// Base block styles (high visibility version for planets)
const BLOCK_STYLES = {
  base: {
    "background-color": "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    transition: "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
    "pointer-events": "none",
    "z-index": 1,
  },
  structure: {
    "background-color": "rgba(255, 255, 255, 0.35)",
    "border-color": "rgba(255, 255, 255, 0.5)",
    "z-index": 5,
  },
  depth: {
    "background-color": "rgba(255, 255, 255, 0.20)",
    border: "1px solid rgba(255, 255, 255, 0.35)",
    "z-index": 2,
  },
  core: {
    "background-color": "#ffffff",
    "box-shadow": "0 0 25px rgba(255, 255, 255, 0.9)",
    border: "2px solid #fff",
    "z-index": 10,
  },
  accent: {
    "background-color": "rgba(255, 255, 255, 0.40)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    "z-index": 6,
  },
};

/**
 * Merges base block style with type-specific style and custom overrides
 */
const getBlockStyle = (blockType, customStyle) => {
  const baseStyle = { ...BLOCK_STYLES.base };
  const typeStyle = BLOCK_STYLES[blockType] || {};
  return { ...baseStyle, ...typeStyle, ...customStyle };
};

/**
 * Map planet type strings to construct types
 */
export const mapPlanetTypeToConstruct = (planetType) => {
  const typeMap = {
    terrestrial: "terrestrial",
    "gas giant": "gas-giant",
    "gas-giant": "gas-giant",
    ice: "ice",
    volcanic: "volcanic",
    desert: "desert",
    ocean: "ocean",
    barren: "barren",
    toxic: "toxic",
    rocky: "barren",
    molten: "volcanic",
    frozen: "ice",
    aquatic: "ocean",
  };
  return typeMap[planetType?.toLowerCase()] || "terrestrial";
};

/**
 * A planet construct component that renders various planet types
 * using a 5x5 CSS grid with layered blocks following the Void Construct design system.
 *
 * @param {PlanetConstructProps} props
 */
export const PlanetConstruct = (props) => {
  const [local, others] = splitProps(props, ["type", "size", "class", "isHomePlanet", "interactive"]);

  const size = () => local.size || 48;
  const interactive = () => local.interactive !== false;
  const definition = () => PLANET_DEFINITIONS[local.type] || PLANET_DEFINITIONS.terrestrial;

  return (
    <div
      class={`planet-construct ${interactive() ? "planet-construct--interactive" : ""} ${local.isHomePlanet ? "planet-construct--home" : ""} ${local.class || ""}`}
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
      }}
      {...others}
    >
      <div
        class="planet-construct__grid"
        style={{
          display: "grid",
          "grid-template-columns": "repeat(5, 1fr)",
          "grid-template-rows": "repeat(5, 1fr)",
          width: `${size()}px`,
          height: `${size()}px`,
          gap: 0,
          position: "relative",
        }}
      >
        <For each={definition()?.blocks}>
          {(block) => (
            <div
              class={`planet-construct__block planet-construct__block--${block.type}`}
              style={getBlockStyle(block.type, block.style)}
            />
          )}
        </For>
      </div>

      <style>{`
        .planet-construct--interactive:hover .planet-construct__block {
          border-color: rgba(255, 255, 255, 0.6) !important;
        }

        .planet-construct--interactive:hover .planet-construct__block--structure {
          background-color: rgba(255, 255, 255, 0.5) !important;
          transform: scale(1.02) !important;
        }

        .planet-construct--interactive:hover .planet-construct__block--core {
          box-shadow: 0 0 35px rgba(255, 255, 255, 1) !important;
          transform: scale(1.15) !important;
        }

        .planet-construct--interactive:hover .planet-construct__block--depth {
          background-color: rgba(255, 255, 255, 0.35) !important;
        }

        .planet-construct--interactive:hover .planet-construct__block--accent {
          background-color: rgba(255, 255, 255, 0.55) !important;
          border-color: rgba(255, 255, 255, 0.7) !important;
        }

        .planet-construct--home .planet-construct__grid {
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.4);
        }

        .planet-construct--home .planet-construct__block--core {
          box-shadow: 0 0 30px rgba(255, 255, 255, 1) !important;
        }
      `}</style>
    </div>
  );
};

/**
 * SVG version of planet construct for use within SVG elements
 * Uses foreignObject to embed the HTML-based grid
 */
export const PlanetConstructSVG = (props) => {
  const size = () => props.size || 48;
  const type = () => props.type || "terrestrial";
  const isHomePlanet = () => props.isHomePlanet || false;

  return (
    <foreignObject
      x={-size() / 2}
      y={-size() / 2}
      width={size()}
      height={size()}
      style={{ overflow: "visible" }}
    >
      <div xmlns="http://www.w3.org/1999/xhtml">
        <PlanetConstruct
          type={type()}
          size={size()}
          isHomePlanet={isHomePlanet()}
          interactive={props.interactive !== false}
        />
      </div>
    </foreignObject>
  );
};

export default PlanetConstruct;
