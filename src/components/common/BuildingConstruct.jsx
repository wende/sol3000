import { splitProps, For } from "solid-js";

/**
 * Building type identifiers for the 5x5 grid construct icons
 * @typedef {'citadel' | 'overseer' | 'nexus' | 'zenith' | 'megablock' | 'needle' | 'archway' | 'module-x' | 'framework' | 'open-pit' | 'gantry' | 'borehole' | 'refinery' | 'solar-array' | 'monolith' | 'server-farm' | 'quantum-core' | 'tether' | 'orbital-anchor' | 'ground-station' | 'hangar' | 'stack-yard' | 'vault'} BuildingConstructType
 */

/**
 * @typedef {Object} BuildingConstructProps
 * @property {BuildingConstructType} type - The building type to render
 * @property {number} [size=180] - Size in pixels (width and height)
 * @property {string} [class] - Additional CSS classes
 * @property {boolean} [showLabel=false] - Whether to show the building label
 * @property {boolean} [interactive=true] - Whether to show hover effects
 */

/**
 * Building block definitions - maps building types to their grid layouts
 */
const BUILDING_DEFINITIONS = {
  // HEADQUARTERS
  citadel: {
    label: "CITADEL",
    category: "headquarters",
    blocks: [
      { type: "structure", style: { "grid-area": "1 / 1 / 6 / 6", border: "2px solid rgba(255,255,255,0.2)" } },
      { type: "depth", style: { "grid-area": "2 / 2 / 5 / 5" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4" } },
      { type: "core", style: { "grid-area": "2 / 3 / 3 / 4" } },
      { type: "core", style: { "grid-area": "4 / 3 / 5 / 4" } },
      { type: "core", style: { "grid-area": "3 / 2 / 4 / 3" } },
      { type: "core", style: { "grid-area": "3 / 4 / 4 / 5" } },
    ],
  },
  overseer: {
    label: "OVERSEER",
    category: "headquarters",
    blocks: [
      { type: "structure", style: { "grid-area": "1 / 1 / 3 / 6" } },
      { type: "depth", style: { "grid-area": "3 / 3 / 4 / 4" } },
      { type: "depth", style: { "grid-area": "4 / 2 / 6 / 5" } },
      { type: "core", style: { "grid-area": "1 / 1 / 2 / 2" } },
      { type: "core", style: { "grid-area": "1 / 5 / 2 / 6" } },
      { type: "core", style: { "grid-area": "2 / 2 / 3 / 3" } },
      { type: "core", style: { "grid-area": "2 / 4 / 3 / 5" } },
    ],
  },
  nexus: {
    label: "NEXUS",
    category: "headquarters",
    blocks: [
      { type: "structure", style: { "grid-area": "1 / 1 / 6 / 6", background: "transparent", border: "none" } },
      { type: "accent", style: { "grid-area": "1 / 1 / 6 / 6", transform: "rotate(45deg)", width: "1px", "justify-self": "center", background: "rgba(255,255,255,0.3)", border: "none" } },
      { type: "accent", style: { "grid-area": "1 / 1 / 6 / 6", transform: "rotate(-45deg)", width: "1px", "justify-self": "center", background: "rgba(255,255,255,0.3)", border: "none" } },
      { type: "core", style: { "grid-area": "1 / 1 / 2 / 2" } },
      { type: "core", style: { "grid-area": "1 / 5 / 2 / 6" } },
      { type: "core", style: { "grid-area": "5 / 1 / 6 / 2" } },
      { type: "core", style: { "grid-area": "5 / 5 / 6 / 6" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4" } },
    ],
  },
  zenith: {
    label: "ZENITH",
    category: "headquarters",
    blocks: [
      { type: "depth", style: { "grid-area": "2 / 1 / 6 / 2" } },
      { type: "depth", style: { "grid-area": "3 / 2 / 6 / 3" } },
      { type: "depth", style: { "grid-area": "3 / 4 / 6 / 5" } },
      { type: "depth", style: { "grid-area": "2 / 5 / 6 / 6" } },
      { type: "structure", style: { "grid-area": "1 / 3 / 6 / 4", "z-index": 8 } },
      { type: "core", style: { "grid-area": "1 / 3 / 2 / 4" } },
      { type: "core", style: { "grid-area": "2 / 3 / 3 / 4" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4" } },
      { type: "core", style: { "grid-area": "4 / 3 / 5 / 4" } },
      { type: "core", style: { "grid-area": "5 / 3 / 6 / 4" } },
    ],
  },

  // RESIDENTIAL
  megablock: {
    label: "MEGABLOCK",
    category: "residential",
    blocks: [
      { type: "depth", style: { "grid-area": "2 / 1 / 6 / 6" } },
      { type: "structure", style: { "grid-area": "1 / 2 / 3 / 5" } },
      { type: "accent", style: { "grid-area": "3 / 1 / 5 / 2" } },
      { type: "accent", style: { "grid-area": "3 / 5 / 5 / 6" } },
      { type: "structure", style: { "grid-area": "2 / 2 / 6 / 5", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", "z-index": 7 } },
      { type: "core", style: { "grid-area": "3 / 3 / 5 / 4" } },
    ],
  },
  needle: {
    label: "NEEDLE",
    category: "residential",
    blocks: [
      { type: "depth", style: { "grid-area": "5 / 2 / 6 / 5" } },
      { type: "structure", style: { "grid-area": "1 / 3 / 6 / 4" } },
      { type: "accent", style: { "grid-area": "2 / 2 / 3 / 5" } },
      { type: "accent", style: { "grid-area": "4 / 2 / 5 / 5" } },
      { type: "core", style: { "grid-area": "1 / 3 / 2 / 4" } },
    ],
  },
  archway: {
    label: "ARCHWAY",
    category: "residential",
    blocks: [
      { type: "structure", style: { "grid-area": "3 / 1 / 6 / 2" } },
      { type: "structure", style: { "grid-area": "3 / 5 / 6 / 6" } },
      { type: "depth", style: { "grid-area": "2 / 1 / 4 / 6" } },
      { type: "accent", style: { "grid-area": "1 / 2 / 2 / 5" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4" } },
    ],
  },
  "module-x": {
    label: "MODULE_X",
    category: "residential",
    blocks: [
      { type: "depth", style: { "grid-area": "2 / 2 / 5 / 5" } },
      { type: "structure", style: { "grid-area": "3 / 1 / 4 / 2" } },
      { type: "structure", style: { "grid-area": "3 / 5 / 4 / 6" } },
      { type: "structure", style: { "grid-area": "1 / 3 / 2 / 4" } },
      { type: "structure", style: { "grid-area": "5 / 3 / 6 / 4" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4" } },
    ],
  },

  // EXTRACTION
  framework: {
    label: "FRAMEWORK",
    category: "extraction",
    blocks: [
      { type: "depth", style: { "grid-area": "1 / 1 / 6 / 6", "border-width": "2px" } },
      { type: "depth", style: { "grid-area": "2 / 2 / 6 / 5" } },
      { type: "structure", style: { "grid-area": "2 / 1 / 3 / 6" } },
      { type: "structure", style: { "grid-area": "1 / 3 / 6 / 4" } },
      { type: "core", style: { "grid-area": "5 / 3 / 6 / 4" } },
    ],
  },
  "open-pit": {
    label: "OPEN_PIT",
    category: "extraction",
    blocks: [
      { type: "structure", style: { "grid-area": "1 / 1 / 2 / 6" } },
      { type: "depth", style: { "grid-area": "2 / 2 / 3 / 5" } },
      { type: "depth", style: { "grid-area": "3 / 3 / 4 / 4" } },
      { type: "accent", style: { "grid-area": "4 / 3 / 6 / 4", "border-style": "solid", "border-color": "rgba(255,255,255,0.4)" } },
      { type: "core", style: { "grid-area": "5 / 3 / 6 / 4" } },
    ],
  },
  gantry: {
    label: "GANTRY",
    category: "extraction",
    blocks: [
      { type: "structure", style: { "grid-area": "2 / 1 / 6 / 2" } },
      { type: "accent", style: { "grid-area": "2 / 1 / 3 / 6" } },
      { type: "depth", style: { "grid-area": "3 / 5 / 5 / 6", border: "1px solid rgba(255,255,255,0.2)", width: "2px", "justify-self": "center" } },
      { type: "depth", style: { "grid-area": "5 / 4 / 6 / 6" } },
      { type: "core", style: { "grid-area": "2 / 2 / 3 / 3" } },
    ],
  },
  borehole: {
    label: "BOREHOLE",
    category: "extraction",
    blocks: [
      { type: "structure", style: { "grid-area": "1 / 1 / 2 / 6" } },
      { type: "depth", style: { "grid-area": "1 / 3 / 6 / 4" } },
      { type: "accent", style: { "grid-area": "4 / 1 / 6 / 3" } },
      { type: "accent", style: { "grid-area": "4 / 4 / 6 / 6" } },
      { type: "core", style: { "grid-area": "5 / 3 / 6 / 4" } },
    ],
  },

  // INDUSTRIAL
  refinery: {
    label: "REFINERY_COMPLEX",
    category: "industrial",
    blocks: [
      { type: "depth", style: { "grid-area": "3 / 1 / 6 / 5", "border-width": "2px" } },
      { type: "depth", style: { "grid-area": "4 / 2 / 6 / 6" } },
      { type: "structure", style: { "grid-area": "1 / 2 / 4 / 3" } },
      { type: "structure", style: { "grid-area": "2 / 4 / 4 / 5" } },
      { type: "accent", style: { "grid-area": "4 / 1 / 5 / 6" } },
      { type: "core", style: { "grid-area": "5 / 3 / 6 / 4" } },
    ],
  },
  "solar-array": {
    label: "SOLAR_ARRAY",
    category: "industrial",
    blocks: [
      { type: "depth", style: { "grid-area": "3 / 1 / 6 / 6", transform: "skewX(-10deg)" } },
      { type: "structure", style: { "grid-area": "5 / 1 / 6 / 6" } },
      { type: "structure", style: { "grid-area": "4 / 2 / 5 / 6" } },
      { type: "structure", style: { "grid-area": "3 / 3 / 4 / 6" } },
      { type: "core", style: { "grid-area": "1 / 5 / 2 / 6", "border-radius": "50%" } },
      { type: "accent", style: { "grid-area": "1 / 5 / 6 / 6", opacity: 0.3, width: "2px", "justify-self": "center" } },
    ],
  },

  // TECHNOLOGY
  monolith: {
    label: "MONOLITH",
    category: "technology",
    blocks: [
      { type: "structure", style: { "grid-area": "1 / 2 / 6 / 5" } },
      { type: "depth", style: { "grid-area": "2 / 1 / 5 / 2" } },
      { type: "depth", style: { "grid-area": "2 / 5 / 5 / 6" } },
      { type: "structure", style: { "grid-area": "5 / 1 / 6 / 6" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4" } },
    ],
  },
  "server-farm": {
    label: "SERVER_FARM",
    category: "technology",
    blocks: [
      { type: "structure", style: { "grid-area": "2 / 1 / 6 / 2" } },
      { type: "structure", style: { "grid-area": "2 / 2 / 6 / 3" } },
      { type: "structure", style: { "grid-area": "2 / 3 / 6 / 4" } },
      { type: "structure", style: { "grid-area": "2 / 4 / 6 / 5" } },
      { type: "structure", style: { "grid-area": "2 / 5 / 6 / 6" } },
      { type: "accent", style: { "grid-area": "1 / 1 / 2 / 6", "border-bottom": "2px solid rgba(255,255,255,0.2)", background: "transparent" } },
      { type: "core", style: { "grid-area": "4 / 3 / 5 / 4" } },
    ],
  },
  "quantum-core": {
    label: "QUANTUM_CORE",
    category: "technology",
    blocks: [
      { type: "depth", style: { "grid-area": "2 / 2 / 5 / 5", "border-radius": "50%", border: "1px dashed rgba(255,255,255,0.3)", background: "transparent" } },
      { type: "structure", style: { "grid-area": "1 / 1 / 2 / 2" } },
      { type: "structure", style: { "grid-area": "1 / 5 / 2 / 6" } },
      { type: "structure", style: { "grid-area": "5 / 1 / 6 / 2" } },
      { type: "structure", style: { "grid-area": "5 / 5 / 6 / 6" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4", "border-radius": "50%" } },
    ],
  },

  // AEROSPACE
  tether: {
    label: "TETHER",
    category: "aerospace",
    blocks: [
      { type: "accent", style: { "grid-area": "1 / 3 / 6 / 4", width: "2px", background: "rgba(255,255,255,0.5)", "justify-self": "center", "z-index": 8, border: "none" } },
      { type: "structure", style: { "grid-area": "3 / 2 / 4 / 5", "z-index": 9 } },
      { type: "structure", style: { "grid-area": "5 / 1 / 6 / 6" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4", width: "6px", height: "6px", "border-radius": "50%", "justify-self": "center", "align-self": "center" } },
    ],
  },
  "orbital-anchor": {
    label: "ORBITAL_ANCHOR",
    category: "aerospace",
    blocks: [
      { type: "structure", style: { "grid-area": "1 / 1 / 3 / 6" } },
      { type: "depth", style: { "grid-area": "3 / 1 / 4 / 3" } },
      { type: "depth", style: { "grid-area": "3 / 4 / 4 / 6" } },
      { type: "accent", style: { "grid-area": "3 / 3 / 6 / 4", width: "2px", "justify-self": "center", background: "rgba(255,255,255,0.3)", border: "none" } },
      { type: "core", style: { "grid-area": "2 / 3 / 3 / 4" } },
    ],
  },
  "ground-station": {
    label: "GROUND_STATION",
    category: "aerospace",
    blocks: [
      { type: "structure", style: { "grid-area": "3 / 1 / 6 / 3", transform: "skewY(-10deg)" } },
      { type: "structure", style: { "grid-area": "3 / 4 / 6 / 6", transform: "skewY(10deg)" } },
      { type: "depth", style: { "grid-area": "5 / 2 / 6 / 5" } },
      { type: "accent", style: { "grid-area": "1 / 3 / 5 / 4", width: "4px", "justify-self": "center", background: "rgba(255,255,255,0.3)", border: "none" } },
      { type: "core", style: { "grid-area": "4 / 3 / 5 / 4" } },
    ],
  },

  // LOGISTICS
  hangar: {
    label: "HANGAR_BAY",
    category: "logistics",
    blocks: [
      { type: "structure", style: { "grid-area": "1 / 3 / 2 / 4" } },
      { type: "depth", style: { "grid-area": "2 / 1 / 3 / 3", transform: "skewY(-15deg)" } },
      { type: "depth", style: { "grid-area": "2 / 4 / 3 / 6", transform: "skewY(15deg)" } },
      { type: "structure", style: { "grid-area": "3 / 1 / 6 / 2" } },
      { type: "structure", style: { "grid-area": "3 / 5 / 6 / 6" } },
      { type: "accent", style: { "grid-area": "5 / 2 / 6 / 5", "border-top": "1px solid rgba(255,255,255,0.2)", background: "transparent" } },
      { type: "core", style: { "grid-area": "5 / 3 / 6 / 4", height: "50%", "align-self": "end" } },
    ],
  },
  "stack-yard": {
    label: "STACK_YARD",
    category: "logistics",
    blocks: [
      { type: "structure", style: { "grid-area": "4 / 1 / 6 / 2" } },
      { type: "structure", style: { "grid-area": "3 / 2 / 6 / 3" } },
      { type: "structure", style: { "grid-area": "5 / 3 / 6 / 4" } },
      { type: "structure", style: { "grid-area": "2 / 4 / 6 / 5" } },
      { type: "structure", style: { "grid-area": "4 / 5 / 6 / 6" } },
      { type: "accent", style: { "grid-area": "1 / 1 / 2 / 6", "border-bottom": "1px solid rgba(255,255,255,0.3)", background: "transparent" } },
      { type: "core", style: { "grid-area": "2 / 2 / 3 / 3" } },
    ],
  },
  vault: {
    label: "SECURE_VAULT",
    category: "logistics",
    blocks: [
      { type: "depth", style: { "grid-area": "1 / 1 / 6 / 6", "border-width": "2px" } },
      { type: "structure", style: { "grid-area": "2 / 2 / 5 / 5" } },
      { type: "accent", style: { "grid-area": "3 / 2 / 4 / 5", background: "rgba(255,255,255,0.1)" } },
      { type: "accent", style: { "grid-area": "2 / 3 / 5 / 4", background: "rgba(255,255,255,0.1)" } },
      { type: "core", style: { "grid-area": "3 / 3 / 4 / 4" } },
    ],
  },
};

/** All available building construct types */
export const BUILDING_CONSTRUCT_TYPES = /** @type {BuildingConstructType[]} */ (Object.keys(BUILDING_DEFINITIONS));

/** Building categories with their types */
export const BUILDING_CONSTRUCT_CATEGORIES = {
  headquarters: ["citadel", "overseer", "nexus", "zenith"],
  residential: ["megablock", "needle", "archway", "module-x"],
  extraction: ["framework", "open-pit", "gantry", "borehole"],
  industrial: ["refinery", "solar-array"],
  technology: ["monolith", "server-farm", "quantum-core"],
  aerospace: ["tether", "orbital-anchor", "ground-station"],
  logistics: ["hangar", "stack-yard", "vault"],
};

/**
 * Get building definition by type
 * @param {BuildingConstructType} type
 * @returns {Object|null}
 */
export const getBuildingConstructDefinition = (type) => BUILDING_DEFINITIONS[type] || null;

// Base block styles
const BLOCK_STYLES = {
  base: {
    "background-color": "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    "backdrop-filter": "blur(0px)",
    transition: "all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
    "pointer-events": "none",
    "z-index": 1,
  },
  structure: {
    "background-color": "rgba(255, 255, 255, 0.08)",
    "border-color": "rgba(255, 255, 255, 0.2)",
    "z-index": 5,
  },
  depth: {
    "background-color": "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    "z-index": 2,
    transform: "scale(0.95)",
  },
  core: {
    "background-color": "#ffffff",
    "box-shadow": "0 0 25px rgba(255, 255, 255, 0.5)",
    border: "1px solid #fff",
    "z-index": 10,
  },
  accent: {
    "background-color": "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.35)",
    "z-index": 6,
  },
};

/**
 * Merges base block style with type-specific style and custom overrides
 * @param {string} blockType
 * @param {Object} customStyle
 */
const getBlockStyle = (blockType, customStyle) => {
  const baseStyle = { ...BLOCK_STYLES.base };
  const typeStyle = BLOCK_STYLES[blockType] || {};
  return { ...baseStyle, ...typeStyle, ...customStyle };
};

/**
 * A reusable building construct component that renders various building types
 * using a 5x5 CSS grid with layered blocks. This is the larger, more detailed
 * version of building icons for use in detailed views and showcases.
 *
 * @param {BuildingConstructProps} props
 */
export const BuildingConstruct = (props) => {
  const [local, others] = splitProps(props, ["type", "size", "class", "showLabel", "interactive"]);

  const size = () => local.size || 180;
  const interactive = () => local.interactive !== false;
  const definition = () => BUILDING_DEFINITIONS[local.type];

  return (
    <div
      class={`building-construct ${interactive() ? "building-construct--interactive" : ""} ${local.class || ""}`}
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
      }}
      {...others}
    >
      <div
        class="building-construct__grid"
        style={{
          display: "grid",
          "grid-template-columns": "repeat(5, 1fr)",
          "grid-template-rows": "repeat(5, 1fr)",
          width: `${size()}px`,
          height: `${size()}px`,
          gap: 0,
          padding: "4px",
          position: "relative",
        }}
      >
        <For each={definition()?.blocks}>
          {(block) => (
            <div
              class={`building-construct__block building-construct__block--${block.type}`}
              style={getBlockStyle(block.type, block.style)}
            />
          )}
        </For>
      </div>
      {local.showLabel && definition() && (
        <div
          class="building-construct__label"
          style={{
            "font-size": "0.75rem",
            "letter-spacing": "0.1em",
            "text-transform": "uppercase",
            opacity: 0.5,
            transition: "opacity 0.3s, color 0.3s",
            "text-align": "center",
            color: "#888",
            "margin-top": "1rem",
          }}
        >
          {definition().label}
        </div>
      )}

      <style>{`
        .building-construct--interactive:hover .building-construct__block {
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        .building-construct--interactive:hover .building-construct__block--structure {
          background-color: rgba(255, 255, 255, 0.12) !important;
          transform: scale(1.02) !important;
        }

        .building-construct--interactive:hover .building-construct__block--core {
          box-shadow: 0 0 50px rgba(255, 255, 255, 0.9) !important;
          transform: scale(1.05) !important;
        }

        .building-construct--interactive:hover .building-construct__block--depth {
          transform: scale(1) !important;
          background-color: rgba(255, 255, 255, 0.09) !important;
        }

        .building-construct--interactive:hover .building-construct__block--accent {
          background-color: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
        }

        .building-construct--interactive:hover .building-construct__label {
          opacity: 1;
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default BuildingConstruct;
