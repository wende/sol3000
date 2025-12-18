import { onMount, createEffect, Show, For, createMemo } from 'solid-js';
import * as d3 from 'd3';
import { MAP_WIDTH, MAP_HEIGHT, CENTER_X, CENTER_Y } from '../../utils/galaxy';

/**
 * @typedef {Object} GalaxyMapProps
 * @property {Object} data - The galaxy data
 * @property {Array} data.systems - Array of star systems
 * @property {Array} data.routes - Array of routes
 * @property {Function} onSystemSelect - Callback when a system is selected
 * @property {number|null} selectedSystemId - ID of the currently selected system
 * @property {number|null} homeSystemId - ID of the home system
 * @property {Array} ripples - Array of ripple effects
 * @property {number} zoomLevel - Current zoom level
 * @property {Function} setZoomLevel - Setter for zoom level
 * @property {Array} ships - Array of ships (docked and in transit)
 */

/**
 * The Galaxy Map component utilizing D3 for rendering the star systems and routes.
 *
 * @param {GalaxyMapProps} props
 */
export const GalaxyMap = (props) => {
  let svgRef;
  let gRef;
  let zoomBehavior;
  let lastClickTime = 0;
  let lastClickId = null;
  let hasZoomedToHome = false;

  // Initialize Zoom
  onMount(() => {
    if (!svgRef || !gRef) return;

    zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 3.0])
      .translateExtent([[-1000, -1000], [MAP_WIDTH + 1000, MAP_HEIGHT + 1000]])
      .on('zoom', (e) => {
        d3.select(gRef).attr('transform', e.transform);
        // Update zoom level for LOD (Level of Detail)
        props.setZoomLevel(e.transform.k);
      });

    const svg = d3.select(svgRef);
    svg.call(zoomBehavior);
    // Disable D3's built-in double-click zoom to use our custom handler
    svg.on('dblclick.zoom', null);

    // Center the view on the galaxy center (CENTER_X, CENTER_Y)
    const initialScale = 0.45;
    // Set zoom level immediately before applying transform to prevent LOD flicker
    props.setZoomLevel(initialScale);
    const translateX = (window.innerWidth / 2) - (CENTER_X * initialScale);
    const translateY = (window.innerHeight / 2) - (CENTER_Y * initialScale);
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(translateX, translateY).scale(initialScale));
  });

  // Function to center and zoom on a system
  const centerOnSystem = (sys, duration = 750) => {
    if (!svgRef || !zoomBehavior) return;

    const svg = d3.select(svgRef);
    const targetScale = 1.5; // Fixed zoom level

    // Calculate center of viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Create transform: translate to center, scale, then translate system to origin
    const transform = d3.zoomIdentity
      .translate(centerX, centerY)
      .scale(targetScale)
      .translate(-sys.x, -sys.y);

    svg.transition()
      .duration(duration)
      .call(zoomBehavior.transform, transform);
  };

  // Auto-zoom to home system when it's first selected
  createEffect(() => {
    const homeId = props.homeSystemId;

    // Reset flag when home is cleared (new game started)
    if (!homeId) {
      hasZoomedToHome = false;
      return;
    }

    // Zoom to home system once it's set
    if (homeId && !hasZoomedToHome && props.data.systems.length > 0) {
      const homeSystem = props.data.systems.find(s => s.id === homeId);
      if (homeSystem && svgRef && zoomBehavior) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          centerOnSystem(homeSystem, 1200);
          hasZoomedToHome = true;
        }, 100);
      }
    }
  });

  // Handle system click with double-click detection
  const handleSystemClick = (e, sys) => {
    e.stopPropagation();

    const now = Date.now();
    const isDoubleClick = (now - lastClickTime < 300) && (lastClickId === sys.id);

    if (isDoubleClick) {
      // Double-click: center and zoom on the system
      centerOnSystem(sys);
    }

    // Always select the system
    props.onSystemSelect(sys.id);

    lastClickTime = now;
    lastClickId = sys.id;
  };

  // Calculate ship positions for transit ships
  const transitShips = createMemo(() => {
    const ships = props.ships || [];
    return ships.filter(s => s.status === 'transit').map(ship => {
      if (!ship.route || ship.route.length === 0) return null;

      const systems = props.data.systems;
      const currentSegment = ship.currentSegment || 0;
      const segmentProgress = ship.segmentProgress || 0;

      // Get the current and next system in the route
      let fromSystem, toSystem;

      if (currentSegment === 0) {
        // First segment: from origin to first waypoint
        fromSystem = systems.find(s => s.id === ship.route[0]);
        // Find origin system from ships list
        const originId = ship.systemId;
        const origin = systems.find(s => s.id === originId);
        if (origin && fromSystem) {
          fromSystem = origin;
          toSystem = systems.find(s => s.id === ship.route[0]);
        }
      } else if (currentSegment < ship.route.length) {
        fromSystem = systems.find(s => s.id === ship.route[currentSegment - 1]);
        toSystem = systems.find(s => s.id === ship.route[currentSegment]);
      }

      if (!fromSystem || !toSystem) return null;

      // Interpolate position
      const x = fromSystem.x + (toSystem.x - fromSystem.x) * segmentProgress;
      const y = fromSystem.y + (toSystem.y - fromSystem.y) * segmentProgress;

      // Calculate rotation angle
      const angle = Math.atan2(toSystem.y - fromSystem.y, toSystem.x - fromSystem.x) * (180 / Math.PI) + 90;

      return {
        ...ship,
        x,
        y,
        angle,
        destSystem: systems.find(s => s.id === ship.destinationId)
      };
    }).filter(Boolean);
  });

  return (
    <svg
      id="galaxy-map-svg"
      ref={svgRef}
      class="w-full h-full cursor-grab active:cursor-grabbing galaxy-map-svg"
      style={{ background: 'transparent' }}
    >
      <defs>
        {/* Accretion Disk Gradient - Orange/Gold to Black */}
        <radialGradient id="accretionGradient" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="transparent" />
          <stop offset="80%" stop-color="#dcae68" stop-opacity="0.8" />
          <stop offset="90%" stop-color="#ffdd99" stop-opacity="1" />
          <stop offset="100%" stop-color="transparent" />
        </radialGradient>

        <linearGradient id="accretionGradientFront" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#c98a28" stop-opacity="0" />
          <stop offset="30%" stop-color="#ffb84d" stop-opacity="0.9" />
          <stop offset="50%" stop-color="#ffe6b3" stop-opacity="1" />
          <stop offset="70%" stop-color="#ffb84d" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#c98a28" stop-opacity="0" />
        </linearGradient>

        <linearGradient id="lensingGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#ffb84d" stop-opacity="0.8" />
          <stop offset="100%" stop-color="transparent" />
        </linearGradient>

        {/* Simple noise pattern for turbulence */}
        <filter id="turbulence">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>

        {/* Ship glow filter */}
        <filter id="shipGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <g ref={gRef} class="gpu-accelerated">
        {/* FTL Lines - Hidden when zoomed out for performance */}
        <Show when={props.zoomLevel >= 0.25}>
          <For each={props.data.routes}>
            {(route) => (
              <line
                x1={route.source.x}
                y1={route.source.y}
                x2={route.target.x}
                y2={route.target.y}
                class="ftl-line"
              />
            )}
          </For>
        </Show>

        {/* Ships in Transit */}
        <For each={transitShips()}>
          {(ship) => (
            <g transform={`translate(${ship.x}, ${ship.y})`}>
              {/* Ship trail */}
              <line
                x1={0}
                y1={0}
                x2={Math.cos((ship.angle - 90) * Math.PI / 180) * -30}
                y2={Math.sin((ship.angle - 90) * Math.PI / 180) * -30}
                stroke="rgba(59, 130, 246, 0.3)"
                stroke-width="2"
                stroke-linecap="round"
              />

              {/* Ship icon */}
              <g transform={`rotate(${ship.angle})`} filter="url(#shipGlow)">
                <polygon
                  points="0,-8 5,8 0,4 -5,8"
                  fill="#3b82f6"
                  stroke="white"
                  stroke-width="0.5"
                  class="ship-icon"
                />
              </g>

              {/* Destination indicator line - only when zoomed in */}
              <Show when={props.zoomLevel >= 0.4 && ship.destSystem}>
                <line
                  x1={0}
                  y1={0}
                  x2={ship.destSystem.x - ship.x}
                  y2={ship.destSystem.y - ship.y}
                  stroke="rgba(59, 130, 246, 0.2)"
                  stroke-width="1"
                  stroke-dasharray="4,4"
                />
              </Show>
            </g>
          )}
        </For>

        {/* Ripples Layer */}
        <For each={props.ripples}>
          {(ripple) => {
            const sys = props.data.systems.find(s => s.id === ripple.systemId);
            if (!sys) return null;
            return (
              <circle
                cx={sys.x}
                cy={sys.y}
                r={sys.size}
                class="ripple-animation"
              />
            );
          }}
        </For>

        {/* Star Systems */}
        <For each={props.data.systems}>
          {(sys) => {
            const isSelected = () => props.selectedSystemId === sys.id;
            const isHome = () => props.homeSystemId === sys.id;
            const isOwned = () => sys.owner === 'Player';
            // LOD class based on zoom level - only apply optimizations when zoomed OUT
            const lodClass = () => {
              if (props.zoomLevel < 0.2) return 'lod-ultra-low';
              if (props.zoomLevel < 0.4) return 'lod-low';
              return ''; // No LOD class when zoomed in - keep original quality
            };
            return (
              <g
                id={`system-${sys.id}`}
                transform={`translate(${sys.x}, ${sys.y})`}
                onClick={(e) => handleSystemClick(e, sys)}
                class="group cursor-pointer"
              >
                {/* Ownership indicator ring */}
                <Show when={isOwned() && !isHome()}>
                  <circle
                    r={sys.size + 15}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    stroke-width={1}
                    class="opacity-50"
                  />
                </Show>

                {/* Home System Ring - Dotted circle for home system */}
                <Show when={isHome()}>
                  <circle
                    r={sys.size + 20}
                    fill="none"
                    stroke="white"
                    stroke-width={2}
                    stroke-dasharray="8,4"
                    class="opacity-70 home-ring"
                  />
                </Show>

                {/* Selection Ring */}
                <circle
                  r={sys.size + 12}
                  fill="none"
                  stroke={isSelected() ? 'white' : 'transparent'}
                  stroke-width={1.5}
                  class="opacity-60"
                />

                {/* The Star */}
                <circle
                  id={`star-${sys.id}`}
                  r={sys.size}
                  fill={sys.color}
                  class={`star ${lodClass()} ${isSelected() ? 'selected-glow' : ''}`}
                />

                {/* Hover Ring - shown on hover */}
                <circle
                  r={sys.size + 6}
                  fill="none"
                  stroke="white"
                  stroke-width="1"
                  class="opacity-0 group-hover:opacity-40 pointer-events-none"
                />

                {/* Hover Label - Only show when zoomed in */}
                <Show when={props.zoomLevel >= 0.4}>
                  <text
                    y={-sys.size - 15}
                    text-anchor="middle"
                    fill="white"
                    font-size="14"
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none tracking-widest font-mono font-bold drop-shadow-lg"
                  >
                    {sys.name}
                  </text>
                </Show>
              </g>
            );
          }}
        </For>
      </g>
    </svg>
  );
};
