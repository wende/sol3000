import { onMount, createEffect, onCleanup, createSignal, For, createMemo, Show } from 'solid-js';
import * as d3 from 'd3';
import { Building } from './Buildings';

// Hexagon constants
const HEX_SIZE = 40;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;
const HEX_SPACING = 2; // Gap between hexes

/**
 * Calculates the corners of a hexagon
 * @param {number} x - Center x
 * @param {number} y - Center y
 * @param {number} size - Radius
 * @returns {string} - SVG points string
 */
const getHexPoints = (x, y, size) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30; // Pointy topped
    const angle_rad = Math.PI / 180 * angle_deg;
    points.push(`${x + size * Math.cos(angle_rad)},${y + size * Math.sin(angle_rad)}`);
  }
  return points.join(' ');
};

/**
 * @typedef {Object} HexGridProps
 * @property {Array} hexes - Array of hex objects { q, r, id, content... }
 * @property {Function} onHexSelect - Callback when a hex is selected
 * @property {Array<string|number>} selectedHexIds - Array of IDs of the currently selected hexes
 * @property {Object} hexBuildings - Map of hex id to building key
 */

export const HexGrid = (props) => {
  let svgRef;
  let gRef;
  let zoomBehavior;

  // Manual zoom limits similar to GalaxyMap
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 3.0;
  
  // Transform signal to sync with D3
  const [transform, setTransform] = createSignal({ k: 1, x: 0, y: 0 });

  onMount(() => {
    if (!svgRef || !gRef) return;

    zoomBehavior = d3.zoom()
      .scaleExtent([MIN_SCALE, MAX_SCALE])
      .on('zoom', (e) => {
        d3.select(gRef).attr('transform', e.transform);
        setTransform(e.transform);
      });

    const svg = d3.select(svgRef);
    svg.call(zoomBehavior);
    svg.on('dblclick.zoom', null);

    // Center the view initially
    const initialScale = 1;
    const initialX = window.innerWidth / 2;
    const initialY = window.innerHeight / 2;
    
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(initialX, initialY).scale(initialScale));
  });

  onCleanup(() => {
    if (svgRef && zoomBehavior) {
      d3.select(svgRef).on('.zoom', null);
    }
  });

  const handleHexClick = (e, hex) => {
    e.stopPropagation();
    props.onHexSelect?.(hex.id);
  };

  const handleBackgroundClick = () => {
    props.onHexSelect?.(null);
  };

  // Helper to convert axial (q, r) to pixel (x, y)
  const hexToPixel = (q, r) => {
    const x = (HEX_SIZE + HEX_SPACING/2) * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
    const y = (HEX_SIZE + HEX_SPACING/2) * (3./2 * r);
    return { x, y };
  };

  // Memoized Set of selected IDs for O(1) lookup
  const selectedSet = createMemo(() => new Set(props.selectedHexIds || []));

  // Memoized Map of coordinate to ID to facilitate neighbor lookup
  const hexIdMap = createMemo(() => {
    const map = new Map();
    if (props.hexes) {
      props.hexes.forEach(h => map.set(`${h.q},${h.r}`, h.id));
    }
    return map;
  });

  // Calculate boundary segments for the "merged" selection look
  const boundarySegments = createMemo(() => {
    const segments = [];
    const selected = selectedSet();
    const idMap = hexIdMap();
    if (!props.hexes) return segments;
    
    // Only process selected hexes
    const selectedHexes = props.hexes.filter(h => selected.has(h.id));
    
    selectedHexes.forEach(hex => {
      const { x, y } = hexToPixel(hex.q, hex.r);
      
      // Check all 6 directions
      for (let i = 0; i < 6; i++) {
        const dir = [
            { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 }, 
            { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
        ][i];
        
        const nq = hex.q + dir.q;
        const nr = hex.r + dir.r;
        const nId = idMap.get(`${nq},${nr}`);
        
        // If neighbor is NOT selected, this edge is a boundary
        if (nId === undefined || !selected.has(nId)) {
           // Calculate corners for side i
           // Angles for Pointy Topped: 60*i - 30
           const angle1 = Math.PI / 180 * (60 * i - 30);
           const angle2 = Math.PI / 180 * (60 * ((i + 1) % 6) - 30);
           
           segments.push({
             x1: x + HEX_SIZE * Math.cos(angle1),
             y1: y + HEX_SIZE * Math.sin(angle1),
             x2: x + HEX_SIZE * Math.cos(angle2),
             y2: y + HEX_SIZE * Math.sin(angle2)
           });
        }
      }
    });
    return segments;
  });

  return (
    <svg
      ref={svgRef}
      class="w-full h-full cursor-grab active:cursor-grabbing bg-black"
      onClick={handleBackgroundClick}
    >
      <g ref={gRef}>
        {/* Render Hexes (Fills) */}
        <For each={props.hexes}>
          {(hex) => {
            const pos = hexToPixel(hex.q, hex.r);
            // We use the reactive memo here to avoid prop drilling issues if any
            const isSelected = selectedSet().has(hex.id);
            const buildingKey = () => props.hexBuildings?.[hex.id];

            return (
              <g
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={(e) => handleHexClick(e, hex)}
                class="transition-opacity duration-300"
                style={{ cursor: 'pointer' }}
              >
                <polygon
                  points={getHexPoints(0, 0, HEX_SIZE)}
                  // If selected, use the glowy fill but NO stroke (handled by boundary layer)
                  fill={isSelected ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.03)"}
                  // Only stroke unselected hexes
                  stroke={isSelected ? "none" : "rgba(255, 255, 255, 0.15)"}
                  stroke-width={1}
                  class={`transition-all duration-200 hover:fill-white/10 ${isSelected ? '' : 'hover:stroke-white/40'}`}
                />

                {/* Building on hex */}
                <Show when={buildingKey()}>
                  <foreignObject
                    x={-HEX_SIZE * 0.6}
                    y={-HEX_SIZE * 0.6}
                    width={HEX_SIZE * 1.2}
                    height={HEX_SIZE * 1.2}
                    class="pointer-events-none"
                  >
                    <div
                      xmlns="http://www.w3.org/1999/xhtml"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                      }}
                    >
                      <Building buildingKey={buildingKey()} size={HEX_SIZE * 1.1} />
                    </div>
                  </foreignObject>
                </Show>

                {/* Debug Coord Label - only show when no building */}
                <Show when={!buildingKey()}>
                  <text
                    x="0"
                    y="0"
                    text-anchor="middle"
                    alignment-baseline="middle"
                    class="text-[8px] pointer-events-none fill-white/20 select-none font-mono"
                    style={{ "font-size": "8px" }}
                  >
                    {`${hex.q},${hex.r}`}
                  </text>
                </Show>
              </g>
            );
          }}
        </For>

        {/* Render Boundary Lines (Merged Glow) */}
        <g class="selected-glow pointer-events-none">
          <For each={boundarySegments()}>
            {(seg) => (
              <line 
                x1={seg.x1} 
                y1={seg.y1} 
                x2={seg.x2} 
                y2={seg.y2} 
                stroke="white" 
                stroke-width="2" 
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            )}
          </For>
        </g>
      </g>
    </svg>
  );
};
