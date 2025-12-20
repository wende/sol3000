import { For, createSignal, Show, createMemo } from 'solid-js';
import { BUILDING_DEFINITIONS } from './Buildings';

/**
 * Building menu for hex grid - allows selecting buildings by category
 * @param {Object} props
 * @param {string} props.hexId - The hex ID (e.g., "0,0")
 * @param {string|null} props.existingBuilding - Key of existing building, or null
 * @param {Object|null} props.constructionInfo - Construction info if building in progress: { progress, buildingKey }
 * @param {Function} props.onBuild - Callback when a building is selected: (buildingKey) => void
 * @param {Function} props.onDemolish - Callback when demolish is clicked: () => void
 * @param {Function} props.onClose - Callback when menu is closed: () => void
 * @param {number} props.x - Screen X position
 * @param {number} props.y - Screen Y position
 */
export const HexBuildingMenu = (props) => {
  const [selectedCategory, setSelectedCategory] = createSignal(null);

  // Group buildings by category
  const buildingsByCategory = createMemo(() => {
    const categories = {};
    Object.entries(BUILDING_DEFINITIONS).forEach(([key, building]) => {
      if (!categories[building.category]) {
        categories[building.category] = [];
      }
      categories[building.category].push({ key, ...building });
    });
    return categories;
  });

  const categories = createMemo(() => Object.keys(buildingsByCategory()).sort());

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBuildingClick = (buildingKey) => {
    props.onBuild?.(buildingKey);
  };

  const handleDemolish = () => {
    props.onDemolish?.();
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      props.onClose?.();
    }
  };

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackgroundClick}
    >
      <div class="panel-glass p-6 min-w-[400px] max-w-[600px]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">
            {props.constructionInfo ? 'CONSTRUCTION IN PROGRESS' : props.existingBuilding ? 'BUILDING OPTIONS' : 'BUILD MENU'}
          </h2>
          <button
            onClick={props.onClose}
            class="px-3 py-1 border border-white/20 hover:bg-white/10 transition-colors"
          >
            CLOSE
          </button>
        </div>

        {/* Construction in progress */}
        <Show when={props.constructionInfo}>
          <div class="p-4 border border-white/20">
            <div class="mb-2">
              <span class="text-white/60">Building:</span>
              <span class="ml-2 font-bold">
                {BUILDING_DEFINITIONS[props.constructionInfo.buildingKey]?.name || props.constructionInfo.buildingKey.toUpperCase()}
              </span>
            </div>
            <div class="mb-2">
              <span class="text-white/60">Progress:</span>
              <span class="ml-2 font-bold">{Math.floor(props.constructionInfo.progress)}%</span>
            </div>
            <div class="text-white/40 text-center text-sm mt-3">
              Construction in progress. Please wait...
            </div>
          </div>
        </Show>

        <Show when={props.existingBuilding && !props.constructionInfo}>
          <div class="mb-4 p-4 border border-white/20">
            <div class="mb-2">
              <span class="text-white/60">Current Building:</span>
              <span class="ml-2 font-bold">
                {BUILDING_DEFINITIONS[props.existingBuilding]?.name || props.existingBuilding.toUpperCase()}
              </span>
            </div>
            <Show when={props.existingBuilding !== 'nexus'}>
              <button
                onClick={handleDemolish}
                class="w-full px-4 py-2 bg-red-900/30 border border-red-500/50 hover:bg-red-900/50 transition-colors"
              >
                DEMOLISH
              </button>
            </Show>
            <Show when={props.existingBuilding === 'nexus'}>
              <div class="text-white/40 text-center text-sm">
                Nexus cannot be demolished
              </div>
            </Show>
          </div>
        </Show>

        <Show when={!props.existingBuilding && !props.constructionInfo}>
          <Show when={!selectedCategory()}>
            <div class="space-y-2">
              <div class="text-white/60 mb-3">Select a category:</div>
              <For each={categories()}>
                {(category) => (
                  <button
                    onClick={() => handleCategoryClick(category)}
                    class="w-full px-4 py-3 border border-white/20 hover:bg-white/10 transition-colors text-left"
                  >
                    {category}
                  </button>
                )}
              </For>
            </div>
          </Show>

          <Show when={selectedCategory()}>
            <div class="mb-3">
              <button
                onClick={() => setSelectedCategory(null)}
                class="text-white/60 hover:text-white transition-colors"
              >
                &larr; Back to Categories
              </button>
            </div>
            <div class="space-y-2">
              <div class="text-white/60 mb-3">
                Select a building from {selectedCategory()}:
              </div>
              <For each={buildingsByCategory()[selectedCategory()]}>
                {(building) => (
                  <button
                    onClick={() => handleBuildingClick(building.key)}
                    class="w-full px-4 py-3 border border-white/20 hover:bg-white/10 transition-colors text-left"
                  >
                    <div class="font-bold">{building.name}</div>
                    <div class="text-sm text-white/40 mt-1">
                      Build time: 10s
                    </div>
                  </button>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
};
