import { For } from 'solid-js';
import { ResourceIcon } from '../common/ResourceIcon';
import { GlassPanel } from '../common/GlassPanel';

/**
 * A showcase component to preview the stylistically coherent resource icons.
 */
export const ResourceIconShowcase = () => {
  const resources = [
    { type: 'metals', label: 'Metals', description: 'Foundation of industry (Fe, Ni, Al, Ti, W)' },
    { type: 'volatiles', label: 'Volatiles', description: 'Life support and fuel (H₂O, CH₄, NH₃)' },
    { type: 'nobleGases', label: 'Noble Gases', description: 'Propulsion technology (Xe, Kr, Ar)' },
    { type: 'rareEarths', label: 'Rare Earths', description: 'Electronics and sensors (Lanthanides, Y)' },
    { type: 'isotopes', label: 'Isotopes', description: 'Power generation and fusion (He-3, U, D)' },
    { type: 'exotics', label: 'Exotics', description: 'End-game wonders and artifacts' },
    { type: 'credits', label: 'Credits', description: 'Interstellar currency' }
  ];

  return (
    <GlassPanel class="p-8 my-10">
      <h2 class="text-xl font-light tracking-widest text-white mb-6 pb-4">
        RESOURCE ICON SYSTEM
      </h2>

      <div class="space-y-4">
        <For each={resources}>
          {(res) => (
            <div class="flex items-center gap-6 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div class="flex-grow">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold tracking-wider text-white uppercase">{res.label}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {res.type}
                  </span>
                </div>
                <p class="text-xs text-gray-400 mt-1">{res.description}</p>
              </div>

              <div class="flex gap-4">
                <ResourceIcon type={res.type} size={16} class="text-gray-500" />
                <ResourceIcon type={res.type} size={20} class="text-gray-400" />
                <ResourceIcon type={res.type} size={24} class="text-white" />
                <ResourceIcon type={res.type} size={32} class="text-blue-400" />
              </div>
            </div>
          )}
        </For>
      </div>

      <div class="mt-8 pt-4">
        <p class="text-[10px] text-gray-500 uppercase tracking-tighter italic">
          Coherent geometric design language • 2px stroke weight • Responsive scaling
        </p>
      </div>
    </GlassPanel>
  );
};
