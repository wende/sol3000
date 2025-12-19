import { render } from 'solid-js/web';
import './index.css';
import { ResourceIconShowcase } from './components/game/ResourceIconShowcase';
import { BuildingIconShowcase } from './components/game/BuildingIconShowcase';

function IconsApp() {
  return (
    <div class="min-h-screen py-20 px-12">
      <div class="max-w-4xl mx-auto mb-12 text-center">
        <h1 class="text-3xl font-light text-white tracking-[0.2em] uppercase mb-4">
          Icon System
        </h1>
        <p class="text-gray-500 text-sm max-w-xl mx-auto">
          Stylistically coherent vector icons designed for Sol3000.
          Built using geometric primitives with a consistent 2px stroke weight.
        </p>
      </div>
      
      <ResourceIconShowcase />
      <BuildingIconShowcase />

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
render(() => <IconsApp />, root);
