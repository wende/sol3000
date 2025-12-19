import { For } from 'solid-js';
import { BuildingIcon } from '../common/BuildingIcon';
import { GlassPanel } from '../common/GlassPanel';

/**
 * Showcase for the building icons.
 */
export const BuildingIconShowcase = () => {
  const buildings = [
    { type: 'stargate', label: 'Star Gate', description: 'Instant travel between systems' },
    { type: 'dockingHub', label: 'Docking Hub', description: 'Fleet capacity and repair station' },
    { type: 'logisticsCenter', label: 'Logistics Center', description: 'Resource distribution and efficiency' }
  ];

  return (
    <GlassPanel class="p-8 max-w-2xl mx-auto my-10">
      <h2 class="text-xl font-light tracking-widest text-white mb-6 border-b border-white/10 pb-4">
        BUILDING ICON SYSTEM
      </h2>
      
      <div class="space-y-4">
        <For each={buildings}>
          {(b) => (
            <div class="flex items-center gap-6 p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div class="flex-grow">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold tracking-wider text-white uppercase">{b.label}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {b.type}
                  </span>
                </div>
                <p class="text-xs text-gray-400 mt-1">{b.description}</p>
              </div>

              <div class="flex gap-4">
                <BuildingIcon type={b.type} size={16} class="text-gray-500" />
                <BuildingIcon type={b.type} size={20} class="text-gray-400" />
                <BuildingIcon type={b.type} size={24} class="text-white" />
                <BuildingIcon type={b.type} size={32} class="text-purple-400" />
              </div>
            </div>
          )}
        </For>
      </div>
    </GlassPanel>
  );
};
