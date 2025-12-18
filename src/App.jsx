import { onMount, onCleanup, createMemo } from 'solid-js';
import { createGameState } from './utils/gameState';
import { GalaxyMap } from './components/game/GalaxyMap';
import { Sidebar } from './components/game/Sidebar';
import { StatsPanel } from './components/game/StatsPanel';
import { CommandBar } from './components/game/CommandBar';

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

    // Add new ripple using System ID instead of screen coords
    const rippleId = Date.now();
    gameState.setRipples(prev => [...prev, { systemId: id, id: rippleId }]);

    // Cleanup ripple after animation
    setTimeout(() => {
      gameState.setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 1000);
  };

  // Keyboard Shortcuts
  onMount(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        gameState.setSelectedSystemId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const selectedSystem = createMemo(() =>
    gameState.galaxyData().systems.find(s => s.id === gameState.selectedSystemId())
  );

  const playerSystemsCount = createMemo(() =>
    gameState.galaxyData().systems.filter(s => s.owner === 'Player').length
  );

  return (
    <div class="relative w-full h-screen bg-black overflow-hidden font-mono text-white select-none">
      {/* 0. Global Styles & Keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@200;300;400;500;700&display=swap');

        :root {
          --bg-black: #000000;
          --grid-line: rgba(255, 255, 255, 0.04);
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

        /* Background Grid */
        .grid-bg {
          background-size: 60px 60px;
          background-image:
            linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
          animation: gridInit 2s ease-out forwards;
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
        @keyframes gridInit {
          0% { opacity: 0; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }

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
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        /* Simpler animation for LOD low - only opacity, no filters */
        @keyframes starPulseSlow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.9; }
        }

        @keyframes ftlFlow {
          to { stroke-dashoffset: -20; }
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
          filter: drop-shadow(0 0 6px rgba(255,255,255,0.5));
        }

        /* LOD (Level of Detail) optimizations - only applied when zoomed out */
        .star.lod-ultra-low {
          animation: none !important;
          filter: none !important;
        }

        .star.lod-low {
          animation: starPulseSlow 6s ease-in-out infinite !important;
          filter: none !important;
        }

        .selected-glow {
          filter: drop-shadow(0 0 12px rgba(255,255,255,0.9));
        }

        .lod-ultra-low.selected-glow,
        .lod-low.selected-glow {
          filter: none !important;
        }

        .ftl-line {
          stroke: rgba(255, 255, 255, 0.3);
          stroke-width: 1.5px;
          stroke-dasharray: 4, 4;
          animation: ftlFlow 60s linear infinite;
          will-change: stroke-dashoffset;
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

        .galaxy-map-svg {
          opacity: 0;
          animation: fadeInUp 1s ease-out 0.2s forwards;
        }

        /* Progress bar animation */
        .progress-fill {
          transition: width 0.1s linear;
        }

        /* Ship icon */
        .ship-icon {
          animation: shipMove 2s ease-in-out infinite;
        }

      `}</style>

      {/* 1. Background Grid */}
      <div class="absolute inset-0 grid-bg pointer-events-none" />

      {/* 2. Full Screen Map Container */}
      <div class="absolute inset-0 overflow-hidden">
        <GalaxyMap
          data={gameState.galaxyData()}
          onSystemSelect={handleSystemSelect}
          selectedSystemId={gameState.selectedSystemId()}
          homeSystemId={gameState.homeSystemId()}
          ripples={gameState.ripples()}
          zoomLevel={gameState.zoomLevel()}
          setZoomLevel={gameState.setZoomLevel}
          ships={gameState.ships()}
        />
      </div>

      {/* 3. UI Overlays */}

      {/* Sidebar now handles system selection */}
      <Sidebar
        system={selectedSystem()}
        onClose={() => gameState.setSelectedSystemId(null)}
        gameState={gameState}
      />

      {/* Stats Moved to Left - Now shows real-time resources */}
      <StatsPanel
        resources={gameState.resources()}
        productionRates={gameState.productionRates()}
        systemsOwned={playerSystemsCount()}
        maxSystems={gameState.galaxyData().systems.length}
        onNewGame={gameState.newGame}
        tech={gameState.tech()}
      />

      <CommandBar gameState={gameState} />

      {/* Vignette Overlay (lighter now for better visibility) */}
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
