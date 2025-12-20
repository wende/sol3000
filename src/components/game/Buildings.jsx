import { For } from 'solid-js';

/**
 * Building components for the hex grid
 * Based on the architectural compendium from buildings.jsx (HTML)
 * Uses CSS classes that match the original HTML structure
 */

// Building definitions matching the HTML structure exactly
// Each building has a gridClass and an array of blocks with their CSS classes
export const BUILDING_DEFINITIONS = {
  // HEADQUARTERS
  citadel: {
    name: 'CITADEL',
    category: 'HEADQUARTERS',
    gridClass: 'hq-1',
    blocks: [
      { classes: 'block structure outer' },
      { classes: 'block depth inner' },
      { classes: 'block core c1' },
      { classes: 'block core c2' },
      { classes: 'block core c3' },
      { classes: 'block core c4' },
      { classes: 'block core c5' },
    ]
  },
  overseer: {
    name: 'OVERSEER',
    category: 'HEADQUARTERS',
    gridClass: 'hq-2',
    blocks: [
      { classes: 'block structure head' },
      { classes: 'block depth neck' },
      { classes: 'block depth base' },
      { classes: 'block core c1' },
      { classes: 'block core c2' },
      { classes: 'block core c3' },
      { classes: 'block core c4' },
    ]
  },
  nexus: {
    name: 'NEXUS',
    category: 'HEADQUARTERS',
    gridClass: 'hq-3',
    blocks: [
      { classes: 'block structure grid' },
      { classes: 'block accent link1' },
      { classes: 'block accent link2' },
      { classes: 'block core c1' },
      { classes: 'block core c2' },
      { classes: 'block core c3' },
      { classes: 'block core c4' },
      { classes: 'block core c5' },
    ]
  },
  zenith: {
    name: 'ZENITH',
    category: 'HEADQUARTERS',
    gridClass: 'hq-4',
    blocks: [
      { classes: 'block depth col1' },
      { classes: 'block depth col2' },
      { classes: 'block depth col3' },
      { classes: 'block depth col4' },
      { classes: 'block structure spine' },
      { classes: 'block core c1' },
      { classes: 'block core c2' },
      { classes: 'block core c3' },
      { classes: 'block core c4' },
      { classes: 'block core c5' },
    ]
  },

  // RESIDENTIAL
  megablock: {
    name: 'MEGABLOCK',
    category: 'RESIDENTIAL',
    gridClass: 'house',
    blocks: [
      { classes: 'block depth bg-mono' },
      { classes: 'block structure spine' },
      { classes: 'block accent pod-1' },
      { classes: 'block accent pod-2' },
      { classes: 'block structure base' },
      { classes: 'block core' },
    ]
  },
  needle: {
    name: 'NEEDLE',
    category: 'RESIDENTIAL',
    gridClass: 'house-2',
    blocks: [
      { classes: 'block depth base-pad' },
      { classes: 'block structure tower' },
      { classes: 'block accent ring-1' },
      { classes: 'block accent ring-2' },
      { classes: 'block core' },
    ]
  },
  archway: {
    name: 'ARCHWAY',
    category: 'RESIDENTIAL',
    gridClass: 'house-3',
    blocks: [
      { classes: 'block structure leg-l' },
      { classes: 'block structure leg-r' },
      { classes: 'block depth bridge' },
      { classes: 'block accent roof' },
      { classes: 'block core' },
    ]
  },
  moduleX: {
    name: 'MODULE_X',
    category: 'RESIDENTIAL',
    gridClass: 'house-4',
    blocks: [
      { classes: 'block depth main' },
      { classes: 'block structure out-1' },
      { classes: 'block structure out-2' },
      { classes: 'block structure out-3' },
      { classes: 'block structure out-4' },
      { classes: 'block core' },
    ]
  },

  // EXTRACTION
  framework: {
    name: 'FRAMEWORK',
    category: 'EXTRACTION',
    gridClass: 'mine',
    blocks: [
      { classes: 'block depth frame-out' },
      { classes: 'block depth frame-mid' },
      { classes: 'block structure crossbeam' },
      { classes: 'block structure shaft' },
      { classes: 'block core drill-tip' },
    ]
  },
  openPit: {
    name: 'OPEN_PIT',
    category: 'EXTRACTION',
    gridClass: 'mine-2',
    blocks: [
      { classes: 'block structure rim' },
      { classes: 'block depth step-1' },
      { classes: 'block depth step-2' },
      { classes: 'block accent deep' },
      { classes: 'block core' },
    ]
  },
  gantry: {
    name: 'GANTRY',
    category: 'EXTRACTION',
    gridClass: 'mine-3',
    blocks: [
      { classes: 'block structure tower' },
      { classes: 'block accent jib' },
      { classes: 'block depth cables' },
      { classes: 'block depth load' },
      { classes: 'block core' },
    ]
  },
  borehole: {
    name: 'BOREHOLE',
    category: 'EXTRACTION',
    gridClass: 'mine-4',
    blocks: [
      { classes: 'block structure surface' },
      { classes: 'block depth tube' },
      { classes: 'block accent tank-l' },
      { classes: 'block accent tank-r' },
      { classes: 'block core' },
    ]
  },

  // INDUSTRIAL
  refinery: {
    name: 'REFINERY_COMPLEX',
    category: 'INDUSTRIAL',
    gridClass: 'refinery',
    blocks: [
      { classes: 'block depth main-blk' },
      { classes: 'block depth overlay' },
      { classes: 'block structure stack-l' },
      { classes: 'block structure stack-r' },
      { classes: 'block accent pipe' },
      { classes: 'block core' },
    ]
  },
  solarArray: {
    name: 'SOLAR_ARRAY',
    category: 'INDUSTRIAL',
    gridClass: 'solar',
    blocks: [
      { classes: 'block depth panel-bg' },
      { classes: 'block structure row-1' },
      { classes: 'block structure row-2' },
      { classes: 'block structure row-3' },
      { classes: 'block core sun' },
      { classes: 'block accent ray' },
    ]
  },

  // TECHNOLOGY
  monolith: {
    name: 'MONOLITH',
    category: 'TECHNOLOGY',
    gridClass: 'tech-1',
    blocks: [
      { classes: 'block structure mono' },
      { classes: 'block depth side-l' },
      { classes: 'block depth side-r' },
      { classes: 'block structure base' },
      { classes: 'block core' },
    ]
  },
  serverFarm: {
    name: 'SERVER_FARM',
    category: 'TECHNOLOGY',
    gridClass: 'tech-2',
    blocks: [
      { classes: 'block structure rack-1' },
      { classes: 'block structure rack-2' },
      { classes: 'block structure rack-3' },
      { classes: 'block structure rack-4' },
      { classes: 'block structure rack-5' },
      { classes: 'block accent bus' },
      { classes: 'block core' },
    ]
  },
  quantumCore: {
    name: 'QUANTUM_CORE',
    category: 'TECHNOLOGY',
    gridClass: 'tech-3',
    blocks: [
      { classes: 'block depth containment' },
      { classes: 'block structure c1' },
      { classes: 'block structure c2' },
      { classes: 'block structure c3' },
      { classes: 'block structure c4' },
      { classes: 'block core' },
    ]
  },

  // AEROSPACE
  tether: {
    name: 'TETHER',
    category: 'AEROSPACE',
    gridClass: 'elev-1',
    blocks: [
      { classes: 'block accent cable' },
      { classes: 'block structure climber' },
      { classes: 'block structure base' },
      { classes: 'block core' },
    ]
  },
  orbitalAnchor: {
    name: 'ORBITAL_ANCHOR',
    category: 'AEROSPACE',
    gridClass: 'elev-2',
    blocks: [
      { classes: 'block structure station' },
      { classes: 'block depth dock-l' },
      { classes: 'block depth dock-r' },
      { classes: 'block accent cable' },
      { classes: 'block core' },
    ]
  },
  groundStation: {
    name: 'GROUND_STATION',
    category: 'AEROSPACE',
    gridClass: 'elev-3',
    blocks: [
      { classes: 'block structure anchor-l' },
      { classes: 'block structure anchor-r' },
      { classes: 'block depth platform' },
      { classes: 'block accent cable' },
      { classes: 'block core' },
    ]
  },

  // LOGISTICS
  hangar: {
    name: 'HANGAR_BAY',
    category: 'LOGISTICS',
    gridClass: 'ware-1',
    blocks: [
      { classes: 'block structure roof-M' },
      { classes: 'block depth roof-L' },
      { classes: 'block depth roof-R' },
      { classes: 'block structure wall-L' },
      { classes: 'block structure wall-R' },
      { classes: 'block accent floor' },
      { classes: 'block core' },
    ]
  },
  stackYard: {
    name: 'STACK_YARD',
    category: 'LOGISTICS',
    gridClass: 'ware-2',
    blocks: [
      { classes: 'block structure s1' },
      { classes: 'block structure s2' },
      { classes: 'block structure s3' },
      { classes: 'block structure s4' },
      { classes: 'block structure s5' },
      { classes: 'block accent crane' },
      { classes: 'block core' },
    ]
  },
  vault: {
    name: 'SECURE_VAULT',
    category: 'LOGISTICS',
    gridClass: 'ware-3',
    blocks: [
      { classes: 'block depth outer' },
      { classes: 'block structure inner' },
      { classes: 'block accent lock-h' },
      { classes: 'block accent lock-v' },
      { classes: 'block core' },
    ]
  },
};

// Get all building keys for random selection
export const BUILDING_KEYS = Object.keys(BUILDING_DEFINITIONS);

// Get a random building key
export const getRandomBuildingKey = () => {
  return BUILDING_KEYS[Math.floor(Math.random() * BUILDING_KEYS.length)];
};

/**
 * Building component that renders on a hex
 * @param {Object} props
 * @param {string} props.buildingKey - Key of the building to render
 * @param {number} props.size - Size of the building grid (default 40)
 * @param {boolean} props.enableHover - Enable hover animations (default true)
 */
export const Building = (props) => {
  const building = () => BUILDING_DEFINITIONS[props.buildingKey];
  const size = () => props.size || 40;
  const enableHover = () => props.enableHover !== false;

  if (!building()) return null;

  return (
    <div
      class={`construct-grid ${building().gridClass} ${enableHover() ? 'building-hover' : ''}`}
      style={{
        width: `${size()}px`,
        height: `${size()}px`,
      }}
    >
      <For each={building().blocks}>
        {(block) => <div class={block.classes} />}
      </For>
    </div>
  );
};
