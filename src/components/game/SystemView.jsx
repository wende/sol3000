import { createSignal, createEffect, onCleanup, createMemo } from 'solid-js';
import { Button } from '../common/Button';
import { GlassPanel } from '../common/GlassPanel';
import { getStarColor } from './Star';
import { SPECTRAL_CLASSES } from '../../utils/galaxy';

/**
 * System View Component
 * Symbolic view of a star system with a stack of planets.
 */
export const SystemView = (props) => {
  // Get current system data
  const system = () => props.system;

  const [windowWidth, setWindowWidth] = createSignal(window.innerWidth);

  createEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    onCleanup(() => window.removeEventListener('resize', handleResize));
  });

  const spacing = createMemo(() => {
    const s = system();
    if (!s) return 150;
    
    const count = s.planets.length;
    if (count <= 1) return 150;

    // We prioritize legibility over fitting since we have horizontal scrolling.
    // Ensure enough space so text labels (approx 100-120px) don't overlap.
    const availableWidth = windowWidth() * 0.8; 
    const starRadius = s.size * 10;
    const startOffset = 240 + starRadius + 150; // CenterX + Star + First Gap
    
    const availableForSpacing = availableWidth - startOffset;
    const calculatedSpacing = availableForSpacing / (count - 1);
    
    return Math.min(300, Math.max(150, calculatedSpacing));
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
      <div class="w-1/3 flex-shrink-0 flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-md relative z-20 slide-in-left">
        <div class="p-8 space-y-8 overflow-y-auto h-full custom-scrollbar">
          
          {/* Header */}
          <div>
             <h1 class="text-3xl font-light text-white tracking-[0.2em] uppercase leading-tight">{system().name}</h1>
             <div class="flex flex-wrap gap-2 mt-4 text-xs text-gray-400 font-mono uppercase tracking-wider">
                <span class="px-2 py-1 rounded bg-white/5">{spectralData.label} Class</span>
                <span class="px-2 py-1 rounded bg-white/5">{system().planetCount} Planets</span>
             </div>
          </div>

          {/* Description Panel */}
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
                      {system().market?.metals?.supply > 0
                        ? `SUP ${system().market.metals.supply}`
                        : system().market?.metals?.demand > 0
                        ? `DEM ${system().market.metals.demand}`
                        : '—'}
                   </div>
                </div>
             </div>
          </GlassPanel>

          {/* Actions */}
          <div class="pt-4">
             <Button variant="glass" onClick={props.onBack} fullWidth>
               &larr; RETURN TO GALAXY
             </Button>
          </div>

        </div>
      </div>

      {/* Right Area: Visualization */}
      <div class="flex-1 relative overflow-hidden bg-black">
         {/* Scrollable container for the visualization */}
         <div class="w-full h-full overflow-x-auto overflow-y-hidden custom-scrollbar">

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

                             {/* Home Planet Indicator */}
                             {planet.isHomePlanet && (
                               <g>
                                 <circle 
                                   r={Math.max(4, planet.radius) + 6} 
                                   fill="none" 
                                   stroke="rgba(100, 200, 255, 0.4)" 
                                   stroke-width="1"
                                 />
                                 <circle 
                                   r={Math.max(4, planet.radius) + 9} 
                                   fill="none" 
                                   stroke="rgba(100, 200, 255, 0.2)" 
                                   stroke-width="1"
                                   stroke-dasharray="2 4"
                                 />
                               </g>
                             )}

                             {/* Planet Circle */}
                             <circle 
                                r={Math.max(4, planet.radius)} 
                                fill={planet.color} 
                                class="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                             />
                             
                             {/* Label */}
                             <g transform="translate(0, 30)" class="opacity-50 group-hover:opacity-100 transition-opacity">
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
      </div>

    </div>
  );
};
