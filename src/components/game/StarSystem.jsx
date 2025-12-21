import { Show, createMemo, createSignal, createEffect, onCleanup } from 'solid-js';
import { Star } from './Star';
import { MarketBadge } from './MarketBadge';
import { SystemProgressRing } from './SystemProgressRing';
import { BUILDINGS } from '../../utils/gameState/buildings';

/**
 * @typedef {Object} StarSystemProps
 * @property {Object} system - The star system data
 * @property {number} system.id - System ID
 * @property {string} system.name - System name
 * @property {number} system.x - X position
 * @property {number} system.y - Y position
 * @property {number} system.size - Star radius
 * @property {string} system.spectralClass - Spectral class (O, B, A, F, G, K, M)
 * @property {string} system.owner - System owner
 * @property {boolean} isSelected - Whether this system is selected
 * @property {boolean} isHome - Whether this is the home system
 * @property {boolean} isTransitioning - Whether this system is currently being zoomed into
 * @property {boolean} shouldFade - Whether the system should fade out (fog of war transition)
 * @property {boolean} shouldFadeIn - Whether the system should fade in (newly revealed)
 * @property {number} zoomLevel - Current zoom level for LOD
 * @property {boolean} [forceLowLOD] - Force low LOD during exit animation to prevent flicker
 * @property {Function} onClick - Click handler
 * @property {Function} onDoubleClick - Double-click handler
 * @property {Object} [satisfaction] - Trade flow satisfaction data { type, ratio, used/satisfied, total }
 * @property {Object|null} [scanningSystem] - Scanning state { systemId, startTime, duration }
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
  // Supply comes from oreMine buildings for Player-owned systems
  const oreMineLevel = () => props.system.buildings?.oreMine?.level || 0;
  const metalsSupply = () => isOwned() ? oreMineLevel() * BUILDINGS.oreMine.supplyPerLevel : 0;
  const hasMetalsSupply = () => metalsSupply() > 0;
  const hasMetalsDemand = () => (metals()?.demand || 0) > 0;

  // Simple LOD class based on zoom level (only applies when zoomed out)
  // Force low LOD during exit animation to prevent flicker from heavy star rendering
  const lodClass = () => {
    if (props.forceLowLOD) return 'lod-low';
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

  // Check if this system is being scanned
  const isBeingScanned = () => {
    return props.scanningSystem?.systemId === props.system.id;
  };

  // Calculate scan progress (0-100) - updates every 100ms while scanning
  const [scanProgress, setScanProgress] = createSignal(0);

  createEffect(() => {
    const scan = props.scanningSystem;
    if (!scan || scan.systemId !== props.system.id) {
      setScanProgress(0);
      return;
    }

    // Update progress immediately
    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - scan.startTime;
      const progress = Math.min(100, (elapsed / scan.duration) * 100);
      setScanProgress(progress);
    };

    updateProgress();

    // Set up interval to update progress
    const intervalId = setInterval(updateProgress, 100);

    // Cleanup interval when effect re-runs or component unmounts
    onCleanup(() => clearInterval(intervalId));
  });

  return (
    <g
      id={`system-${props.system.id}`}
      transform={`translate(${props.system.x}, ${props.system.y})`}
      onClick={props.onClick}
      onDblClick={props.onDoubleClick}
      class={`group cursor-pointer ${props.shouldFadeIn ? 'fog-fade-in' : ''}`}
      style={getOpacityStyle()}
    >
      <title>
        {props.system.name}
        {hasMetalsSupply() ? `\nMetals Supply: ${metalsSupply()}` : ''}
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
        <SystemProgressRing radius={props.system.size + 15} />
      </Show>

      {/* Scan progress ring (brighter while scanning) */}
      <Show when={!props.isHome && isBeingScanned() && !isOwned()}>
        <SystemProgressRing
          radius={props.system.size + 15}
          progress={scanProgress()}
          stroke="rgba(255, 255, 255, 0.9)"
          opacity={0.95}
          strokeWidth={1.5}
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

      {/* The Star - visual component (derives color from spectralClass) */}
      <Star
        id={props.system.id}
        size={props.system.size}
        spectralClass={props.system.spectralClass}
        isSelected={props.isSelected}
        lodClass={lodClass()}
        isTransitioning={props.isTransitioning}
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
          class={`transition-opacity duration-200 pointer-events-none tracking-widest font-mono font-bold drop-shadow-lg ${props.isTransitioning ? '' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ opacity: props.isTransitioning ? 1 : undefined }}
        >
          {props.system.name}
        </text>
      </Show>

      {/* Market Marker - Only show when zoomed in */}
      <Show when={props.zoomLevel >= 0.4 && (hasMetalsSupply() || hasMetalsDemand())}>
        <MarketBadge
          type={hasMetalsSupply() ? 'supply' : 'demand'}
          y={props.system.size + 10}
          satisfaction={props.satisfaction}
          isTransitioning={props.isTransitioning}
        />
      </Show>

    </g>
  );
};
