import { onMount, onCleanup, createEffect, createMemo, Show } from 'solid-js';
import { createGameState } from './utils/gameState';
import { GalaxyMap } from './components/game/GalaxyMap';
import { SystemView } from './components/game/SystemView';
import { Sidebar } from './components/game/Sidebar';
import { CommandBar } from './components/game/CommandBar';
import { BackgroundGrid } from './components/common/BackgroundGrid';
import { StartGameButton } from './components/common/StartGameButton';
import { VignetteOverlay } from './components/common/VignetteOverlay';

export default function App() {
  // Initialize game state with real-time tick system
  const gameState = createGameState();

  // Load saved game or start new game
  onMount(() => {
    gameState.loadState();
  });

  // Cleanup game loop on unmount
  onCleanup(() => {
    gameState.stopGameLoop();
  });

  // Handle system selection and trigger ripple
  const handleSystemSelect = (id) => {
    gameState.setSelectedSystemId(id);
    gameState.setSelectedTetherId(null); // Clear tether selection when selecting a system

    // Add new ripple using System ID instead of screen coords
    const rippleId = Date.now();
    gameState.setRipples(prev => [...prev, { systemId: id, id: rippleId }]);

    // Cleanup ripple after animation
    setTimeout(() => {
      gameState.setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 1000);
  };

  // Handle tether selection
  const handleTetherSelect = (tetherId) => {
    gameState.setSelectedTetherId(tetherId);
    gameState.setSelectedSystemId(null); // Clear system selection when selecting a tether
  };

  // Handle background click to deselect
  const handleBackgroundClick = () => {
    gameState.setSelectedSystemId(null);
    gameState.setSelectedTetherId(null);
  };

  // Keyboard Shortcuts
  createEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        if (gameState.viewState() === 'system') {
          gameState.exitSystemView();
        } else {
          gameState.setSelectedSystemId(null);
          gameState.setSelectedTetherId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
  });

  const selectedSystem = createMemo(() =>
    gameState.galaxyData().systems.find(s => s.id === gameState.selectedSystemId())
  );

  const viewedSystem = createMemo(() => 
    gameState.galaxyData().systems.find(s => s.id === gameState.viewSystemId())
  );

  // Get selected tether and its connected systems
  const selectedTether = createMemo(() => {
    const tetherId = gameState.selectedTetherId();
    if (!tetherId) return null;

    const [sourceId, targetId] = tetherId.split('-').map(Number);
    const galaxy = gameState.galaxyData();
    const source = galaxy.systems.find(s => s.id === sourceId);
    const target = galaxy.systems.find(s => s.id === targetId);

    if (!source || !target) return null;

    // Calculate distance between systems
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
      id: tetherId,
      source,
      target,
      distance: Math.round(distance)
    };
  });

  // Use isGameActive for button visibility (immediate), homeSystemId for UI panels (after zoom)
  const hasGameStarted = createMemo(() => gameState.homeSystemId() !== null);

  return (
    <div class="relative w-full h-screen bg-black overflow-hidden font-mono text-white select-none">
      {/* 0. Global Styles & Keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@200;300;400;500;700&display=swap');

        :root {
          --bg-black: #000000;
          --glass-bg: rgba(20, 20, 20, 0.6);
          --glass-border: rgba(255, 255, 255, 0.1);
          --glass-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }

        .font-mono { font-family: 'JetBrains Mono', monospace; }

        /* Button Reset */
        button {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          font: inherit;
          color: inherit;
          cursor: pointer;
        }

        /* Glassmorphism Panel */
        .panel-glass {
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.7);
        }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes starPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* Simpler animation for LOD low - only opacity, no filters */
        @keyframes starPulseSlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; stroke-width: 2px; }
          100% { transform: scale(12); opacity: 0; stroke-width: 0px; }
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes progressPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        /* Resource tick animation */
        @keyframes resourceTick {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        /* Ship movement animation */
        @keyframes shipMove {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        /* Fog of war fade-in animation for newly revealed elements */
        @keyframes fogFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .fog-fade-in {
          opacity: 0;
          animation: fogFadeIn 1200ms ease-out 100ms forwards;
        }

        /* Ripple Animation Class for SVG */
        .ripple-animation {
          fill: rgba(255, 255, 255, 0.15);
          stroke: rgba(255, 255, 255, 0.8);
          stroke-width: 2px;
          transform-box: fill-box;
          transform-origin: center;
          animation: ripple 0.8s ease-out forwards;
          pointer-events: none;
        }

        .star {
          animation: starPulse 4s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.65));
        }

        /* LOD (Level of Detail) optimizations - only applied when zoomed out */
        .star.lod-ultra-low {
          animation: starPulseSlow 6s ease-in-out infinite !important;
          filter: none !important;
        }

        .star.lod-low {
          animation: starPulseSlow 5s ease-in-out infinite !important;
          filter: none !important;
        }

        .selected-glow {
          filter: drop-shadow(0 0 12px rgba(255,255,255,0.9));
        }

        .lod-ultra-low.selected-glow,
        .lod-low.selected-glow {
          filter: none !important;
        }

        /* Black Hole Animations */
        .accretion-disk-back {
           transform-box: fill-box;
           transform-origin: center;
           animation: spinSlow 30s linear infinite;
        }

        .slide-in-left {
          animation: slideInLeft 0.6s ease-out 0.5s both;
          will-change: transform, opacity;
        }
        .slide-in-bottom {
          animation: fadeInUp 0.6s ease-out 0.8s both;
          will-change: transform, opacity;
        }

        /* Star Transition Glow */
        .transition-glow {
          opacity: 1 !important;
          animation: none !important;
          filter: drop-shadow(0 0 var(--transition-glow-outer, 60px) var(--star-color))
                  drop-shadow(0 0 var(--transition-glow-inner, 15px) white) !important;
          transition: filter 2s ease-in-out, opacity 1s ease-in-out;
        }

        /* Galaxy map fade is now controlled by parent container */

        /* Progress bar animation */
        .progress-fill {
          transition: width 0.15s linear;
        }

        /* Ship icon */
        .ship-icon {
          animation: shipMove 2s ease-in-out infinite;
        }

        /* Sidebar responsive widths */
        .sidebar-overview { width: 400px; }
        .sidebar-launch { width: 500px; }
        .sidebar-buildings { width: 75vw; }

        @media (max-width: 768px) {
          .sidebar-overview,
          .sidebar-launch,
          .sidebar-buildings {
            width: 100vw;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .sidebar-buildings { width: 85vw; }
          .sidebar-launch { width: min(500px, 90vw); }
          .sidebar-overview { width: min(400px, 90vw); }
        }

      `}</style>

      {/* 1. Background Grid */}
      <BackgroundGrid />

      {/* 2. Main View: Galaxy Map AND System View */}
      <div class="absolute inset-0 overflow-hidden">
        {/* Galaxy Map - Always visible, pushed to back when system view is active */}
        <div class={`absolute inset-0 transition-opacity duration-1000 ${gameState.viewState() === 'system' ? 'opacity-0 pointer-events-none' : 'opacity-100 z-10'}`}>
          <GalaxyMap
            data={gameState.galaxyData()}
            onSystemSelect={handleSystemSelect}
            onSystemDoubleSelect={(id) => gameState.enterSystemView(id)}
            onTetherSelect={handleTetherSelect}
            onBackgroundClick={handleBackgroundClick}
            selectedSystemId={gameState.selectedSystemId()}
            selectedTetherId={gameState.selectedTetherId()}
            builtFTLs={gameState.builtFTLs()}
            homeSystemId={gameState.homeSystemId()}
            ripples={gameState.ripples()}
            zoomLevel={gameState.zoomLevel()}
            setZoomLevel={gameState.setZoomLevel}
            ships={gameState.ships()}
            visibleSystems={gameState.visibleSystems()}
            fogTransitioning={gameState.fogTransitioning()}
            newlyRevealedIds={gameState.newlyRevealedIds()}
            tradeFlows={gameState.tradeFlows()}
            scanningSystem={gameState.scanningSystem()}
            ftlConstruction={gameState.ftlConstruction()}
            viewState={gameState.viewState()}
            viewSystemId={gameState.viewSystemId()}
          />
        </div>

        {/* System View - Overlay with fade in */}
        <div class={`absolute inset-0 z-20 transition-opacity duration-1000 ${gameState.viewState() === 'system' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <Show when={gameState.viewState() === 'system'}>
            <SystemView
              system={viewedSystem()}
              onBack={() => gameState.exitSystemView()}
            />
          </Show>
        </div>
      </div>

      {/* 3. UI Overlays - only shown when game is active */}
      <Show when={hasGameStarted()}>
        {/* Sidebar now handles system and tether selection */}
        {/* We rely on Sidebar.jsx to check viewState for its own slide animation */}
        <Sidebar
          system={selectedSystem()}
          tether={selectedTether()}
          onClose={() => {
            gameState.setSelectedSystemId(null);
            gameState.setSelectedTetherId(null);
          }}
          gameState={gameState}
          tradeFlows={gameState.tradeFlows()}
        />

        {/* Command Bar - Slide down when not in galaxy view */}
        <div class={`absolute bottom-10 left-6 z-40 transition-all duration-500 ${gameState.viewState() === 'galaxy' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <CommandBar gameState={gameState} />
        </div>
      </Show>

      {/* Start New Game Button - shown when no game is active */}
      <Show when={!gameState.isGameActive()}>
        <StartGameButton onClick={() => gameState.newGame()} />
      </Show>

      {/* Vignette Overlay (lighter now for better visibility) */}
      <VignetteOverlay />
    </div>
  );
}
