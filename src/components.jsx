/* @refresh reload */
import { render } from 'solid-js/web';
import { createSignal, For } from 'solid-js';
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
import { GlassPanel } from './components/common/GlassPanel';
import { ProgressBar } from './components/common/ProgressBar';
import { Modal } from './components/common/Modal';
import { ResourceIcon } from './components/common/ResourceIcon';
import { Star } from './components/game/Star';
import { StarSystem } from './components/game/StarSystem';
import { FTLRoute } from './components/game/FTLRoute';
import { FTLTethers } from './components/game/FTLTethers';
import { StartGameButton } from './components/common/StartGameButton';
import { VignetteOverlay } from './components/common/VignetteOverlay';
import { BackgroundGrid } from './components/common/BackgroundGrid';
import { Button } from './components/common/Button';

// Import real data
import { SPECTRAL_CLASSES } from './utils/galaxy';

import { Database, Navigation, RotateCcw, Zap, Box } from 'lucide-solid';

/**
 * Generate a sample star color using real SPECTRAL_CLASSES data
 */
function generateSampleColor(spectralClass) {
  const cls = SPECTRAL_CLASSES[spectralClass];
  const hue = (cls.hue[0] + cls.hue[1]) / 2;
  const saturation = (cls.saturation[0] + cls.saturation[1]) / 2;
  const lightness = (cls.lightness[0] + cls.lightness[1]) / 2;
  return `hsl(${Math.floor(hue)}, ${Math.floor(saturation)}%, ${Math.floor(lightness)}%)`;
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
    color: generateSampleColor(spectralClass),
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

  return (
    <div class="min-h-screen py-20 px-12" style="background: transparent;">
      {/* Header */}
      <div class="max-w-5xl mx-auto mb-16 text-center">
        <h1 class="text-3xl font-light text-white tracking-[0.2em] uppercase mb-4">
          Sol3000 Component Library
        </h1>
        <p class="text-gray-500 text-sm max-w-xl mx-auto">
          A comprehensive showcase of all UI components used in Sol3000.
          Black-and-white aesthetic with glassmorphism design language.
        </p>
      </div>

      <div class="max-w-5xl mx-auto space-y-16">

        {/* Stars Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            STARS (Star Component)
          </h2>
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
              <For each={Object.entries(SPECTRAL_CLASSES)}>
                {([cls, data], i) => {
                  const x = 50 + i() * 95;
                  const size = (data.size[0] + data.size[1]) / 2;
                  return (
                    <g transform={`translate(${x}, 50)`}>
                      <Star
                        id={i()}
                        size={size}
                        color={generateSampleColor(cls)}
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
            </svg>
          </GlassPanel>
        </section>

        {/* Star Systems Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            STAR SYSTEMS (StarSystem Component)
          </h2>
          <GlassPanel class="p-8">
            <p class="text-xs text-gray-500 mb-6">
              Full star system with hit areas, selection rings, ownership indicators, and hover effects. Click to select.
            </p>
            <svg width="100%" height="200" viewBox="0 0 600 200">
              {/* Normal system */}
              <StarSystem
                system={createSampleSystem(10, 'G', 80, 80)}
                isSelected={selectedSystemId() === 10}
                isHome={false}
                shouldFade={false}
                zoomLevel={0.5}
                onClick={() => setSelectedSystemId(selectedSystemId() === 10 ? null : 10)}
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
              />
              <text x="560" y="150" text-anchor="middle" fill="#6b7280" font-size="10">Fog (fading)</text>
            </svg>
          </GlassPanel>
        </section>

        {/* FTL Routes Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            FTL TETHER FLOW (TetherFlowShowcase Component)
          </h2>
          <TetherFlowShowcase />
        </section>

        {/* FTL Routes Section (Original) */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            FTL ROUTES (FTLRoute & FTLTethers Components)
          </h2>
          <GlassPanel class="p-8">
            <p class="text-xs text-gray-500 mb-6">
              FTL routes connect star systems. Different states: default, selected, built, built+selected. Click routes to select.
            </p>
            <svg width="100%" height="220" viewBox="0 0 620 220">

              {/* Row 1: Route states */}
              {/* Default route */}
              <FTLRoute
                route={sampleRoutes[0]}
                routeId="100-101"
                isVisible={true}
                shouldFade={false}
                isSelected={selectedRouteId() === '100-101'}
                isBuilt={false}
                onSelect={setSelectedRouteId}
              />
              <Star id={100} size={6} color={generateSampleColor('G')} spectralClass="G" isSelected={false} lodClass="" />
              <g transform="translate(50, 50)">
                <Star id={100} size={6} color={generateSampleColor('G')} spectralClass="G" isSelected={false} lodClass="" />
              </g>
              <g transform="translate(180, 50)">
                <Star id={101} size={5} color={generateSampleColor('K')} spectralClass="K" isSelected={false} lodClass="" />
              </g>
              <text x="115" y="85" text-anchor="middle" fill="#6b7280" font-size="10">Default</text>

              {/* Selected route */}
              <FTLRoute
                route={sampleRoutes[1]}
                routeId="102-103"
                isVisible={true}
                shouldFade={false}
                isSelected={true}
                isBuilt={false}
                onSelect={() => {}}
              />
              <g transform="translate(310, 50)">
                <Star id={102} size={6} color={generateSampleColor('G')} spectralClass="G" isSelected={false} lodClass="" />
              </g>
              <g transform="translate(440, 50)">
                <Star id={103} size={4} color={generateSampleColor('M')} spectralClass="M" isSelected={false} lodClass="" />
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
                isBuilt={true}
                onSelect={setSelectedRouteId}
              />
              <g transform="translate(50, 150)">
                <Star id={104} size={6} color={generateSampleColor('G')} spectralClass="G" isSelected={false} lodClass="" />
              </g>
              <g transform="translate(180, 150)">
                <Star id={105} size={8} color={generateSampleColor('B')} spectralClass="B" isSelected={false} lodClass="" />
              </g>
              <text x="115" y="185" text-anchor="middle" fill="#6b7280" font-size="10">Built</text>

              {/* Built + Selected route */}
              <FTLRoute
                route={sampleRoutes[3]}
                routeId="106-107"
                isVisible={true}
                shouldFade={false}
                isSelected={true}
                isBuilt={true}
                onSelect={() => {}}
              />
              <g transform="translate(310, 150)">
                <Star id={106} size={5} color={generateSampleColor('K')} spectralClass="K" isSelected={false} lodClass="" />
              </g>
              <g transform="translate(440, 150)">
                <Star id={107} size={7} color={generateSampleColor('A')} spectralClass="A" isSelected={false} lodClass="" />
              </g>
              <text x="375" y="185" text-anchor="middle" fill="#6b7280" font-size="10">Built + Selected</text>

              {/* Tethers (fog of war hints) */}
              <g transform="translate(500, 100)">
                <FTLTethers routes={[
                  { source: { x: 0, y: 0 }, target: { x: 80, y: -30 } },
                  { source: { x: 0, y: 0 }, target: { x: 90, y: 20 } },
                ]} />
                <Star id={200} size={5} color={generateSampleColor('K')} spectralClass="K" isSelected={false} lodClass="" />
                <circle cx="80" cy="-30" r="3" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.1)" />
                <circle cx="90" cy="20" r="3" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.1)" />
              </g>
              <text x="540" y="185" text-anchor="middle" fill="#6b7280" font-size="10">Tethers (fog)</text>
            </svg>
          </GlassPanel>
        </section>

        {/* Glass Panels Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            GLASS PANELS (GlassPanel Component)
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <GlassPanel class="p-6">
              <h3 class="text-sm tracking-widest text-white mb-2">DEFAULT PANEL</h3>
              <p class="text-xs text-gray-400">
                Standard glassmorphism container with blur backdrop and subtle border.
              </p>
            </GlassPanel>

            <GlassPanel class="p-6 border border-blue-500/30">
              <h3 class="text-sm tracking-widest text-blue-300 mb-2">SELECTED PANEL</h3>
              <p class="text-xs text-gray-400">
                Panel with blue accent border for selected or active states.
              </p>
            </GlassPanel>

            <GlassPanel class="p-6" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <h3 class="text-sm tracking-widest text-white mb-2">HIGHLIGHTED PANEL</h3>
              <p class="text-xs text-gray-400">
                Panel with blue-tinted background for emphasis.
              </p>
            </GlassPanel>

            <GlassPanel class="p-6 border border-red-500/30">
              <h3 class="text-sm tracking-widest text-red-300 mb-2">WARNING PANEL</h3>
              <p class="text-xs text-gray-400">
                Panel with red accent for warnings or destructive actions.
              </p>
            </GlassPanel>
          </div>
        </section>

        {/* Buttons Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            BUTTONS
          </h2>
          <GlassPanel class="p-8">
            <div class="space-y-8">
              {/* Start Game Button */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">START GAME BUTTON (StartGameButton Component)</h3>
                <div class="relative h-16 border border-white/10 rounded overflow-hidden">
                  <StartGameButton onClick={() => alert('Start Game clicked!')} />
                </div>
              </div>

              {/* Command Buttons (CommandBar.jsx style) */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">COMMAND BAR (CommandBar style)</h3>
                <GlassPanel class="w-auto h-[70px] flex items-center justify-center px-8">
                  <div class="flex items-center space-x-8">
                    <Button variant="command" icon={<RotateCcw size={18} class="text-gray-400 group-hover:text-red-300 transition-colors" />} label="RESET" danger />

                    <div class="h-8 w-px bg-white/10" />

                    <Button variant="command" icon={<Database size={18} class="text-gray-400 group-hover:text-white transition-colors" />} label="TECH" />

                    <div class="h-8 w-px bg-white/10" />

                    <Button variant="command" icon={<Navigation size={18} class="text-gray-400 group-hover:text-white transition-colors" />} label="FLEET" />
                  </div>
                </GlassPanel>
              </div>

              {/* Primary & Secondary Buttons (Sidebar.jsx style) */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">PRIMARY & SECONDARY (Sidebar style)</h3>
                <div class="space-y-3" style="max-width: 300px;">
                  <Button variant="primary" fullWidth>MANAGE BUILDINGS</Button>
                  <Button variant="secondary" fullWidth>SCAN SYSTEM (50 CR)</Button>
                  <Button variant="secondary" fullWidth disabled>DISABLED STATE</Button>
                </div>
              </div>

              {/* Glass Buttons (BuildingList.jsx style) */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">GLASS BUTTONS (BuildingList style)</h3>
                <div class="flex items-center gap-4">
                  <Button variant="glass">Build</Button>
                  <Button variant="glass">Upgrade</Button>
                  <Button variant="glass" disabled>Disabled</Button>
                </div>
              </div>

              {/* Icon Buttons (Modal/Sidebar close style) */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">ICON BUTTONS (close button style)</h3>
                <div class="flex items-center gap-4">
                  <Button variant="icon" icon={<Zap size={18} />} />
                  <Button variant="icon" icon={<Box size={18} />} />
                  <Button variant="icon" icon={<Database size={18} />} />
                </div>
              </div>

              {/* Text & Success Buttons */}
              <div>
                <h3 class="text-xs text-gray-500 tracking-widest mb-4">TEXT & SUCCESS BUTTONS</h3>
                <div class="flex items-center gap-4">
                  <Button variant="text">&larr; BACK TO OVERVIEW</Button>
                  <Button variant="success">LAUNCH</Button>
                </div>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Progress Bars Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            PROGRESS BARS (ProgressBar Component)
          </h2>
          <GlassPanel class="p-8 space-y-8">
            {/* Default Progress Bar */}
            <div>
              <h3 class="text-xs text-gray-500 tracking-widest mb-3">DEFAULT VARIANT</h3>
              <div class="space-y-3">
                <ProgressBar progress={25} />
                <ProgressBar progress={50} />
                <ProgressBar progress={75} />
                <ProgressBar progress={100} />
              </div>
            </div>

            {/* With Glow */}
            <div>
              <h3 class="text-xs text-gray-500 tracking-widest mb-3">WITH GLOW EFFECT</h3>
              <div class="space-y-3">
                <ProgressBar progress={60} glow={true} />
              </div>
            </div>

            {/* Glass Variant */}
            <div>
              <h3 class="text-xs text-gray-500 tracking-widest mb-3">GLASS VARIANT</h3>
              <div class="space-y-3">
                <ProgressBar progress={35} variant="glass" />
                <ProgressBar progress={65} variant="glass" label="RESEARCHING..." />
                <ProgressBar progress={90} variant="glass" label="ALMOST DONE" />
              </div>
            </div>

            {/* Interactive Demo */}
            <div>
              <h3 class="text-xs text-gray-500 tracking-widest mb-3">INTERACTIVE DEMO</h3>
              <ProgressBar progress={progress()} variant="glass" label={`${progress()}%`} />
              <div class="flex gap-2 mt-4">
                <Button variant="glass" onClick={() => setProgress(p => Math.max(0, p - 10))}>
                  - 10%
                </Button>
                <Button variant="glass" onClick={() => setProgress(p => Math.min(100, p + 10))}>
                  + 10%
                </Button>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Modal Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            MODAL (Modal Component)
          </h2>
          <GlassPanel class="p-8">
            <p class="text-xs text-gray-500 mb-4">
              Modal dialogs with glassmorphism styling. Used for tech research, fleet management, etc.
            </p>
            <Button variant="glass" onClick={() => setShowModal(true)}>
              Open Modal Demo
            </Button>
          </GlassPanel>

          <Modal
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
        </section>

        {/* Resource Icons Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            RESOURCE ICONS (ResourceIcon & ResourceIconShowcase Components)
          </h2>
          <ResourceIconShowcase />
        </section>

        {/* Building Icons Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            BUILDING ICONS (BuildingIcon & BuildingIconShowcase Components)
          </h2>
          <BuildingIconShowcase />
        </section>

        {/* Background Elements Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            BACKGROUND ELEMENTS (VignetteOverlay & BackgroundGrid Components)
          </h2>
          <div class="grid grid-cols-2 gap-4">
            {/* Vignette */}
            <div class="relative h-48 border-2 border-white/20 rounded overflow-hidden" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
              <VignetteOverlay />
              <div class="absolute bottom-4 left-4">
                <span class="text-xs text-gray-400 tracking-widest">VIGNETTE OVERLAY</span>
              </div>
            </div>

            {/* Grid */}
            <div class="relative h-48 border-2 border-white/20 rounded overflow-hidden" style="background: #333;">
              <BackgroundGrid />
              <div class="absolute bottom-4 left-4">
                <span class="text-xs text-gray-400 tracking-widest">BACKGROUND GRID</span>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
            TYPOGRAPHY
          </h2>
          <GlassPanel class="p-8 space-y-6">
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
        </section>

      </div>

      {/* Footer */}
      <div class="mt-20 text-center">
        <a
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
