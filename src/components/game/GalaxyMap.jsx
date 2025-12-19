import { onMount, createEffect, Show, For, createMemo, onCleanup } from 'solid-js';
import * as d3 from 'd3';
import { MAP_WIDTH, MAP_HEIGHT, CENTER_X, CENTER_Y } from '../../utils/galaxy';
import { FTLTethers } from './FTLTethers';
import { FTLRoute } from './FTLRoute';
import { StarSystem } from './StarSystem';

/**
 * @typedef {Object} GalaxyMapProps
 * @property {Object} data - The galaxy data
 * @property {Array} data.systems - Array of star systems
 * @property {Array} data.routes - Array of routes
 * @property {Function} onSystemSelect - Callback when a system is selected
 * @property {Function} onTetherSelect - Callback when a tether/route is selected
 * @property {Function} onBackgroundClick - Callback when clicking on empty space
 * @property {number|null} selectedSystemId - ID of the currently selected system
 * @property {string|null} selectedTetherId - ID of the currently selected tether
 * @property {Set} builtFTLs - Set of tether IDs that have been upgraded to FTL
 * @property {number|null} homeSystemId - ID of the home system
 * @property {Array} ripples - Array of ripple effects
 * @property {number} zoomLevel - Current zoom level
 * @property {Function} setZoomLevel - Setter for zoom level
 * @property {Array} ships - Array of ships (docked and in transit)
 * @property {Object} visibleSystems - Fog of war visibility data { visibleIds, farthestSystem }
 * @property {Set} newlyRevealedIds - Set of system IDs that just became visible (for fade-in)
 * @property {Object} tradeFlows - Trade flow data { systemSatisfaction, routeThroughput }
 * @property {Object|null} scanningSystem - Scanning state { systemId, startTime, duration }
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
  let activeTransition = null;
  let homeZoomTimeoutId = null;
  let lastZoomUpdate = 0;
  const ZOOM_UPDATE_INTERVAL = 50; // ms - debounce zoom level updates

  // Initialize Zoom
  onMount(() => {
    if (!svgRef || !gRef) return;

    zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 3.0])
      .translateExtent([[-1000, -1000], [MAP_WIDTH + 1000, MAP_HEIGHT + 1000]])
      .clickDistance(5) // Allow up to 5px movement and still register as click
      .on('zoom', (e) => {
        d3.select(gRef).attr('transform', e.transform);
        // Debounce zoom level updates for LOD to reduce re-renders
        const now = Date.now();
        if (now - lastZoomUpdate > ZOOM_UPDATE_INTERVAL) {
          props.setZoomLevel(e.transform.k);
          lastZoomUpdate = now;
        }
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

  // Cleanup D3 event handlers on unmount
  onCleanup(() => {
    if (svgRef && zoomBehavior) {
      d3.select(svgRef).on('.zoom', null); // Remove all D3 zoom event handlers
    }
    if (activeTransition) {
      activeTransition.interrupt(); // Stop any active transitions
    }
    if (homeZoomTimeoutId) {
      clearTimeout(homeZoomTimeoutId); // Clear zoom-to-home timeout
    }
  });

  // Function to center and zoom on a system
  const centerOnSystem = (sys, duration = 750) => {
    if (!svgRef || !zoomBehavior) return;

    // Interrupt any active transition
    if (activeTransition) {
      activeTransition.interrupt();
    }

    const svg = d3.select(svgRef);
    const targetScale = 8.0; // Zoom in aggressively for transition

    // Calculate center of viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Create transform: translate to center, scale, then translate system to origin
    const transform = d3.zoomIdentity
      .translate(centerX, centerY)
      .scale(targetScale)
      .translate(-sys.x, -sys.y);

    activeTransition = svg.transition()
      .duration(duration)
      .call(zoomBehavior.transform, transform);
  };

  // Reset view to show full galaxy (zoomed out)
  const resetToFullGalaxy = () => {
    if (!svgRef || !zoomBehavior) return;

    const svg = d3.select(svgRef);
    const initialScale = 0.45;

    const translateX = (window.innerWidth / 2) - (CENTER_X * initialScale);
    const translateY = (window.innerHeight / 2) - (CENTER_Y * initialScale);

    svg.transition()
      .duration(500)
      .call(zoomBehavior.transform, d3.zoomIdentity.translate(translateX, translateY).scale(initialScale));
  };

  // Auto-zoom to home system when it's first selected
  createEffect(() => {
    const homeId = props.homeSystemId;

    // Reset view when home is cleared (new game started)
    if (!homeId) {
      hasZoomedToHome = false;
      if (homeZoomTimeoutId) {
        clearTimeout(homeZoomTimeoutId);
        homeZoomTimeoutId = null;
      }
      resetToFullGalaxy();
      return;
    }

    // Zoom to home system once it's set
    if (homeId && !hasZoomedToHome && props.data.systems.length > 0) {
      const homeSystem = props.data.systems.find(s => s.id === homeId);
      if (homeSystem && svgRef && zoomBehavior) {
        // Small delay to ensure DOM is ready
        homeZoomTimeoutId = setTimeout(() => {
          centerOnSystem(homeSystem, 1200);
          hasZoomedToHome = true;
          homeZoomTimeoutId = null;
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
      centerOnSystem(sys, 1200);

      // Transition to System View after zoom
      if (props.onSystemDoubleSelect) {
        setTimeout(() => {
           props.onSystemDoubleSelect(sys.id);
        }, 1200);
      }
    }

    // Always select the system
    props.onSystemSelect(sys.id);

    lastClickTime = now;
    lastClickId = sys.id;
  };

  // Handle background click to deselect
  const handleBackgroundClick = (e) => {
    // Since systems and tethers call stopPropagation, any click that reaches here
    // is a click on empty space
    if (props.onBackgroundClick) {
      props.onBackgroundClick();
    }
  };

  // Filter systems based on fog of war visibility
  // Show ALL systems when no home is set (cinematic intro) or during fog transition
  const visibleSystemsFiltered = createMemo(() => {
    const visibility = props.visibleSystems;
    // Show all systems if no fog of war data OR no home system yet (intro) OR transitioning
    if (!visibility?.visibleIds || visibility.visibleIds.size === 0 || !props.homeSystemId || props.fogTransitioning) {
      return props.data.systems;
    }
    return props.data.systems.filter(s => visibility.visibleIds.has(s.id));
  });

  // Check if a system is within fog of war visibility
  const isSystemVisible = (systemId) => {
    const visibility = props.visibleSystems;
    if (!visibility?.visibleIds || visibility.visibleIds.size === 0) return true;
    return visibility.visibleIds.has(systemId);
  };

  // Filter routes to only show connections between visible systems
  // Show ALL routes when no home is set (cinematic intro) or during fog transition
  const visibleRoutesFiltered = createMemo(() => {
    const visibility = props.visibleSystems;
    // Show all routes if no fog of war data OR no home system yet (intro) OR transitioning
    if (!visibility?.visibleIds || visibility.visibleIds.size === 0 || !props.homeSystemId || props.fogTransitioning) {
      return props.data.routes;
    }
    return props.data.routes.filter(r =>
      visibility.visibleIds.has(r.source.id) && visibility.visibleIds.has(r.target.id)
    );
  });

  // Check if a route is within fog of war visibility
  const isRouteVisible = (route) => {
    const visibility = props.visibleSystems;
    if (!visibility?.visibleIds || visibility.visibleIds.size === 0) return true;
    return visibility.visibleIds.has(route.source.id) && visibility.visibleIds.has(route.target.id);
  };

  // Check if a system is newly revealed (for fade-in animation)
  const isNewlyRevealed = (systemId) => {
    return props.newlyRevealedIds?.has(systemId) || false;
  };

  // Check if a route is newly revealed (at least one endpoint is newly revealed)
  const isRouteNewlyRevealed = (route) => {
    return isNewlyRevealed(route.source.id) || isNewlyRevealed(route.target.id);
  };

  const hasMetalsSupply = (system) => (system?.market?.metals?.supply || 0) > 0;
  const hasMetalsDemand = (system) => (system?.market?.metals?.demand || 0) > 0;

  // Debug: Log route states when they change
  createEffect(() => {
    const galaxy = props.data;
    const builtFTLSet = props.builtFTLs;

    if (galaxy.routes.length > 0 && builtFTLSet?.size > 0) {
      const allBuiltRoutes = galaxy.routes.filter(route => {
        return builtFTLSet.has(route.id);
      });

      const tradeRoutes = allBuiltRoutes.filter(route => {
        const connectsMetalsSupplyDemand =
          (hasMetalsSupply(route.source) && hasMetalsDemand(route.target)) ||
          (hasMetalsDemand(route.source) && hasMetalsSupply(route.target));
        return connectsMetalsSupplyDemand;
      });

      const regularBuiltRoutes = allBuiltRoutes.length - tradeRoutes.length;

      console.log(`📊 Built FTL Routes: ${allBuiltRoutes.length} total (${tradeRoutes.length} trade, ${regularBuiltRoutes} regular)`);

      if (regularBuiltRoutes > 0) {
        console.log(`⚪ Regular built routes (should be SOLID):`);
        allBuiltRoutes.filter(r => !tradeRoutes.includes(r)).forEach(route => {
          console.log(`  ${route.id}: ${route.source.name} ↔ ${route.target.name}`);
        });
      }

      if (tradeRoutes.length > 0) {
        console.log(`🔵 Trade routes (should have ANIMATED flow):`);
        tradeRoutes.forEach(route => {
          const sourceSupply = route.source.market?.metals?.supply || 0;
          const sourceDemand = route.source.market?.metals?.demand || 0;
          const targetSupply = route.target.market?.metals?.supply || 0;
          const targetDemand = route.target.market?.metals?.demand || 0;
          console.log(`  ${route.id}: ${route.source.name} (S:${sourceSupply} D:${sourceDemand}) ↔ ${route.target.name} (S:${targetSupply} D:${targetDemand})`);
        });
      }
    }
  });

  // Get tether routes from 2-hop systems to unseen 3-hop systems
  const tetherRoutes = createMemo(() => {
    const visibility = props.visibleSystems;
    return visibility?.tetherRoutes || [];
  });

  // Calculate ship positions for transit ships
  const transitShips = createMemo(() => {
    const ships = props.ships || [];
    const visibility = props.visibleSystems;
    return ships.filter(s => s.status === 'transit').filter(ship => {
      // Only show ships if destination is visible
      return visibility?.visibleIds?.has(ship.destinationId);
    }).map(ship => {
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
      onClick={handleBackgroundClick}
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
          <For each={visibleRoutesFiltered()}>
            {(route) => {
              // Use the route's existing ID (which is sorted: smaller-id-first)
              const routeId = route.id;

              const connectsMetalsSupplyDemand =
                (hasMetalsSupply(route.source) && hasMetalsDemand(route.target)) ||
                (hasMetalsDemand(route.source) && hasMetalsSupply(route.target));
              const tradeReverse = hasMetalsDemand(route.source) && hasMetalsSupply(route.target);

              return (
                <FTLRoute
                  route={route}
                  routeId={routeId}
                  isVisible={isRouteVisible(route)}
                  shouldFade={props.fogTransitioning && !isRouteVisible(route)}
                  shouldFadeIn={isRouteNewlyRevealed(route)}
                  isSelected={props.selectedTetherId === routeId}
                  builtFTLs={props.builtFTLs}
                  connectsMetalsSupplyDemand={connectsMetalsSupplyDemand}
                  tradeReverse={tradeReverse}
                  onSelect={props.onTetherSelect}
                  throughput={props.tradeFlows?.routeThroughput?.get(routeId)}
                />
              );
            }}
          </For>
        </Show>

        {/* Tether Lines - Shows connections from 2-hop systems to unseen 3-hop systems */}
        <FTLTethers routes={tetherRoutes()} />

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

        {/* Ripples Layer - Only show ripples for visible systems */}
        <For each={props.ripples}>
          {(ripple) => {
            const sys = props.data.systems.find(s => s.id === ripple.systemId);
            if (!sys || !props.visibleSystems?.visibleIds?.has(sys.id)) return null;
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
        <For each={visibleSystemsFiltered()}>
          {(sys) => (
            <StarSystem
              system={sys}
              isSelected={props.selectedSystemId === sys.id}
              isHome={props.homeSystemId === sys.id}
              shouldFade={props.fogTransitioning && !isSystemVisible(sys.id)}
              shouldFadeIn={isNewlyRevealed(sys.id)}
              zoomLevel={props.zoomLevel}
              onClick={(e) => handleSystemClick(e, sys)}
              satisfaction={props.tradeFlows?.systemSatisfaction?.get(sys.id)}
              scanningSystem={props.scanningSystem}
            />
          )}
        </For>
      </g>
    </svg>
  );
};
