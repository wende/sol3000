import { Show } from 'solid-js';
import { X, Crosshair, Link } from 'lucide-solid';

/**
 * @typedef {Object} SidebarHeaderProps
 * @property {Object|null} system - The selected system
 * @property {Object|null} tether - The selected tether
 * @property {Function} onClose - Callback to close sidebar
 * @property {Function} onBack - Callback to go back to overview (only shown if not in overview)
 * @property {boolean} isInOverview - Whether currently in overview view
 */

/**
 * Sidebar Header - displays system/tether name and navigation buttons
 *
 * @param {SidebarHeaderProps} props
 */
export const SidebarHeader = (props) => {
  return (
    <div class="h-48 w-full bg-gradient-to-b from-white/10 to-transparent relative">
      <div class="absolute top-4 right-4 z-10">
        <button
          id="sidebar-close-btn"
          onClick={() => (props.isInOverview ? props.onClose() : props.onBack())}
          class="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} class="text-white" />
        </button>
      </div>

      {/* System Header */}
      <Show when={props.system}>
        <div class="absolute bottom-6 left-6">
          <div class="flex items-center space-x-2 text-blue-300 mb-1">
            <Crosshair size={14} />
            <span class="text-[10px] tracking-widest">SELECTED SYSTEM</span>
          </div>
          <h2 id="sidebar-system-name" class="text-3xl font-light text-white tracking-widest font-mono">
            {props.system.name}
          </h2>
          <Show when={!props.isInOverview}>
            <button
              id="sidebar-back-btn"
              onClick={props.onBack}
              class="mt-2 text-[10px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              &larr; BACK TO OVERVIEW
            </button>
          </Show>
        </div>
      </Show>

      {/* Tether Header */}
      <Show when={props.tether}>
        <div class="absolute bottom-6 left-6">
          <div class="flex items-center space-x-2 text-blue-300 mb-1">
            <Link size={14} />
            <span class="text-[10px] tracking-widest">FTL ROUTE</span>
          </div>
          <h2 class="text-2xl font-light text-white tracking-widest font-mono">
            {props.tether.source.name} → {props.tether.target.name}
          </h2>
        </div>
      </Show>
    </div>
  );
};
