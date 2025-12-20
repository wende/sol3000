import { render } from 'solid-js/web';
import { createSignal } from 'solid-js';
import { HexGrid } from './components/game/HexGrid';
import './index.css';

const App = () => {
  const [selectedHexIds, setSelectedHexIds] = createSignal([]);

  // Generate a hexagonal map of hexes
  // Spiral generation or just a rectangle of hexes
  const generateHexMap = (radius) => {
    const hexes = [];
    let id = 0;
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        hexes.push({ q, r, id: id++ });
      }
    }
    return hexes;
  };

  const hexData = generateHexMap(5); // Radius 5 grid

  const handleHexSelect = (id) => {
    if (id === null) {
      setSelectedHexIds([]);
      return;
    }
    setSelectedHexIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter(pid => pid !== id);
      }
      return [...prev, id];
    });
  };

  return (
    <div class="w-screen h-screen bg-black overflow-hidden text-white font-sans">
      <div class="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 class="text-2xl font-light text-white/90 tracking-widest uppercase">Hex Grid</h1>
        <p class="text-xs text-white/40 mt-1">PAN: DRAG | ZOOM: SCROLL | SELECT: CLICK</p>
        <div class="mt-4 text-xs text-white/30 font-mono">
          SELECTION: {selectedHexIds().length > 0 ? selectedHexIds().join(', ') : 'NONE'}
        </div>
      </div>
      
      <HexGrid 
        hexes={hexData} 
        selectedHexIds={selectedHexIds()} 
        onHexSelect={handleHexSelect} 
      />
    </div>
  );
};

render(() => <App />, document.getElementById('root'));
