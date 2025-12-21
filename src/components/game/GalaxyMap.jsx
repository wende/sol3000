import { createEffect, Show, For, createMemo, createSignal, onCleanup } from 'solid-js';
import * as d3 from 'd3';
import { MAP_WIDTH, MAP_HEIGHT, CENTER_X, CENTER_Y } from '../../utils/galaxy';
import { FTLTethers } from './FTLTethers';
import { FTLRoute } from './FTLRoute';
import { StarSystem } from './StarSystem';
import { useZoomableSvg } from '../../hooks/useZoomableSvg';
import { BUILDINGS } from '../../utils/gameState/buildings';

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
 * @property {'galaxy'|'system'} viewState - Current view mode to react to transitions
 * @property {number|null} viewSystemId - ID of the system currently shown in System View
 */

/**
 * The Galaxy Map component utilizing D3 for rendering the star systems and routes.
 *
 * @param {GalaxyMapProps} props
 */
export const GalaxyMap = (props) => {
  let hasZoomedToHome = false;
  let homeZoomTimeoutId = null;
  let lastZoomUpdate = 0;
  const ZOOM_UPDATE_INTERVAL = 50; // ms - debounce zoom level updates
  const [transitioningId, setTransitioningId] = createSignal(null);
  const [isAnimatingZoom, setIsAnimatingZoom] = createSignal(false); // Flag to skip zoom level updates during animated transitions
  const [isExitingSystemView, setIsExitingSystemView] = createSignal(false); // Flag to force low LOD during exit
  let lastViewState = 'galaxy';
  let lastFocusedSystem = null;
  const BASE_MANUAL_MIN_SCALE = 0.1; // Values lifted from main branch
  const BASE_MANUAL_MAX_SCALE = 3.0;
  const MANUAL_MIN_SCALE = BASE_MANUAL_MIN_SCALE;
  const MANUAL_MAX_SCALE = BASE_MANUAL_MAX_SCALE * 1.5; // Allow players to zoom 1.5x further in
  const SYSTEM_VIEW_SCALE = 10; // Keep cinematic zoom depth from original build
  const RETURN_VIEW_SCALE = MANUAL_MAX_SCALE; // Pull back to manual max after exiting system view
  const FULL_GALAXY_SCALE = 0.45;

  const {
    setSvgRef,
    setGroupRef,
    getSvgSelection,
    getZoomBehavior,
  } = useZoomableSvg({
    minScale: MANUAL_MIN_SCALE,
    maxScale: MANUAL_MAX_SCALE,
    translateExtent: [[-1000, -1000], [MAP_WIDTH + 1000, MAP_HEIGHT + 1000]],
    clickDistance: 5,
    onZoom: (event) => {
      if (isAnimatingZoom()) return;
      const now = Date.now();
      if (now - lastZoomUpdate > ZOOM_UPDATE_INTERVAL) {
        props.setZoomLevel(event.transform.k);
        lastZoomUpdate = now;
      }
    },
    onInitialize: ({ svg, zoomBehavior }) => {
      if (!svg || !zoomBehavior) return;
      props.setZoomLevel(FULL_GALAXY_SCALE);
      const translateX = (window.innerWidth / 2) - (CENTER_X * FULL_GALAXY_SCALE);
      const translateY = (window.innerHeight / 2) - (CENTER_Y * FULL_GALAXY_SCALE);
      svg.call(
        zoomBehavior.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(FULL_GALAXY_SCALE)
      );
    },
  });


  // Cleanup D3 event handlers on unmount
  onCleanup(() => {
    if (homeZoomTimeoutId) {
      clearTimeout(homeZoomTimeoutId); // Clear zoom-to-home timeout
    }
  });

  // Function to center and zoom on a system
  const centerOnSystem = (sys, duration = 1000, targetScale = SYSTEM_VIEW_SCALE) => {
    const svg = getSvgSelection();
    const zoom = getZoomBehavior();
    if (!svg || !zoom) return;

    svg.interrupt();

    // Block zoom level updates during animation to prevent reactive state changes
    setIsAnimatingZoom(true);

    // Calculate center of viewport
    // Align with System View: Sidebar is 1/3 width, Star is at 240px + 48px padding
    const targetX = (window.innerWidth / 3) + 288;
    const targetY = window.innerHeight / 2;

    // Create transform: translate to target center, scale, then translate system to origin
    const transform = d3.zoomIdentity
      .translate(targetX, targetY)
      .scale(targetScale)
      .translate(-sys.x, -sys.y);

    return svg.transition()
      .duration(duration)
      .ease(d3.easeExpInOut) // Smooth acceleration/deceleration
      .call(zoom.transform, transform)
      .on('end.zoomLevel', () => {
        setIsAnimatingZoom(false);
        // Don't update zoom level here - the view will transition to SystemView
        // and updating would cause unnecessary LOD re-renders that flicker
      })
      .on('interrupt.zoomLevel', () => {
        setIsAnimatingZoom(false);
      });
  };

  // Reset view to show full galaxy (zoomed out)
  const resetToFullGalaxy = (targetScale = FULL_GALAXY_SCALE, duration = 500) => {
    const svg = getSvgSelection();
    const zoom = getZoomBehavior();
    if (!svg || !zoom) return;

    setTransitioningId(null);

    svg.interrupt();

    // Skip zoom level updates during the animation to prevent flicker
    setIsAnimatingZoom(true);

    const translateX = (window.innerWidth / 2) - (CENTER_X * targetScale);
    const translateY = (window.innerHeight / 2) - (CENTER_Y * targetScale);

    return svg.transition()
      .duration(duration)
      .ease(d3.easeCubicInOut)
      .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(targetScale))
      .on('end.zoomLevel', () => {
        setIsAnimatingZoom(false);
        props.setZoomLevel(targetScale);
      })
      .on('interrupt.zoomLevel', () => {
        setIsAnimatingZoom(false);
      });
  };

  // Track the system currently shown in System View so we can pan back to it on exit
  createEffect(() => {
    const viewId = props.viewSystemId;
    if (!viewId) return;
    const system = props.data.systems.find(s => s.id === viewId);
    if (system) {
      lastFocusedSystem = system;
    }
  });

  // Auto-zoom to home system when it's first selected
  createEffect(() => {
    const homeId = props.homeSystemId;
    // Note: homeSystemId can be 0 (Sol has id 0), so we check for null/undefined explicitly
    const hasHome = homeId !== null && homeId !== undefined;

    // Reset view when home is cleared (new game started)
    if (!hasHome) {
      hasZoomedToHome = false;
      if (homeZoomTimeoutId) {
        clearTimeout(homeZoomTimeoutId);
        homeZoomTimeoutId = null;
      }
      resetToFullGalaxy();
      return;
    }

    // Zoom to home system once it's set
    if (hasHome && !hasZoomedToHome && props.data.systems.length > 0) {
      const homeSystem = props.data.systems.find(s => s.id === homeId);
      if (homeSystem) {
        // Small delay to ensure DOM is ready
        homeZoomTimeoutId = setTimeout(() => {
          // Skip zoom level updates during the animation to prevent flicker
          setIsAnimatingZoom(true);

          // Use simpler zoom for initial home focus
          const svg = getSvgSelection();
          const zoom = getZoomBehavior();
          if (!svg || !zoom) {
            setIsAnimatingZoom(false);
            return;
          }
          const targetScale = 1.5;
          const transform = d3.zoomIdentity
            .translate(window.innerWidth / 2, window.innerHeight / 2)
            .scale(targetScale)
            .translate(-homeSystem.x, -homeSystem.y);

          svg.transition()
            .duration(1200)
            .call(zoom.transform, transform)
            .on('end.zoomLevel', () => {
              setIsAnimatingZoom(false);
              props.setZoomLevel(targetScale);
            })
            .on('interrupt.zoomLevel', () => {
              setIsAnimatingZoom(false);
            });

          hasZoomedToHome = true;
          homeZoomTimeoutId = null;
        }, 100);
      }
    }
  });

  // When leaving system view, animate back to the full galaxy framing
  createEffect(() => {
    const currentView = props.viewState || 'galaxy';
    const zoom = getZoomBehavior();
    if (!zoom) {
      lastViewState = currentView;
      return;
    }

    if (currentView === 'system') {
      // Keep the current zoom transform valid while System View is active.
      zoom.scaleExtent([MANUAL_MIN_SCALE, SYSTEM_VIEW_SCALE]);
    }

    if (lastViewState === 'system' && currentView === 'galaxy') {
      // Force low LOD during exit animation to prevent flicker from heavy star rendering
      setIsExitingSystemView(true);

      // Start the return animation from the full cinematic zoom-out.
      zoom.scaleExtent([MANUAL_MIN_SCALE, SYSTEM_VIEW_SCALE]);

      const targetSystem = lastFocusedSystem || props.data.systems.find(s => s.id === props.viewSystemId);
      const transition = targetSystem
        ? centerOnSystem(targetSystem, 750, RETURN_VIEW_SCALE)
        : resetToFullGalaxy(RETURN_VIEW_SCALE, 750);

      if (transition) {
        transition
          .on('end.manualZoomLimits', () => {
            zoom.scaleExtent([MANUAL_MIN_SCALE, MANUAL_MAX_SCALE]);
            setIsExitingSystemView(false);
          })
          .on('interrupt.manualZoomLimits', () => {
            zoom.scaleExtent([MANUAL_MIN_SCALE, MANUAL_MAX_SCALE]);
            setIsExitingSystemView(false);
          });
      } else {
        zoom.scaleExtent([MANUAL_MIN_SCALE, MANUAL_MAX_SCALE]);
        setIsExitingSystemView(false);
      }
    }

    lastViewState = currentView;
  });

  // Handle system click with double-click detection
  const handleSystemClick = (e, sys) => {
    e.stopPropagation();
    props.onSystemSelect(sys.id);
  };

  const handleSystemDoubleClick = (e, sys) => {
    e.stopPropagation();

    // Allow the cinematic zoom to exceed the manual zoom limit.
    const zoom = getZoomBehavior();
    zoom?.scaleExtent([MANUAL_MIN_SCALE, SYSTEM_VIEW_SCALE]);

    setTransitioningId(sys.id);
    lastFocusedSystem = sys;
    centerOnSystem(sys);

    if (props.onSystemDoubleSelect) {
      setTimeout(() => {
        props.onSystemDoubleSelect(sys.id);
      }, 1000);

      setTimeout(() => {
        setTransitioningId(null);
      }, 1500);
    }
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
    if (props.shouldShowAllSystems) {
      return props.data.systems;
    }
    return props.data.systems.filter(s => props.isSystemVisible(s.id));
  });

  // Filter routes to only show connections between visible systems
  // Show ALL routes when no home is set (cinematic intro) or during fog transition
  const visibleRoutesFiltered = createMemo(() => {
    if (props.shouldShowAllSystems) {
      return props.data.routes;
    }
    return props.data.routes.filter(r => props.isRouteVisible(r));
  });

  // Check if a system is newly revealed (for fade-in animation)
  const isNewlyRevealed = (systemId) => {
    return props.newlyRevealedIds?.has(systemId) || false;
  };

  // Check if a route is newly revealed (at least one endpoint is newly revealed)
  const isRouteNewlyRevealed = (route) => {
    return isNewlyRevealed(route.source.id) || isNewlyRevealed(route.target.id);
  };

  // Create a memo for quick system lookup by ID (ensures fresh data)
  const systemMap = createMemo(() =>
    new Map(props.data.systems.map(s => [s.id, s]))
  );

  // Supply comes from oreMine buildings for Player-owned systems
  const hasMetalsSupply = (system) => {
    if (system?.owner !== 'Player') return false;
    const oreMineLevel = system.buildings?.oreMine?.level || 0;
    return oreMineLevel > 0;
  };
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
          const sourceOreMine = route.source.buildings?.oreMine?.level || 0;
          const sourceSupply = route.source.owner === 'Player' ? sourceOreMine * BUILDINGS.oreMine.supplyPerLevel : 0;
          const sourceDemand = route.source.market?.metals?.demand || 0;
          const targetOreMine = route.target.buildings?.oreMine?.level || 0;
          const targetSupply = route.target.owner === 'Player' ? targetOreMine * BUILDINGS.oreMine.supplyPerLevel : 0;
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
      ref={setSvgRef}
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

        {/* Star Glow Filter (map-scale version for cinematic zoom) */}
        <filter id="star-glow-map" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g ref={setGroupRef} class="gpu-accelerated">
        {/* FTL Lines - Hidden when zoomed out for performance */}
        <Show when={props.zoomLevel >= 0.25}>
          <For each={visibleRoutesFiltered()}>
            {(route) => {
              // Use the route's existing ID (which is sorted: smaller-id-first)
              const routeId = route.id;

              // Look up fresh system data (route.source/target may be stale)
              const sourceSystem = systemMap().get(route.source.id);
              const targetSystem = systemMap().get(route.target.id);

              const connectsMetalsSupplyDemand =
                (hasMetalsSupply(sourceSystem) && hasMetalsDemand(targetSystem)) ||
                (hasMetalsDemand(sourceSystem) && hasMetalsSupply(targetSystem));
              const tradeReverse = hasMetalsDemand(sourceSystem) && hasMetalsSupply(targetSystem);

              // Determine demand system ID for satisfaction lookup
              const demandSystemId = tradeReverse ? sourceSystem.id : targetSystem.id;

              // Check if route is visible in the current fog of war state (ignoring transition)
              const isNaturallyVisible = props.visibleSystems?.visibleIds?.has(route.source.id) &&
                                       props.visibleSystems?.visibleIds?.has(route.target.id);

              return (
                <FTLRoute
                  route={route}
                  routeId={routeId}
                  isVisible={props.isRouteVisible(route)}
                  shouldFade={props.fogTransitioning && !isNaturallyVisible}
                  shouldFadeIn={isRouteNewlyRevealed(route)}
                  isSelected={props.selectedTetherId === routeId}
                  builtFTLs={props.builtFTLs}
                  ftlConstruction={props.ftlConstruction}
                  connectsMetalsSupplyDemand={connectsMetalsSupplyDemand}
                  tradeReverse={tradeReverse}
                  onSelect={props.onTetherSelect}
                  throughput={props.tradeFlows?.routeThroughput?.get(routeId)}
                  tradeFlows={props.tradeFlows}
                  demandSystemId={demandSystemId}
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
              isTransitioning={transitioningId() === sys.id}
              shouldFade={props.fogTransitioning && !props.visibleSystems?.visibleIds?.has(sys.id)}
              shouldFadeIn={isNewlyRevealed(sys.id)}
              zoomLevel={props.zoomLevel}
              forceLowLOD={isExitingSystemView()}
              onClick={(e) => handleSystemClick(e, sys)}
              onDoubleClick={(e) => handleSystemDoubleClick(e, sys)}
              satisfaction={props.tradeFlows?.systemSatisfaction?.get(sys.id)}
              scanningSystem={props.scanningSystem}
            />
          )}
        </For>
      </g>
    </svg>
  );
};
