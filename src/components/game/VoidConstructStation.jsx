import { createSignal, createEffect, For, Show, onCleanup, onMount } from 'solid-js';
import { Terminal, Cpu, Zap, Activity, Grid, MousePointer2, Move, Box, Users, X, ZoomIn, ZoomOut } from 'lucide-solid';

/* VOID CONSTRUCT DESIGN SYSTEM IMPLEMENTATION

  Palette (UPDATED FOR VISIBILITY):
- Canvas: #000000
- Depth: rgba(255, 255, 255, 0.1)
- Structure: rgba(255, 255, 255, 0.2)
- Accent: rgba(255, 255, 255, 0.3)
- Borders: rgba(255, 255, 255, 0.4)
- Core: #FFFFFF
- Glow: 0 0 20px rgba(255, 255, 255, 0.6)
*/

const CELL_SIZE = 80; // px
const GRID_SIZE = 15; // 15x15 map
const TICK_RATE = 1000; // ms per movement tick
const CONSTRUCTION_DURATION = 10000; // 10 seconds build time

// --- BUILDING RENDERERS ---

const BuildingRenderer = (props) => {
  // Access neighbors reactively
  const n = () => props.neighbors?.n || false;
  const s = () => props.neighbors?.s || false;
  const e = () => props.neighbors?.e || false;
  const w = () => props.neighbors?.w || false;

  return (
    <Show when={props.type}>
      <Show when={props.type === 'COMMAND'}>
        <div class="v-grid hover-trigger w-full h-full relative">
          <div class="v-depth" style={{ "grid-area": '1 / 1 / 6 / 6' }} />
          {/* Main Pillars */}
          <div class="v-structure" style={{ "grid-area": '1 / 1 / 2 / 2' }} />
          <div class="v-structure" style={{ "grid-area": '1 / 5 / 2 / 6' }} />
          <div class="v-structure" style={{ "grid-area": '5 / 1 / 6 / 2' }} />
          <div class="v-structure" style={{ "grid-area": '5 / 5 / 6 / 6' }} />
          {/* Central Housing */}
          <div class="v-structure" style={{ "grid-area": '2 / 2 / 5 / 5' }} />
          {/* Connections */}
          <Show when={n()}><div class="v-accent" style={{ "grid-area": '1 / 3 / 2 / 4' }} /></Show>
          <Show when={s()}><div class="v-accent" style={{ "grid-area": '5 / 3 / 6 / 4' }} /></Show>
          <Show when={w()}><div class="v-accent" style={{ "grid-area": '3 / 1 / 4 / 2' }} /></Show>
          <Show when={e()}><div class="v-accent" style={{ "grid-area": '3 / 5 / 4 / 6' }} /></Show>
          {/* The Core Brain */}
          <div class="v-core pulse-anim" style={{ "grid-area": '3 / 3 / 4 / 4', "border-radius": '50%', margin: '2px' }} />
        </div>
      </Show>

      <Show when={props.type === 'CORRIDOR'}>
        <div class="v-grid w-full h-full">
          <div class="v-depth" style={{ "grid-area": '1 / 1 / 6 / 6' }} />
          {/* Center Floor - Always present */}
          <div class="v-structure-light" style={{ "grid-area": '2 / 2 / 5 / 5', opacity: 0.6 }} />
          {/* NORTH: Wall or Floor Extension */}
          <Show when={n()} fallback={<div class="v-structure" style={{ "grid-area": '1 / 2 / 2 / 5' }} />}>
            <div class="v-structure-light" style={{ "grid-area": '1 / 2 / 2 / 5', opacity: 0.6 }} />
          </Show>
          {/* SOUTH: Wall or Floor Extension */}
          <Show when={s()} fallback={<div class="v-structure" style={{ "grid-area": '5 / 2 / 6 / 5' }} />}>
            <div class="v-structure-light" style={{ "grid-area": '5 / 2 / 6 / 5', opacity: 0.6 }} />
          </Show>
          {/* WEST: Wall or Floor Extension */}
          <Show when={w()} fallback={<div class="v-structure" style={{ "grid-area": '2 / 1 / 5 / 2' }} />}>
            <div class="v-structure-light" style={{ "grid-area": '2 / 1 / 5 / 2', opacity: 0.6 }} />
          </Show>
          {/* EAST: Wall or Floor Extension */}
          <Show when={e()} fallback={<div class="v-structure" style={{ "grid-area": '2 / 5 / 5 / 6' }} />}>
            <div class="v-structure-light" style={{ "grid-area": '2 / 5 / 5 / 6', opacity: 0.6 }} />
          </Show>
          {/* Guide lights */}
          <div class="v-accent" style={{ "grid-area": '3 / 3 / 4 / 4', width: '30%', height: '30%', margin: 'auto', "border-radius": '50%' }} />
        </div>
      </Show>

      <Show when={props.type === 'REACTOR'}>
        <div class="v-grid hover-trigger w-full h-full">
          <div class="v-depth" style={{ "grid-area": '1 / 1 / 6 / 6' }} />
          {/* Containment Ring */}
          <div class="v-structure rotate-anim" style={{
            "grid-area": '1 / 1 / 6 / 6',
            "border-radius": '50%',
            border: '2px dashed rgba(255,255,255,0.4)'
          }} />
          {/* Stabilizers */}
          <div class="v-accent" style={{ "grid-area": '1 / 1 / 3 / 3', "clip-path": 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div class="v-accent" style={{ "grid-area": '1 / 4 / 3 / 6', "clip-path": 'polygon(0 0, 100% 0, 100% 100%)' }} />
          <div class="v-accent" style={{ "grid-area": '4 / 1 / 6 / 3', "clip-path": 'polygon(0 0, 0 100%, 100% 100%)' }} />
          <div class="v-accent" style={{ "grid-area": '4 / 4 / 6 / 6', "clip-path": 'polygon(100% 0, 100% 100%, 0 100%)' }} />
          {/* Connections */}
          <Show when={n()}><div class="v-structure-light" style={{ "grid-area": '1 / 3 / 2 / 4', opacity: 0.5 }} /></Show>
          <Show when={s()}><div class="v-structure-light" style={{ "grid-area": '5 / 3 / 6 / 4', opacity: 0.5 }} /></Show>
          <Show when={w()}><div class="v-structure-light" style={{ "grid-area": '3 / 1 / 4 / 2', opacity: 0.5 }} /></Show>
          <Show when={e()}><div class="v-structure-light" style={{ "grid-area": '3 / 5 / 4 / 6', opacity: 0.5 }} /></Show>
          <div class="v-core pulse-anim" style={{ "grid-area": '3 / 3 / 4 / 4', "border-radius": '50%' }} />
        </div>
      </Show>

      <Show when={props.type === 'HABITAT'}>
        <div class="v-grid hover-trigger w-full h-full">
          <div class="v-depth" style={{ "grid-area": '1 / 1 / 6 / 6' }} />
          {/* Connections */}
          <Show when={n()}><div class="v-structure-light" style={{ "grid-area": '1 / 3 / 2 / 4', opacity: 0.5 }} /></Show>
          <Show when={s()}><div class="v-structure-light" style={{ "grid-area": '5 / 3 / 6 / 4', opacity: 0.5 }} /></Show>
          <Show when={w()}><div class="v-structure-light" style={{ "grid-area": '3 / 1 / 4 / 2', opacity: 0.5 }} /></Show>
          <Show when={e()}><div class="v-structure-light" style={{ "grid-area": '3 / 5 / 4 / 6', opacity: 0.5 }} /></Show>
          {/* Pods */}
          <div class="v-structure" style={{ "grid-area": '1 / 1 / 3 / 3' }} />
          <div class="v-structure" style={{ "grid-area": '1 / 4 / 3 / 6' }} />
          <div class="v-structure" style={{ "grid-area": '4 / 1 / 6 / 3' }} />
          <div class="v-structure" style={{ "grid-area": '4 / 4 / 6 / 6' }} />
          {/* Connecting Halls */}
          <div class="v-accent" style={{ "grid-area": '3 / 1 / 4 / 6' }} />
          <div class="v-accent" style={{ "grid-area": '1 / 3 / 6 / 4' }} />
          {/* Windows */}
          <div class="v-core" style={{ "grid-area": '2 / 2 / 3 / 3', width: '4px', height: '4px' }} />
          <div class="v-core" style={{ "grid-area": '2 / 5 / 3 / 6', width: '4px', height: '4px' }} />
          <div class="v-core" style={{ "grid-area": '5 / 2 / 6 / 3', width: '4px', height: '4px' }} />
        </div>
      </Show>

      <Show when={props.type === 'SENSOR'}>
        <div class="v-grid hover-trigger w-full h-full">
          {/* Base */}
          <div class="v-depth" style={{ "grid-area": '4 / 2 / 6 / 5' }} />
          {/* Connections */}
          <Show when={n()}><div class="v-structure-light" style={{ "grid-area": '1 / 3 / 2 / 4', opacity: 0.5 }} /></Show>
          <Show when={s()}><div class="v-structure-light" style={{ "grid-area": '5 / 3 / 6 / 4', opacity: 0.5 }} /></Show>
          {/* Neck */}
          <div class="v-structure" style={{ "grid-area": '3 / 3 / 4 / 4' }} />
          {/* Dish */}
          <div class="v-structure" style={{
            "grid-area": '2 / 1 / 3 / 6',
            "clip-path": 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)',
            "margin-top": '4px'
          }} />
          {/* Emitter */}
          <div class="v-core pulse-anim" style={{
            "grid-area": '1 / 3 / 2 / 4',
            "border-radius": '50%',
            width: '50%',
            height: '50%',
            margin: 'auto'
          }} />
        </div>
      </Show>
    </Show>
  );
};

// --- MAIN APPLICATION COMPONENT ---

export default function VoidConstructStation() {
  // --- STATE ---
  const [grid, setGrid] = createSignal([]);
  const [activeBuildPos, setActiveBuildPos] = createSignal(null); // {x, y} or null
  const [characters, setCharacters] = createSignal([]);
  const [hoverPos, setHoverPos] = createSignal(null);
  const [stats, setStats] = createSignal({
    energy: 100,
    population: 5,
    stability: 98.4
  });

  // Viewport/Camera State
  const [viewport, setViewport] = createSignal({ x: 0, y: 0, scale: 1 });

  // Construction Queue State
  const [constructionQueue, setConstructionQueue] = createSignal([]); // Array of { x, y, type, startTime, duration }
  const [currentTime, setCurrentTime] = createSignal(Date.now());

  // Drag/Interaction State
  const [isGrabbing, setIsGrabbing] = createSignal(false);
  let isDragging = false;
  let startPan = { x: 0, y: 0 };
  let startViewport = { x: 0, y: 0 };
  let isDragInteraction = false;

  let containerRef;

  // --- INITIALIZATION ---
  onMount(() => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    const center = Math.floor(GRID_SIZE / 2);

    // Initial Command Center
    newGrid[center][center] = { type: 'COMMAND', rotation: 0 };

    // Initial Corridors
    newGrid[center - 1][center] = { type: 'CORRIDOR' };
    newGrid[center + 1][center] = { type: 'CORRIDOR' };
    newGrid[center][center - 1] = { type: 'CORRIDOR' };
    newGrid[center][center + 1] = { type: 'CORRIDOR' };

    setGrid(newGrid);

    // Initial Characters
    setCharacters([
      { id: 1, x: center, y: center, targetX: center, targetY: center, state: 'IDLE' },
      { id: 2, x: center - 1, y: center, targetX: center - 1, targetY: center, state: 'IDLE' },
      { id: 3, x: center, y: center + 1, targetX: center, targetY: center + 1, state: 'IDLE' }
    ]);

    // Center Viewport
    if (containerRef) {
      const rect = containerRef.getBoundingClientRect();
      const gridPixelSize = GRID_SIZE * CELL_SIZE;
      const initialX = (rect.width - gridPixelSize) / 2;
      const initialY = (rect.height - gridPixelSize) / 2;
      setViewport({ x: initialX, y: initialY, scale: 1 });
    }
  });

  // --- GAME LOOP (Simulated) ---
  createEffect(() => {
    const currentGrid = grid();

    const interval = setInterval(() => {
      // 1. Update Characters
      setCharacters(prevChars => prevChars.map(char => {
        // Simple random movement logic
        // If arrived at target, pick new neighbor
        if (char.x === char.targetX && char.y === char.targetY) {
          const neighbors = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
          ];
          // Filter valid moves (must be a building)
          const validMoves = neighbors
            .map(n => ({ x: char.x + n.dx, y: char.y + n.dy }))
            .filter(pos =>
              pos.x >= 0 && pos.x < GRID_SIZE &&
              pos.y >= 0 && pos.y < GRID_SIZE &&
              currentGrid[pos.y]?.[pos.x] !== null
            );

          if (validMoves.length > 0) {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            return { ...char, targetX: move.x, targetY: move.y };
          }
          return char;
        } else {
          // Move towards target (visually handled by CSS, logic handled here)
          return { ...char, x: char.targetX, y: char.targetY };
        }
      }));

      // 2. Update Stats (Flavor)
      setStats(prev => ({
        energy: Math.min(1000, prev.energy + 1 - (characters().length * 0.1)),
        population: prev.population,
        stability: Math.max(0, Math.min(100, prev.stability + (Math.random() * 0.2 - 0.1)))
      }));

    }, TICK_RATE);

    onCleanup(() => clearInterval(interval));
  });

  // --- CONSTRUCTION PROGRESS TIMER ---
  createEffect(() => {
    // Update current time every 100ms for smooth progress animation
    const progressInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);

    onCleanup(() => clearInterval(progressInterval));
  });

  // --- CONSTRUCTION COMPLETION CHECKER ---
  createEffect(() => {
    const now = currentTime();
    const queue = constructionQueue();

    // Find completed constructions
    const completed = queue.filter(c => now - c.startTime >= c.duration);

    if (completed.length > 0) {
      // Update grid with completed buildings
      const newGrid = grid().map(row => [...row]);

      completed.forEach(construction => {
        const { x, y, type } = construction;
        newGrid[y][x] = { type };

        // Spawn character on Habitat completion
        if (type === 'HABITAT') {
          setCharacters(prev => [
            ...prev,
            { id: Date.now(), x, y, targetX: x, targetY: y, state: 'SPAWNED' }
          ]);
          setStats(prev => ({ ...prev, population: prev.population + 1 }));
        }
      });

      setGrid(newGrid);

      // Remove completed from queue
      setConstructionQueue(prev =>
        prev.filter(c => now - c.startTime < c.duration)
      );
    }
  });

  // Helper to get construction info for a cell
  const getConstructionInfo = (x, y) => {
    const queue = constructionQueue();
    const now = currentTime();
    const construction = queue.find(c => c.x === x && c.y === y);

    if (!construction) return null;

    const elapsed = now - construction.startTime;
    const progress = Math.min(100, (elapsed / construction.duration) * 100);

    return {
      type: construction.type,
      progress,
      elapsed,
      duration: construction.duration
    };
  };

  // --- INTERACTION HANDLERS ---

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const currentViewport = viewport();
    const newScale = Math.min(Math.max(0.2, currentViewport.scale + scaleAmount), 5);

    // Zoom towards cursor logic
    const rect = containerRef.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate world point under mouse before zoom
    const worldX = (mouseX - currentViewport.x) / currentViewport.scale;
    const worldY = (mouseY - currentViewport.y) / currentViewport.scale;

    // Calculate new viewport x/y to keep world point under mouse at new scale
    const newX = mouseX - worldX * newScale;
    const newY = mouseY - worldY * newScale;

    setViewport({ x: newX, y: newY, scale: newScale });
  };

  const handleMouseDown = (e) => {
    // Only trigger on left click (button 0)
    if (e.button !== 0) return;

    isDragging = true;
    setIsGrabbing(true);
    isDragInteraction = false;
    startPan = { x: e.clientX, y: e.clientY };
    startViewport = { x: viewport().x, y: viewport().y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();

    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;

    // If moved more than threshold, consider it a drag interaction (prevents click)
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDragInteraction = true;
    }

    setViewport(prev => ({
      ...prev,
      x: startViewport.x + dx,
      y: startViewport.y + dy
    }));
  };

  const handleMouseUp = () => {
    isDragging = false;
    setIsGrabbing(false);
  };

  const handleMouseLeave = () => {
    isDragging = false;
    setIsGrabbing(false);
  };

  const handleCellClick = (x, y) => {
    // PREVENT CLICK IF DRAGGING
    if (isDragInteraction) return;

    const currentGrid = grid();
    if (currentGrid[y][x]) {
      // If clicking existing building, clear selection
      setActiveBuildPos(null);
      return;
    }

    const currentPos = activeBuildPos();
    // Toggle Selection
    if (currentPos?.x === x && currentPos?.y === y) {
      setActiveBuildPos(null); // Toggle off
    } else {
      setActiveBuildPos({x, y});
    }
  };

  const handleConstruct = (type, cost) => {
    const pos = activeBuildPos();
    if (!pos) return;
    const currentStats = stats();
    if (currentStats.energy < cost) return;

    const { x, y } = pos;

    // Check if already under construction
    const alreadyBuilding = constructionQueue().find(c => c.x === x && c.y === y);
    if (alreadyBuilding) return;

    // Deduct energy and add to construction queue
    setStats(prev => ({ ...prev, energy: prev.energy - cost }));
    setConstructionQueue(prev => [
      ...prev,
      {
        x,
        y,
        type,
        startTime: Date.now(),
        duration: CONSTRUCTION_DURATION
      }
    ]);
    setActiveBuildPos(null); // Reset selection after queueing
  };

  const getTools = () => [
    { id: 'CORRIDOR', icon: Move, label: 'Corridor', cost: 10 },
    { id: 'HABITAT', icon: Box, label: 'Habitat', cost: 25 },
    { id: 'REACTOR', icon: Zap, label: 'Reactor', cost: 50 },
    { id: 'SENSOR', icon: Activity, label: 'Sensor Array', cost: 40 },
  ];

  // --- RENDER ---
  return (
    <div class="w-full h-screen flex relative bg-black text-white select-none void-construct-station">
      {/* BACKGROUND GRID (Decorative - Static) */}
      <div
        class="absolute inset-0 pointer-events-none opacity-40"
        style={{
          "background-image": `linear-gradient(var(--void-depth) 1px, transparent 1px), linear-gradient(90deg, var(--void-depth) 1px, transparent 1px)`,
          "background-size": '20px 20px'
        }}
      />

      {/* MAIN GAME VIEW - TRANSFORM CONTAINER */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        class={`flex-1 relative overflow-hidden ${isGrabbing() ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          "background-image": `radial-gradient(circle at 50% 50%, rgba(30,30,30,0.1) 0%, #000 100%)`,
          "background-color": '#000'
        }}
      >
        {/* WORLD CONTAINER - TRANSFORMED */}
        <div
          class="relative origin-top-left"
          style={{
            width: `${GRID_SIZE * CELL_SIZE}px`,
            height: `${GRID_SIZE * CELL_SIZE}px`,
            transform: `translate(${viewport().x}px, ${viewport().y}px) scale(${viewport().scale})`,
          }}
        >
          {/* GRID RENDER */}
          <For each={grid()}>
            {(row, y) => (
              <div class="flex">
                <For each={row}>
                  {(cell, x) => {
                    // Determine neighbors for auto-tiling - must be reactive
                    const neighbors = () => {
                      const currentGrid = grid();
                      return {
                        n: y() > 0 && !!currentGrid[y()-1]?.[x()],
                        s: y() < GRID_SIZE - 1 && !!currentGrid[y()+1]?.[x()],
                        e: x() < GRID_SIZE - 1 && !!currentGrid[y()]?.[x()+1],
                        w: x() > 0 && !!currentGrid[y()]?.[x()-1],
                      };
                    };

                    const isSelected = () => {
                      const pos = activeBuildPos();
                      return pos?.x === x() && pos?.y === y();
                    };

                    const isHovered = () => {
                      const hover = hoverPos();
                      return !cell && !isSelected() && hover?.x === x() && hover?.y === y() && !isGrabbing();
                    };

                    // Reactive construction info
                    const constructionInfo = () => getConstructionInfo(x(), y());

                    return (
                      <div
                        onClick={() => handleCellClick(x(), y())}
                        onMouseEnter={() => setHoverPos({x: x(), y: y()})}
                        onMouseLeave={() => setHoverPos(null)}
                        class={`relative transition-colors duration-200 ${isSelected() ? 'selected-cell-anim z-20' : ''}`}
                        style={{
                          width: `${CELL_SIZE}px`,
                          height: `${CELL_SIZE}px`,
                          border: isSelected() ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.05)',
                          "box-sizing": 'border-box',
                          "background-color": isSelected() ? 'rgba(255,255,255,0.05)' : 'transparent'
                        }}
                      >
                        {/* Hover Ghost */}
                        <Show when={isHovered() && !constructionInfo()}>
                          <div class="absolute inset-0 bg-white/5 border border-white/20 z-10 flex items-center justify-center pointer-events-none">
                            <div class="text-[10px] text-white/50 transform scale-75">SELECT</div>
                          </div>
                        </Show>

                        {/* Active Selection Indicator */}
                        <Show when={isSelected() && !cell && !constructionInfo()}>
                          <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
                          </div>
                        </Show>

                        {/* Building Under Construction (ghost at 30% opacity + progress ring) */}
                        <Show when={constructionInfo()}>
                          <div class="w-full h-full relative">
                            {/* Ghost building at 30% opacity */}
                            <div class="w-full h-full" style={{ opacity: 0.3 }}>
                              <BuildingRenderer type={constructionInfo().type} neighbors={neighbors()} />
                            </div>
                            {/* Progress ring overlay */}
                            <svg
                              class="absolute inset-0 pointer-events-none"
                              viewBox={`0 0 ${CELL_SIZE} ${CELL_SIZE}`}
                              style={{ width: '100%', height: '100%' }}
                            >
                              {/* Background ring */}
                              <circle
                                cx={CELL_SIZE / 2}
                                cy={CELL_SIZE / 2}
                                r={CELL_SIZE * 0.4}
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.1)"
                                stroke-width="2"
                              />
                              {/* Progress ring */}
                              <circle
                                cx={CELL_SIZE / 2}
                                cy={CELL_SIZE / 2}
                                r={CELL_SIZE * 0.4}
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.9)"
                                stroke-width="2"
                                stroke-dasharray={`${(constructionInfo().progress / 100) * 2 * Math.PI * CELL_SIZE * 0.4} ${2 * Math.PI * CELL_SIZE * 0.4}`}
                                transform={`rotate(-90 ${CELL_SIZE / 2} ${CELL_SIZE / 2})`}
                                style={{ transition: 'stroke-dasharray 150ms linear' }}
                              />
                            </svg>
                          </div>
                        </Show>

                        {/* Built Structure */}
                        <Show when={cell && !constructionInfo()}>
                          <div class="w-full h-full">
                            <BuildingRenderer type={cell.type} neighbors={neighbors()} />
                          </div>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>
            )}
          </For>

          {/* CHARACTERS LAYER */}
          <For each={characters()}>
            {(char) => (
              <div
                class="character"
                style={{
                  // Center in 80px cell: 40px - 4px(half width) = 36px offset
                  top: `${(char.y * CELL_SIZE) + (CELL_SIZE / 2) - 4}px`,
                  left: `${(char.x * CELL_SIZE) + (CELL_SIZE / 2) - 4}px`,
                }}
              />
            )}
          </For>
        </div>
      </div>

      {/* UI OVERLAY - TOP LEFT INFO */}
      <div class="absolute top-4 left-4 ui-panel p-4 w-64 text-xs">
        <div class="flex items-center gap-2 mb-2 text-white/60 uppercase tracking-widest border-b border-white/20 pb-2">
          <Terminal size={14} />
          <span>System Status</span>
        </div>
        <div class="space-y-2 font-mono">
          <div class="flex justify-between">
            <span class="text-white/60">SECTOR</span>
            <span class="text-white">ALPHA-9</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">ENERGY</span>
            <span class="text-white">{Math.floor(stats().energy)} MWh</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">POPULATION</span>
            <span class="text-white">{stats().population} Units</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">STABILITY</span>
            <div class="flex items-center gap-2">
              <span class="text-white">{stats().stability.toFixed(1)}%</span>
            </div>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">ZOOM</span>
            <span class="text-white">{viewport().scale.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {/* UI OVERLAY - BOTTOM LEFT CREW LIST */}
      <div class="absolute bottom-4 left-4 ui-panel p-4 w-64 text-xs h-48 flex flex-col">
        <div class="flex items-center gap-2 mb-2 text-white/60 uppercase tracking-widest border-b border-white/20 pb-2 shrink-0">
          <Users size={14} />
          <span>Crew Manifest</span>
        </div>
        <div class="overflow-y-auto space-y-1 pr-2 flex-1 font-mono">
          <Show when={characters().length === 0}>
            <div class="text-white/30 italic">No Active Units</div>
          </Show>
          <For each={characters()}>
            {(char) => (
              <div class="flex justify-between items-center bg-white/5 p-1 px-2 border border-white/5">
                <span class="text-white/80">UNIT-{char.id.toString().slice(-4)}</span>
                <span class="text-[10px] text-white/40">{char.state}</span>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* UI OVERLAY - BOTTOM BUILD MENU (CONDITIONAL) */}
      <Show when={activeBuildPos()}>
        <div class="build-menu-wrapper">
          <div class="ui-panel px-6 py-4 flex flex-col items-center animate-in slide-in-from-bottom-4">
            <div class="text-[10px] text-white/50 mb-2 uppercase tracking-wider flex items-center gap-2">
              Deploying to sector {activeBuildPos().x}-{activeBuildPos().y}
              <button onClick={() => setActiveBuildPos(null)} class="hover:text-white"><X size={12} /></button>
            </div>
            <div class="flex gap-4">
              <For each={getTools()}>
                {(tool) => (
                  <button
                    onClick={() => handleConstruct(tool.id, tool.cost)}
                    disabled={stats().energy < tool.cost}
                    class={`tool-btn relative group flex flex-col items-center gap-2 p-3 min-w-[80px] border border-transparent hover:border-white/30 ${stats().energy < tool.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <tool.icon size={20} class="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    <span class="text-[10px] uppercase tracking-wider text-white/90">{tool.label}</span>

                    {/* Tooltip Cost */}
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-1 border border-white/20">
                      COST: {tool.cost} E
                    </div>
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>

      {/* UI OVERLAY - RIGHT CONTEXT (Design Flavor) */}
      <div class="absolute top-4 right-4 ui-panel p-2 w-48 hidden md:block">
        <div class="grid grid-cols-5 gap-1 opacity-50 mb-2">
          {/* Decorative mini grid - animated coordinate stream */}
          <For each={[...Array(25)]}>
            {(_, i) => (
              <div
                class="coordinate-dot"
                style={{
                  width: '4px',
                  height: '4px',
                  background: 'white',
                  "animation-delay": `${i() * 0.1}s`
                }}
              />
            )}
          </For>
        </div>
        <div class="text-[9px] text-white/50 font-mono">
          COORDINATE STREAM:<br/>
          X: {hoverPos() ? hoverPos().x : '--'} / Y: {hoverPos() ? hoverPos().y : '--'} <br/>
          OBJECT: {hoverPos() && grid()[hoverPos().y]?.[hoverPos().x] ? grid()[hoverPos().y][hoverPos().x].type : 'VOID'}
        </div>
      </div>
    </div>
  );
}
