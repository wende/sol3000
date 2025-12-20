import { onMount, onCleanup, createEffect, createMemo, createSignal, Show } from 'solid-js';
import { createGameState } from './utils/gameState';
import { GalaxyMap } from './components/game/GalaxyMap';
import { SystemView } from './components/game/SystemView';
import { HexGrid } from './components/game/HexGrid';
import { HexBuildingMenu } from './components/game/HexBuildingMenu';
import { Sidebar } from './components/game/Sidebar';
import { CommandBar } from './components/game/CommandBar';
import { BackgroundGrid } from './components/common/BackgroundGrid';
import { StartGameButton } from './components/common/StartGameButton';
import { VignetteOverlay } from './components/common/VignetteOverlay';
import './styles/global.css';

export default function App() {
  // Initialize game state with real-time tick system
  const gameState = createGameState();

  // Hex selection and menu state
  const [selectedHexId, setSelectedHexId] = createSignal(null);
  const [showBuildingMenu, setShowBuildingMenu] = createSignal(false);

  // Handle hex click - show building menu
  const handleHexSelect = (hexId) => {
    if (hexId === null) {
      setSelectedHexId(null);
      setShowBuildingMenu(false);
      return;
    }

    setSelectedHexId(hexId);
    setShowBuildingMenu(true);
  };

  // Handle building selection from menu
  const handleBuildBuilding = (buildingKey) => {
    const hexId = selectedHexId();
    if (!hexId) return;

    const success = gameState.startHexBuilding(hexId, buildingKey);
    if (success) {
      setShowBuildingMenu(false);
      setSelectedHexId(null);
    }
  };

  // Handle building demolition
  const handleDemolishBuilding = () => {
    const hexId = selectedHexId();
    if (!hexId) return;

    const success = gameState.demolishHexBuilding(hexId);
    if (success) {
      setShowBuildingMenu(false);
      setSelectedHexId(null);
    }
  };

  // Handle menu close
  const handleCloseMenu = () => {
    setShowBuildingMenu(false);
    setSelectedHexId(null);
  };

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
        if (gameState.viewState() === 'planet') {
          gameState.exitPlanetView();
        } else if (gameState.viewState() === 'system') {
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
            isSystemVisible={gameState.isSystemVisible}
            isRouteVisible={gameState.isRouteVisible}
            shouldShowAllSystems={gameState.shouldShowAllSystems()}
          />
        </div>

        {/* System View - Overlay with fade in */}
        {/* Keep visible during planet view to prevent galaxy flash-through */}
        <div class={`absolute inset-0 z-20 transition-opacity duration-1000 ${
          gameState.viewState() === 'system' ? 'opacity-100 pointer-events-auto' :
          gameState.viewState() === 'planet' ? 'opacity-100 pointer-events-none' :
          'opacity-0 pointer-events-none'
        }`}>
          <Show when={gameState.viewState() === 'system' || gameState.viewState() === 'planet'}>
            <SystemView
              system={viewedSystem()}
              onBack={() => gameState.exitSystemView()}
              onPlanetSelect={(planetId) => gameState.enterPlanetView(planetId)}
            />
          </Show>
        </div>

        {/* Planet View (Hex Grid) - Overlay */}
        <div class={`absolute inset-0 z-30 transition-opacity duration-1000 ${gameState.viewState() === 'planet' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <Show when={gameState.viewState() === 'planet'}>
            <div class="w-full h-full relative bg-black">
              {/* Back Button */}
              <div class="absolute top-4 left-4 z-50">
                <button 
                  onClick={() => gameState.exitPlanetView()}
                  class="px-6 py-2 bg-black/50 border border-white/20 text-white hover:bg-white/10 transition-colors backdrop-blur-md"
                >
                  &larr; BACK TO SYSTEM
                </button>
              </div>
              
              <HexGrid
                hexes={(() => {
                  // Mock hex generation for now
                  const radius = 5;
                  const hexes = [];
                  for (let q = -radius; q <= radius; q++) {
                    const r1 = Math.max(-radius, -q - radius);
                    const r2 = Math.min(radius, -q + radius);
                    for (let r = r1; r <= r2; r++) {
                      hexes.push({ q, r, id: `${q},${r}` });
                    }
                  }
                  return hexes;
                })()}
                selectedHexIds={selectedHexId() ? [selectedHexId()] : []}
                hexBuildings={gameState.hexBuildings()}
                hexConstructionQueue={gameState.hexConstructionQueue()}
                onHexSelect={handleHexSelect}
              />

              {/* Building Menu Overlay */}
              <Show when={showBuildingMenu()}>
                <HexBuildingMenu
                  hexId={selectedHexId()}
                  existingBuilding={gameState.hexBuildings()[selectedHexId()]}
                  constructionInfo={(() => {
                    const hexId = selectedHexId();
                    if (!hexId) return null;
                    const queue = gameState.hexConstructionQueue();
                    const construction = queue.find(item => item.hexId === hexId);
                    if (!construction) return null;
                    const now = Date.now();
                    const elapsed = now - construction.startTime;
                    const progress = Math.min(100, (elapsed / construction.duration) * 100);
                    return {
                      progress,
                      buildingKey: construction.buildingKey
                    };
                  })()}
                  onBuild={handleBuildBuilding}
                  onDemolish={handleDemolishBuilding}
                  onClose={handleCloseMenu}
                />
              </Show>
            </div>
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
