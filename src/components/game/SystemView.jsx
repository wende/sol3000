import { createSignal, createEffect, onCleanup, createMemo, Show } from 'solid-js';
import { Button } from '../common/Button';
import { GlassPanel } from '../common/GlassPanel';
import { getStarColor } from './Star';
import { SystemProgressRing } from './SystemProgressRing';
import { SPECTRAL_CLASSES } from '../../utils/galaxy';
import { BuildingList } from './BuildingList';
import { PlanetConstruct, PlanetConstructSVG, mapPlanetTypeToConstruct } from '../common/PlanetConstruct';
import { BUILDINGS } from '../../utils/gameState/buildings';

/**
 * System View Component
 * Symbolic view of a star system with a stack of planets.
 */
export const SystemView = (props) => {
  // Get current system data
  const system = () => props.system;

  const [windowWidth, setWindowWidth] = createSignal(window.innerWidth);
  const [canScrollRight, setCanScrollRight] = createSignal(false);
  let planetListRef;

  createEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    onCleanup(() => window.removeEventListener('resize', handleResize));
  });

  const checkScrollRight = () => {
    if (planetListRef) {
      const { scrollLeft, scrollWidth, clientWidth } = planetListRef;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  createEffect(() => {
    // Re-check when system changes
    system();
    // Defer to ensure DOM is ready
    setTimeout(checkScrollRight, 100);
  });

  const spacing = createMemo(() => {
    const s = system();
    if (!s) return 72;

    const count = s.planets.length;
    if (count <= 1) return 72;

    // Reduced spacing by 20% from previous values for tighter orbits
    // We prioritize legibility over fitting since we have horizontal scrolling.
    const availableWidth = windowWidth() * 0.8;
    const starRadius = s.size * 10;
    const startOffset = 240 + starRadius + 120; // CenterX + Star + First Gap (increased)

    const availableForSpacing = availableWidth - startOffset;
    const calculatedSpacing = availableForSpacing / (count - 1);

    // Reduced max from 180 to 144, min from 90 to 72 (20% reduction)
    return Math.min(144, Math.max(72, calculatedSpacing));
  });
  
  if (!system()) return null;

  const spectralData = SPECTRAL_CLASSES[system().spectralClass];
  const starColor = () => getStarColor(system().spectralClass, system().id, system().size);
  const starGlowStyle = () => ({
    '--star-color': starColor(),
    '--transition-glow-outer': '60px',
    '--transition-glow-inner': '15px'
  });

  return (
    <div class="w-full h-full bg-black flex overflow-hidden">
      
      {/* Left Sidebar: UI & Info */}
      <GlassPanel variant="sidebar" class="w-1/3 flex-shrink-0 flex flex-col relative z-20 slide-in-left">
        <div class="p-8 space-y-8 overflow-y-auto h-full custom-scrollbar">

          {/* Header */}
          <div>
             <h1 class="text-3xl font-light text-white tracking-[0.2em] uppercase leading-tight">{system().name}</h1>
             <div class="flex flex-wrap gap-2 mt-4 text-xs text-gray-400 font-mono uppercase tracking-wider">
                <span class="px-2 py-1 rounded bg-white/5">{spectralData.label} Class</span>
                <span class="px-2 py-1 rounded bg-white/5">{system().planetCount} Planets</span>
             </div>
          </div>

          {/* Building Management - Player owned systems */}
          <Show when={system().owner === 'Player' && props.gameState}>
            <BuildingList system={system()} gameState={props.gameState} />
          </Show>

          {/* Description Panel - Non-player systems */}
          <Show when={system().owner !== 'Player' || !props.gameState}>
            <GlassPanel class="p-6">
               <h3 class="text-xs text-gray-500 tracking-widest mb-3">SYSTEM ANALYSIS</h3>
               <p class="text-sm text-gray-300 leading-relaxed mb-6">
                  {system().description}
               </p>

               <div class="grid grid-cols-2 gap-4 pt-4">
                  <div>
                     <div class="text-[10px] text-gray-500 tracking-widest mb-1">RESOURCES</div>
                     <div class="text-sm text-white font-mono">{system().resources}</div>
                  </div>
                  <div>
                     <div class="text-[10px] text-gray-500 tracking-widest mb-1">POPULATION</div>
                     <div class="text-sm text-white font-mono">{system().population}</div>
                  </div>
                  <div>
                     <div class="text-[10px] text-gray-500 tracking-widest mb-1">OWNER</div>
                     <div class={`text-sm font-mono ${system().owner === 'Player' ? 'text-blue-400' : system().owner === 'Enemy' ? 'text-red-400' : 'text-gray-400'}`}>
                        {system().owner}
                     </div>
                  </div>
                  <div>
                     <div class="text-[10px] text-gray-500 tracking-widest mb-1">METALS</div>
                     <div class="text-sm text-white font-mono">
                        {(() => {
                          const isPlayerOwned = system().owner === 'Player';
                          const oreMineLevel = system().buildings?.oreMine?.level || 0;
                          const production = isPlayerOwned ? oreMineLevel * BUILDINGS.oreMine.supplyPerLevel : 0;
                          const demand = system().market?.metals?.demand || 0;

                          // Local production satisfies local demand first
                          const localConsumption = Math.min(production, demand);
                          const surplus = production - localConsumption;
                          const unmetDemand = demand - localConsumption;

                          const parts = [];
                          if (surplus > 0) parts.push(`SUP ${surplus}`);
                          if (unmetDemand > 0) parts.push(`DEM ${unmetDemand}`);
                          if (parts.length === 0 && demand > 0) parts.push(`SELF ${localConsumption}`);

                          return parts.length > 0 ? parts.join(' / ') : '—';
                        })()}
                     </div>
                  </div>
               </div>
            </GlassPanel>
          </Show>

          {/* Actions */}
          <div class="pt-4">
             <Button variant="glass" onClick={props.onBack} fullWidth>
               &larr; RETURN TO GALAXY
             </Button>
          </div>

        </div>
      </GlassPanel>

      {/* Right Area: Visualization */}
      <div class="flex-1 relative overflow-hidden bg-black flex flex-col">
         {/* Scrollable container for the visualization */}
         <div class="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">

            {/* Position star at exact center of viewport (accounting for sidebar) */}
            <div class="min-w-max px-12 relative" style={{
              'padding-top': 'calc(50vh - 300px)',
              'padding-bottom': 'calc(50vh - 300px)'
            }}>

               <svg height="600" width={Math.max(1000, 600 + (system().planets.length * spacing()))} class="overflow-visible">
                 <defs>
                    <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="20" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="orbit-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stop-color="white" stop-opacity="0" />
                       <stop offset="20%" stop-color="white" stop-opacity="0.15" />
                       <stop offset="50%" stop-color="white" stop-opacity="0.35" />
                       <stop offset="80%" stop-color="white" stop-opacity="0.15" />
                       <stop offset="100%" stop-color="white" stop-opacity="0" />
                    </linearGradient>
                 </defs>

                 {/* Central Star - Offset to show full body */}
                 <g transform="translate(240, 300)" class="transition-glow" style={starGlowStyle()}>
                    {/* Outer Corona */}
                    <circle cx="0" cy="0" r={system().size * 14} fill={starColor()} opacity="0.1" filter="url(#star-glow)" />
                    {/* Main Body */}
                    <circle cx="0" cy="0" r={system().size * 10} fill={starColor()} filter="url(#star-glow)" />
                    {/* Inner Brightness */}
                    <circle cx="0" cy="0" r={system().size * 8} fill="white" opacity="0.2" />
                 </g>

                 {/* Planets & Orbit Slices */}
                 {system().planets?.map((planet, i) => {
                    const centerX = 240;
                    const centerY = 300;
                    const starRadius = system().size * 10;
                    // First orbit at 120px from star, subsequent orbits spaced by spacing()
                    const orbitRadius = starRadius + 120 + (i * spacing());
                    
                    // Angle span: +/- 35 degrees
                    const angle = 35;
                    const startAngle = -angle * (Math.PI / 180);
                    const endAngle = angle * (Math.PI / 180);
                    
                    const x1 = centerX + Math.cos(startAngle) * orbitRadius;
                    const y1 = centerY + Math.sin(startAngle) * orbitRadius;
                    
                    const x2 = centerX + Math.cos(endAngle) * orbitRadius;
                    const y2 = centerY + Math.sin(endAngle) * orbitRadius;

                    const pathData = `M ${x1} ${y1} A ${orbitRadius} ${orbitRadius} 0 0 1 ${x2} ${y2}`;
                    
                    // Planet position at 0 degrees (centered on arc)
                    const px = centerX + orbitRadius;
                    const py = centerY;

                    return (
                       <g 
                          class="group cursor-pointer hover:opacity-100 transition-opacity"
                          onClick={() => {
                             if (planet.isHomePlanet) {
                                props.onPlanetSelect?.(planet.id);
                             }
                          }}
                       >
                          {/* Orbit Slice */}
                          <path 
                             d={pathData} 
                             fill="none" 
                             stroke="url(#orbit-fade)" 
                             stroke-width="1"
                             class="opacity-30 group-hover:opacity-100 transition-opacity"
                          />

                          {/* Planet Group */}
                          <g transform={`translate(${px}, ${py})`}>
                             {/* Hit Area - Increased for easier clicking */}
                             <circle r={30} fill="transparent" />

                             {/* Home Planet Indicator - Using SystemProgressRing */}
                             {planet.isHomePlanet && (
                               <g>
                                 {/* Inner ring - solid */}
                                 <SystemProgressRing
                                   radius={28}
                                   progress={100}
                                   stroke="rgba(255, 255, 255, 0.4)"
                                   strokeWidth={1.5}
                                   opacity={0.8}
                                 />
                                 {/* Outer ring - dashed */}
                                 <circle
                                   r={32}
                                   fill="none"
                                   stroke="rgba(255, 255, 255, 0.2)"
                                   stroke-width="1"
                                   stroke-dasharray="2 4"
                                   class="animate-pulse"
                                 />
                               </g>
                             )}

                             {/* Planet Construct - Abstract representation */}
                             <PlanetConstructSVG
                               type={mapPlanetTypeToConstruct(planet.type)}
                               size={Math.max(32, planet.radius * 4)}
                               isHomePlanet={planet.isHomePlanet}
                               interactive={true}
                             />

                             {/* Label */}
                             <g transform="translate(0, 35)" class="opacity-50 group-hover:opacity-100 transition-opacity">
                                <text text-anchor="middle" fill="white" font-size="10" font-family="monospace" letter-spacing="1">
                                   {planet.type.toUpperCase()}
                                </text>
                                <text y="12" text-anchor="middle" fill="#737373" font-size="8" font-family="monospace">
                                   {Math.round(planet.distance)} AU
                                </text>
                             </g>
                          </g>
                       </g>
                    );
                 })}

               </svg>

            </div>
         </div>

         {/* Planet List Panel - Bottom */}
         <GlassPanel variant="overlay" class="relative">
            <div
               ref={planetListRef}
               class="flex gap-4 p-4 overflow-x-auto custom-scrollbar"
               onScroll={checkScrollRight}
            >
               {system().planets?.map((planet, i) => (
                  <div
                     class={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${planet.isHomePlanet ? 'bg-white/10 ring-1 ring-white/30' : 'bg-white/5'}`}
                     onClick={() => {
                        if (planet.isHomePlanet) {
                           props.onPlanetSelect?.(planet.id);
                        }
                     }}
                  >
                     {/* Planet Visual - Abstract Void Construct */}
                     <div class="relative mb-2">
                        {planet.isHomePlanet && (
                           <div class="absolute inset-0 -m-2 rounded ring-1 ring-white/20 animate-pulse" />
                        )}
                        <PlanetConstruct
                           type={mapPlanetTypeToConstruct(planet.type)}
                           size={48}
                           isHomePlanet={planet.isHomePlanet}
                           interactive={true}
                        />
                     </div>

                     {/* Planet Info */}
                     <span class="text-xs text-white font-mono tracking-wider">{planet.type.toUpperCase()}</span>
                     <span class="text-[10px] text-gray-500 font-mono">{Math.round(planet.distance)} AU</span>
                     <span class="text-[10px] text-gray-600 font-mono mt-1">#{i + 1}</span>
                  </div>
               ))}
            </div>

            {/* Scroll Right Indicator */}
            <Show when={canScrollRight()}>
               <div class="absolute right-0 top-0 bottom-0 w-16 pointer-events-none flex items-center justify-end pr-2 bg-gradient-to-l from-black/80 to-transparent">
                  <div class="text-white/60 animate-pulse">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6" />
                     </svg>
                  </div>
               </div>
            </Show>
         </GlassPanel>
      </div>

    </div>
  );
};
