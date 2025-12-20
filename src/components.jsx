/* @refresh reload */
import { render } from 'solid-js/web';
import { createSignal, For, Show } from 'solid-js';
import './index.css';

// TreeLocator for component inspection
if (import.meta.env.DEV) {
  import("@treelocator/runtime").then(({ default: setupLocatorUI }) => {
    setupLocatorUI();
  }).catch(() => {});
}

// Import actual components
import { ResourceIconShowcase } from './components/game/ResourceIconShowcase';
import { BuildingIconShowcase } from './components/game/BuildingIconShowcase';
import { TetherFlowShowcase } from './components/game/TetherFlowShowcase';
import { TetherFlowShowcase as TetherFlowShowcaseCanvas } from './components/game/TetherFlowShowcase.canvas-backup';
import { GlassPanel } from './components/common/GlassPanel';
import { ProgressBar } from './components/common/ProgressBar';
import { Modal } from './components/common/Modal';
import { ResourceIcon } from './components/common/ResourceIcon';
import { Star, getStarColor } from './components/game/Star';
import { StarSystem } from './components/game/StarSystem';
import { SystemProgressRing } from './components/game/SystemProgressRing';
import { FTLRoute } from './components/game/FTLRoute';
import { StartGameButton } from './components/common/StartGameButton';
import { VignetteOverlay } from './components/common/VignetteOverlay';
import { BackgroundGrid } from './components/common/BackgroundGrid';
import { Button } from './components/common/Button';
import { DemoContainer } from './components/common/DemoContainer';
import { BuildingConstruct, BUILDING_CONSTRUCT_CATEGORIES } from './components/common/BuildingConstruct';

// Import real data
import { SPECTRAL_CLASSES } from './utils/galaxy';

import { Database, Navigation, RotateCcw, Zap, Box, ChevronDown } from 'lucide-solid';

/**
 * Generate a sample star color using the Star component's color generation
 */
function generateSampleColor(spectralClass, id) {
  return getStarColor(spectralClass, id);
}

/**
 * Generate sample star system data
 */
function createSampleSystem(id, spectralClass, x, y) {
  const cls = SPECTRAL_CLASSES[spectralClass];
  const size = (cls.size[0] + cls.size[1]) / 2;
  return {
    id,
    name: `${cls.prefix} ${spectralClass}-${id}`,
    x,
    y,
    size: Math.round(size),
    color: generateSampleColor(spectralClass, id),
    spectralClass,
    planetCount: cls.planetRange[0],
    eccentricity: cls.eccentricity,
    architecture: cls.architecture,
    population: '5.0M',
    resources: 'Normal',
    owner: 'Unclaimed',
    description: cls.description
  };
}

/**
 * Component Library Showcase
 * Displays all Sol3000 UI components in one place
 */
function ComponentsApp() {
  const [showModal, setShowModal] = createSignal(false);
  const [progress, setProgress] = createSignal(65);
  const [selectedSystemId, setSelectedSystemId] = createSignal(null);
  const [selectedRouteId, setSelectedRouteId] = createSignal(null);
  const [collapsedSections, setCollapsedSections] = createSignal(new Set());

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const isCollapsed = (sectionId) => collapsedSections().has(sectionId);

  // Create sample systems for each spectral class
  const sampleSystems = Object.keys(SPECTRAL_CLASSES).map((cls, i) =>
    createSampleSystem(i, cls, 60 + i * 90, 60)
  );

  // Sample systems for FTL route demo
  const routeSystems = [
    createSampleSystem(100, 'G', 50, 50),
    createSampleSystem(101, 'K', 180, 50),
    createSampleSystem(102, 'G', 310, 50),
    createSampleSystem(103, 'M', 440, 50),
    createSampleSystem(104, 'G', 50, 150),
    createSampleSystem(105, 'B', 180, 150),
    createSampleSystem(106, 'K', 310, 150),
    createSampleSystem(107, 'A', 440, 150),
  ];

  // Sample routes
  const sampleRoutes = [
    { source: routeSystems[0], target: routeSystems[1], id: '100-101' },
    { source: routeSystems[2], target: routeSystems[3], id: '102-103' },
    { source: routeSystems[4], target: routeSystems[5], id: '104-105' },
    { source: routeSystems[6], target: routeSystems[7], id: '106-107' },
  ];

  // Sample tethers (fog of war hints)
  const sampleTethers = [
    { source: { x: 500, y: 100 }, target: { x: 580, y: 80 } },
    { source: { x: 500, y: 100 }, target: { x: 590, y: 130 } },
  ];

  // Set of built FTL routes for showcase
  const builtFTLs = new Set(['104-105', '106-107']);

  return (
    <div class="min-h-screen py-20 px-12 bg-transparent">
      {/* Header */}
      <div id="header" class="mb-16 text-center">
        <h1 class="text-3xl font-light text-white tracking-[0.2em] uppercase mb-4">
          Sol3000 Component Library
        </h1>
        <p class="text-gray-500 text-sm max-w-xl mx-auto">
          A comprehensive showcase of all UI components used in Sol3000.
          Black-and-white aesthetic with glassmorphism design language.
        </p>
      </div>

      <div id="main-content" class="space-y-16">

        {/* Stars Section */}
        <section id="section-stars">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('stars')}
          >
            <span>STARS (Star Component)</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('stars') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('stars')}>
          <GlassPanel class="p-8">
            <p class="text-xs text-gray-500 mb-6">
              Star visualization based on real stellar physics. Each spectral class has unique color and size from SPECTRAL_CLASSES.
            </p>
            <svg width="100%" height="140" viewBox="0 0 700 140">
              <defs>
                <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g id="stars-showcase">
              <For each={Object.entries(SPECTRAL_CLASSES)}>
                {([cls, data], i) => {
                  const x = 50 + i() * 95;
                  const size = (data.size[0] + data.size[1]) / 2;
                  return (
                    <g transform={`translate(${x}, 50)`}>
                      <Star
                        id={i()}
                        size={size}
                        color={generateSampleColor(cls, i())}
                        spectralClass={cls}
                        isSelected={false}
                        lodClass=""
                      />
                      <text y={45} text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">
                        {cls}-type
                      </text>
                      <text y={60} text-anchor="middle" fill="#6b7280" font-size="9">
                        {data.label}
                      </text>
                      <text y={75} text-anchor="middle" fill="#4b5563" font-size="8">
                        {data.temperature}
                      </text>
                    </g>
                  );
                }}
              </For>
              </g>
            </svg>
          </GlassPanel>
          </Show>
        </section>

        {/* Star Systems Section */}
        <section id="section-star-systems">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('star-systems')}
          >
            <span>STAR SYSTEMS (StarSystem Component)</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('star-systems') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('star-systems')}>
          <GlassPanel class="p-8">
            <p class="text-xs text-gray-500 mb-6">
              Full star system with hit areas, selection rings, ownership indicators, and hover effects. Click to select.
            </p>
            <svg width="100%" height="200" viewBox="0 0 600 200" id="star-systems-showcase">
              {/* Normal system */}
              <StarSystem
                system={createSampleSystem(10, 'G', 80, 80)}
                isSelected={selectedSystemId() === 10}
                isHome={false}
                shouldFade={false}
                zoomLevel={0.5}
                onClick={() => setSelectedSystemId(selectedSystemId() === 10 ? null : 10)}
                id="star-system-normal"
              />
              <text x="80" y="150" text-anchor="middle" fill="#6b7280" font-size="10">Normal</text>

              {/* Selected system */}
              <StarSystem
                system={createSampleSystem(11, 'K', 200, 80)}
                isSelected={true}
                isHome={false}
                shouldFade={false}
                zoomLevel={0.5}
                onClick={() => {}}
                id="star-system-selected"
              />
              <text x="200" y="150" text-anchor="middle" fill="#6b7280" font-size="10">Selected</text>

              {/* Home system */}
              <StarSystem
                system={{ ...createSampleSystem(12, 'G', 320, 80), owner: 'Player' }}
                isSelected={selectedSystemId() === 12}
                isHome={true}
                shouldFade={false}
                zoomLevel={0.5}
                onClick={() => setSelectedSystemId(selectedSystemId() === 12 ? null : 12)}
                id="star-system-home"
              />
              <text x="320" y="150" text-anchor="middle" fill="#6b7280" font-size="10">Home System</text>

              {/* Owned system */}
              <StarSystem
                system={{ ...createSampleSystem(13, 'F', 440, 80), owner: 'Player' }}
                isSelected={selectedSystemId() === 13}
                isHome={false}
                shouldFade={false}
                zoomLevel={0.5}
                onClick={() => setSelectedSystemId(selectedSystemId() === 13 ? null : 13)}
                id="star-system-owned"
              />
              <text x="440" y="150" text-anchor="middle" fill="#6b7280" font-size="10">Owned</text>

              {/* Fading system (fog of war) */}
              <StarSystem
                system={createSampleSystem(14, 'M', 560, 80)}
                isSelected={false}
                isHome={false}
                shouldFade={true}
                zoomLevel={0.5}
                onClick={() => {}}
                id="star-system-fog"
              />
              <text x="560" y="150" text-anchor="middle" fill="#6b7280" font-size="10">Fog (fading)</text>
            </svg>
          </GlassPanel>
          </Show>
        </section>

        {/* TBD: Canvas Particle Animation */}
        <section id="section-canvas-particles-tbd">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('canvas-particles')}
          >
            <span>CANVAS PARTICLE ANIMATION <span class="text-purple-400">[TBD]</span></span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('canvas-particles') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('canvas-particles')}>

          <GlassPanel class="p-8">
            <div class="space-y-4">
              <p class="text-xs text-gray-500">
                Alternative implementation using HTML5 Canvas for particle-based flow animation.
                Currently archived in favor of CSS animation, but available for future use.
              </p>

              <div class="grid grid-cols-2 gap-4 text-xs">
                <div class="p-4 bg-white/5 rounded">
                  <div class="text-white mb-2 font-bold">Current: CSS Animation</div>
                  <ul class="space-y-1 text-gray-400">
                    <li>• Simple SVG + CSS</li>
                    <li>• Hardware accelerated</li>
                    <li>• 2.5s animation loop</li>
                    <li>• No JS animation loop</li>
                  </ul>
                </div>

                <div class="p-4 bg-purple-500/10 border border-purple-500/30 rounded">
                  <div class="text-purple-300 mb-2 font-bold">TBD: Canvas Particles</div>
                  <ul class="space-y-1 text-gray-400">
                    <li>• 40 particles per route</li>
                    <li>• 60fps RAF loop</li>
                    <li>• Dual-lane effect</li>
                    <li>• Fade in/out at ends</li>
                  </ul>
                </div>
              </div>

              <div class="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
                <div class="text-blue-300 text-xs font-bold mb-2">📁 Backup Location</div>
                <code class="text-[10px] text-gray-400 font-mono">
                  src/components/game/TetherFlowShowcase.canvas-backup.jsx
                </code>
              </div>

              <div class="p-4 bg-white/5 rounded">
                <div class="text-white text-xs font-bold mb-2">Potential Use Cases</div>
                <ul class="space-y-1 text-[11px] text-gray-400">
                  <li>• Complex particle effects (explosions, warp jumps)</li>
                  <li>• Dynamic flow visualization (varying density/speed based on trade volume)</li>
                  <li>• Interactive effects (particles react to mouse/click events)</li>
                  <li>• Multi-route optimization (render all trade routes in single canvas)</li>
                </ul>
              </div>
            </div>
          </GlassPanel>

          {/* Live Demo */}
          <div class="mt-6">
            <TetherFlowShowcaseCanvas id="canvas-particles-demo" />
          </div>
          </Show>
        </section>

        {/* FTL Routes & Tether Flow Section */}
        <section id="section-ftl-routes">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('ftl-routes')}
          >
            <span>FTL ROUTES & TETHER FLOW (FTLRoute & TetherFlowShowcase Components)</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('ftl-routes') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('ftl-routes')}>

          {/* Tether Flow Animation Showcase */}
          <TetherFlowShowcase id="tether-flow-showcase" />

          {/* FTL Route States */}
          <GlassPanel class="p-8 mt-6">
            <p class="text-xs text-gray-500 mb-6">
              FTL routes connect star systems. States: default, selected, built, built+selected, dimmed (fog). Click routes to select.
            </p>
            <svg width="100%" height="220" viewBox="0 0 620 220" id="ftl-routes-showcase">

              {/* Row 1: Route states */}
              {/* Default route */}
              <FTLRoute
                route={sampleRoutes[0]}
                routeId="100-101"
                isVisible={true}
                shouldFade={false}
                isSelected={selectedRouteId() === '100-101'}
                builtFTLs={builtFTLs}
                onSelect={setSelectedRouteId}
                id="ftl-route-default"
              />
              <g transform="translate(50, 50)">
                <Star id={100} size={6} color={generateSampleColor('G', 100)} spectralClass="G" isSelected={false} lodClass="" />
              </g>
              <g transform="translate(180, 50)">
                <Star id={101} size={5} color={generateSampleColor('K', 101)} spectralClass="K" isSelected={false} lodClass="" />
              </g>
              <text x="115" y="85" text-anchor="middle" fill="#6b7280" font-size="10">Default</text>

              {/* Selected route */}
              <FTLRoute
                route={sampleRoutes[1]}
                routeId="102-103"
                isVisible={true}
                shouldFade={false}
                isSelected={true}
                builtFTLs={builtFTLs}
                onSelect={() => {}}
                id="ftl-route-selected"
              />
              <g transform="translate(310, 50)">
                <Star id={102} size={6} color={generateSampleColor('G', 102)} spectralClass="G" isSelected={false} lodClass="" />
              </g>
              <g transform="translate(440, 50)">
                <Star id={103} size={4} color={generateSampleColor('M', 103)} spectralClass="M" isSelected={false} lodClass="" />
              </g>
              <text x="375" y="85" text-anchor="middle" fill="#6b7280" font-size="10">Selected</text>

              {/* Row 2: Built routes */}
              {/* Built route */}
              <FTLRoute
                route={sampleRoutes[2]}
                routeId="104-105"
                isVisible={true}
                shouldFade={false}
                isSelected={selectedRouteId() === '104-105'}
                builtFTLs={builtFTLs}
                onSelect={setSelectedRouteId}
                id="ftl-route-built"
              />
              <g transform="translate(50, 150)">
                <Star id={104} size={6} color={generateSampleColor('G', 104)} spectralClass="G" isSelected={false} lodClass="" />
              </g>
              <g transform="translate(180, 150)">
                <Star id={105} size={8} color={generateSampleColor('B', 105)} spectralClass="B" isSelected={false} lodClass="" />
              </g>
              <text x="115" y="185" text-anchor="middle" fill="#6b7280" font-size="10">Built</text>

              {/* Built + Selected route */}
              <FTLRoute
                route={sampleRoutes[3]}
                routeId="106-107"
                isVisible={true}
                shouldFade={false}
                isSelected={true}
                builtFTLs={builtFTLs}
                onSelect={() => {}}
                id="ftl-route-built-selected"
              />
              <g transform="translate(310, 150)">
                <Star id={106} size={5} color={generateSampleColor('K', 106)} spectralClass="K" isSelected={false} lodClass="" />
              </g>
              <g transform="translate(440, 150)">
                <Star id={107} size={7} color={generateSampleColor('A', 107)} spectralClass="A" isSelected={false} lodClass="" />
              </g>
              <text x="375" y="185" text-anchor="middle" fill="#6b7280" font-size="10">Built + Selected</text>

              {/* Dimmed routes (fog of war hints) - one visible system */}
              <FTLRoute
                route={{ source: { x: 500, y: 100 }, target: { x: 580, y: 70 } }}
                routeId="200-201"
                isVisible={true}
                shouldFade={false}
                isSelected={false}
                isDimmed={true}
                onSelect={() => {}}
                id="ftl-route-dimmed-1"
              />
              <FTLRoute
                route={{ source: { x: 500, y: 100 }, target: { x: 590, y: 120 } }}
                routeId="200-202"
                isVisible={true}
                shouldFade={false}
                isSelected={false}
                isDimmed={true}
                onSelect={() => {}}
                id="ftl-route-dimmed-2"
              />
              <g transform="translate(500, 100)">
                <Star id={200} size={5} color={generateSampleColor('K', 200)} spectralClass="K" isSelected={false} lodClass="" />
              </g>
              <text x="545" y="185" text-anchor="middle" fill="#6b7280" font-size="10">Dimmed (fog)</text>
            </svg>
          </GlassPanel>
          </Show>
        </section>

        {/* Glass Panels Section */}
        <section id="section-glass-panels">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('glass-panels')}
          >
            <span>GLASS PANELS (GlassPanel Component)</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('glass-panels') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('glass-panels')}>

          <div class="grid grid-cols-2 gap-4" id="glass-panels-showcase">
            <GlassPanel variant="default" class="p-6" id="glass-panel-default">
              <h3 class="text-sm tracking-widest text-white mb-2">DEFAULT PANEL</h3>
              <p class="text-xs text-gray-400">
                Standard glassmorphism container with blur backdrop and subtle border.
              </p>
            </GlassPanel>

            <GlassPanel variant="selected" class="p-6" id="glass-panel-selected">
              <h3 class="text-sm tracking-widest text-blue-300 mb-2">SELECTED PANEL</h3>
              <p class="text-xs text-gray-400">
                Panel with blue accent border for selected or active states.
              </p>
            </GlassPanel>

            <GlassPanel variant="highlighted" class="p-6" id="glass-panel-highlighted">
              <h3 class="text-sm tracking-widest text-white mb-2">HIGHLIGHTED PANEL</h3>
              <p class="text-xs text-gray-400">
                Panel with blue-tinted background for emphasis.
              </p>
            </GlassPanel>

            <GlassPanel variant="warning" class="p-6" id="glass-panel-warning">
              <h3 class="text-sm tracking-widest text-red-300 mb-2">WARNING PANEL</h3>
              <p class="text-xs text-gray-400">
                Panel with red accent for warnings or destructive actions.
              </p>
            </GlassPanel>
          </div>
          </Show>
        </section>

        {/* Buttons Section */}
        <section id="section-buttons">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('buttons')}
          >
            <span>BUTTONS</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('buttons') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('buttons')}>

          <GlassPanel class="p-8">
            <div class="space-y-8" id="buttons-showcase">
              {/* Start Game Button */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">START GAME BUTTON (StartGameButton Component)</h3>
                <div class="relative h-16 border border-white/10 rounded overflow-hidden">
                  <StartGameButton id="button-start-game" onClick={() => alert('Start Game clicked!')} />
                </div>
              </div>

              {/* Command Buttons (CommandBar.jsx style) */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">COMMAND BAR (CommandBar style)</h3>
                <GlassPanel class="w-auto h-[70px] flex items-center justify-center px-8" id="button-command-bar">
                  <div class="flex items-center space-x-8">
                    <Button id="button-command-reset" variant="command" icon={<RotateCcw size={18} class="text-gray-400 group-hover:text-red-300 transition-colors" />} label="RESET" danger />

                    <div class="h-8 w-px bg-white/10" />

                    <Button id="button-command-tech" variant="command" icon={<Database size={18} class="text-gray-400 group-hover:text-white transition-colors" />} label="TECH" />

                    <div class="h-8 w-px bg-white/10" />

                    <Button id="button-command-fleet" variant="command" icon={<Navigation size={18} class="text-gray-400 group-hover:text-white transition-colors" />} label="FLEET" />
                  </div>
                </GlassPanel>
              </div>

              {/* Primary & Secondary Buttons (Sidebar.jsx style) */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">PRIMARY & SECONDARY (Sidebar style)</h3>
                <div class="space-y-3 max-w-[300px]">
                  <Button id="button-primary-manage" variant="primary" fullWidth>MANAGE BUILDINGS</Button>
                  <Button id="button-secondary-scan" variant="secondary" fullWidth>SCAN SYSTEM (50 CR)</Button>
                  <Button id="button-secondary-disabled" variant="secondary" fullWidth disabled>DISABLED STATE</Button>
                </div>
              </div>

              {/* Glass Buttons (BuildingList.jsx style) */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">GLASS BUTTONS (BuildingList style)</h3>
                <div class="flex items-center gap-4">
                  <Button id="button-glass-build" variant="glass">Build</Button>
                  <Button id="button-glass-upgrade" variant="glass">Upgrade</Button>
                  <Button id="button-glass-disabled" variant="glass" disabled>Disabled</Button>
                </div>
              </div>

              {/* Icon Buttons (Modal/Sidebar close style) */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">ICON BUTTONS (close button style)</h3>
                <div class="flex items-center gap-4">
                  <Button id="button-icon-zap" variant="icon" icon={<Zap size={18} />} />
                  <Button id="button-icon-box" variant="icon" icon={<Box size={18} />} />
                  <Button id="button-icon-database" variant="icon" icon={<Database size={18} />} />
                </div>
              </div>

              {/* Text & Success Buttons */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">TEXT & SUCCESS BUTTONS</h3>
                <div class="flex items-center gap-4">
                  <Button id="button-text-back" variant="text">&larr; BACK TO OVERVIEW</Button>
                  <Button id="button-success-launch" variant="success">LAUNCH</Button>
                </div>
              </div>
            </div>
          </GlassPanel>
          </Show>
        </section>

        {/* Progress Bars Section */}
        <section id="section-progress-bars">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('progress-bars')}
          >
            <span>PROGRESS BARS (ProgressBar Component)</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('progress-bars') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('progress-bars')}>

          <GlassPanel class="p-8 space-y-8">
            {/* Default Progress Bar */}
            <div>
              <h3 class="text-xs text-gray-500 tracking-widest mb-3">DEFAULT VARIANT</h3>
              <div class="space-y-3">
                <ProgressBar id="progressbar-25" progress={25} />
                <ProgressBar id="progressbar-50" progress={50} />
                <ProgressBar id="progressbar-75" progress={75} />
                <ProgressBar id="progressbar-100" progress={100} />
              </div>
            </div>

            {/* With Glow */}
            <div>
              <h3 class="text-xs text-gray-500 tracking-widest mb-3">WITH GLOW EFFECT</h3>
              <div class="space-y-3">
                <ProgressBar id="progressbar-glow" progress={60} glow={true} />
              </div>
            </div>

            {/* Glass Variant */}
            <div>
              <h3 class="text-xs text-gray-500 tracking-widest mb-3">GLASS VARIANT</h3>
              <div class="space-y-3">
                <ProgressBar id="progressbar-glass-35" progress={35} variant="glass" />
                <ProgressBar id="progressbar-glass-65" progress={65} variant="glass" label="RESEARCHING..." />
                <ProgressBar id="progressbar-glass-90" progress={90} variant="glass" label="ALMOST DONE" />
              </div>
            </div>

            {/* Interactive Demo */}
            <div>
              <h3 class="text-xs text-gray-500 tracking-widest mb-3">INTERACTIVE DEMO</h3>
              <ProgressBar id="progressbar-interactive" progress={progress()} variant="glass" label={`${progress()}%`} />
              <div class="flex gap-2 mt-4">
                <Button id="button-progress-decrease" variant="glass" onClick={() => setProgress(p => Math.max(0, p - 10))}>
                  - 10%
                </Button>
                <Button id="button-progress-increase" variant="glass" onClick={() => setProgress(p => Math.min(100, p + 10))}>
                  + 10%
                </Button>
              </div>
            </div>

            {/* System Progress Ring */}
            <div>
              <h3 class="text-xs text-gray-500 tracking-widest mb-3">SYSTEM PROGRESS RING (SCANNING)</h3>
              <p class="text-xs text-gray-500 mb-4">
                Used on the galaxy map while scanning. This is the same ownership ring, gradually filling in.
              </p>
              <svg width="220" height="70" viewBox="0 0 220 70">
                <g transform="translate(55, 35)">
                  <SystemProgressRing radius={18} progress={progress()} stroke="rgba(255, 255, 255, 0.9)" opacity={0.95} strokeWidth={1.5} />
                  <text y={34} text-anchor="middle" fill="#6b7280" font-size="10">Scanning</text>
                </g>
                <g transform="translate(165, 35)">
                  <SystemProgressRing radius={18} progress={100} />
                  <text y={34} text-anchor="middle" fill="#6b7280" font-size="10">Owned</text>
                </g>
              </svg>
            </div>
          </GlassPanel>
          </Show>
        </section>

        {/* Modal Section */}
        <section id="section-modal">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('modal')}
          >
            <span>MODAL (Modal Component)</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('modal') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('modal')}>

          <GlassPanel id="modal-showcase-trigger" class="p-8">
            <p class="text-xs text-gray-500 mb-4">
              Modal dialogs with glassmorphism styling. Used for tech research, fleet management, etc.
            </p>
            <Button id="button-open-modal" variant="glass" onClick={() => setShowModal(true)}>
              Open Modal Demo
            </Button>
          </GlassPanel>

          <Modal
            id="modal-showcase"
            open={showModal()}
            onClose={() => setShowModal(false)}
            title="SAMPLE MODAL"
            icon={<Database size={20} class="text-blue-400" />}
          >
            <div class="space-y-4">
              <p class="text-sm text-gray-400">
                This is a sample modal with the standard Sol3000 styling.
                It includes a header with icon, close button, and scrollable content area.
              </p>
              <div class="p-4 bg-white/5 rounded border border-white/10">
                <h4 class="text-xs text-gray-500 tracking-widest mb-2">EXAMPLE CONTENT</h4>
                <div class="flex items-center gap-3">
                  <ResourceIcon type="credits" size={24} class="text-blue-400" />
                  <span class="text-white">1,000 Credits</span>
                </div>
              </div>
              <ProgressBar progress={75} variant="glass" label="75% Complete" />
            </div>
          </Modal>
          </Show>
        </section>

        {/* Resource Icons Section */}
        <section id="section-resource-icons">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('resource-icons')}
          >
            <span>RESOURCE ICONS (ResourceIcon & ResourceIconShowcase Components)</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('resource-icons') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('resource-icons')}>
          <ResourceIconShowcase id="resource-icons-showcase" />
          </Show>
        </section>

        {/* Building Icons Section */}
        <section id="section-building-icons">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('building-icons')}
          >
            <span>BUILDING ICONS (BuildingIcon & BuildingIconShowcase Components)</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('building-icons') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('building-icons')}>
          <BuildingIconShowcase id="building-icons-showcase" />
          </Show>
        </section>

        {/* Building Constructs Section */}
        <section id="section-building-constructs">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('building-constructs')}
          >
            <span>BUILDING CONSTRUCTS (BuildingConstruct Component)</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('building-constructs') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('building-constructs')}>
          <GlassPanel class="p-8 my-10">
            <p class="text-xs text-gray-500 mb-8">
              Large-scale building visualizations using 5x5 CSS grid with layered blocks.
              Each building has unique architecture representing its category and function.
              Hover over buildings to see interactive effects.
            </p>

            <For each={Object.entries(BUILDING_CONSTRUCT_CATEGORIES)}>
              {([category, buildingTypes]) => (
                <div class="mb-12">
                  <h3 class="text-sm font-bold tracking-widest text-white mb-6 uppercase border-b border-white/10 pb-2">
                    {category}
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <For each={buildingTypes}>
                      {(buildingType) => (
                        <div class="flex flex-col items-center">
                          <BuildingConstruct
                            type={buildingType}
                            size={140}
                            showLabel={true}
                            interactive={true}
                          />
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>

            <div class="mt-12 p-6 bg-white/5 rounded border border-white/10">
              <h3 class="text-xs text-gray-500 tracking-widest mb-4">BUILDING CATEGORIES</h3>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div class="text-white font-bold mb-2">HEADQUARTERS</div>
                  <p class="text-gray-400">Central command structures with symmetrical designs</p>
                </div>
                <div>
                  <div class="text-white font-bold mb-2">RESIDENTIAL</div>
                  <p class="text-gray-400">Housing units with vertical and modular architecture</p>
                </div>
                <div>
                  <div class="text-white font-bold mb-2">EXTRACTION</div>
                  <p class="text-gray-400">Mining and resource gathering facilities</p>
                </div>
                <div>
                  <div class="text-white font-bold mb-2">INDUSTRIAL</div>
                  <p class="text-gray-400">Production and energy generation complexes</p>
                </div>
                <div>
                  <div class="text-white font-bold mb-2">TECHNOLOGY</div>
                  <p class="text-gray-400">Research and computation centers</p>
                </div>
                <div>
                  <div class="text-white font-bold mb-2">AEROSPACE</div>
                  <p class="text-gray-400">Orbital infrastructure and launch facilities</p>
                </div>
                <div>
                  <div class="text-white font-bold mb-2">LOGISTICS</div>
                  <p class="text-gray-400">Storage and distribution hubs</p>
                </div>
              </div>
            </div>
          </GlassPanel>
          </Show>
        </section>

        {/* Background Elements Section */}
        <section id="section-background-elements">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('background-elements')}
          >
            <span>BACKGROUND ELEMENTS (VignetteOverlay & BackgroundGrid Components)</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('background-elements') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('background-elements')}>

          <div class="grid grid-cols-2 gap-4" id="background-elements-showcase">
            {/* Vignette */}
            <DemoContainer
              id="vignette-container"
              background="gradient"
              label="VIGNETTE OVERLAY"
            >
              <VignetteOverlay id="vignette-overlay" />
            </DemoContainer>

            {/* Grid */}
            <DemoContainer
              id="grid-container"
              background="solid"
              label="BACKGROUND GRID"
            >
              <BackgroundGrid id="background-grid" />
            </DemoContainer>
          </div>
          </Show>
        </section>

        {/* Typography Section */}
        <section id="section-typography">
          <h2
            class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4 cursor-pointer hover:text-blue-300 transition-colors flex items-center justify-between"
            onClick={() => toggleSection('typography')}
          >
            <span>TYPOGRAPHY</span>
            <ChevronDown
              size={20}
              class={`transition-transform ${isCollapsed('typography') ? '' : 'rotate-180'}`}
            />
          </h2>
          <Show when={!isCollapsed('typography')}>

          <GlassPanel id="typography-showcase" class="p-8 space-y-6">
            <div>
              <span class="text-[10px] text-gray-500 tracking-widest">HEADING STYLES</span>
              <h1 class="text-3xl font-light text-white tracking-[0.2em] uppercase mt-2">Main Title</h1>
              <h2 class="text-xl font-light text-white tracking-widest uppercase mt-2">Section Header</h2>
              <h3 class="text-sm text-white tracking-widest uppercase mt-2">Subsection</h3>
            </div>

            <div>
              <span class="text-[10px] text-gray-500 tracking-widest">BODY TEXT</span>
              <p class="text-sm text-gray-400 mt-2 leading-relaxed">
                Standard body text for descriptions and information. Uses system font stack
                for optimal readability across platforms.
              </p>
              <p class="text-xs text-gray-500 mt-2">
                Small text for secondary information, labels, and metadata.
              </p>
            </div>

            <div>
              <span class="text-[10px] text-gray-500 tracking-widest">LABELS & BADGES</span>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ACTIVE
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/30">
                  COMPLETED
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  ERROR
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-400 border border-white/20">
                  DEFAULT
                </span>
              </div>
            </div>
          </GlassPanel>
          </Show>
        </section>

      </div>

      {/* Footer */}
      <div id="footer" class="mt-20 text-center">
        <a
          id="link-return-to-game"
          href="/"
          class="text-[10px] text-blue-400 hover:text-blue-300 tracking-widest uppercase border border-blue-400/30 px-6 py-3 rounded transition-all hover:bg-blue-400/10"
        >
          Return to Game
        </a>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
render(() => <ComponentsApp />, root);
