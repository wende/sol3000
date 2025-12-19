/**
 * @typedef {Object} SystemStatsGridProps
 * @property {number} population - System population
 * @property {string} resources - Resource level ('Rich', 'Moderate', 'Poor')
 */

/**
 * Grid displaying system population and resource stats.
 *
 * @param {SystemStatsGridProps} props
 */
export const SystemStatsGrid = (props) => {
  const resourceClass = () => {
    if (props.resources === 'Rich') return 'text-green-400';
    if (props.resources === 'Poor') return 'text-red-400';
    return 'text-gray-300';
  };

  return (
    <div class="grid grid-cols-2 gap-4">
      <div class="p-4 bg-white/5 rounded-sm">
        <span class="text-[10px] text-gray-400 tracking-widest block mb-1">POPULATION</span>
        <span id="sidebar-pop-value" class="text-xl text-white">{props.population}</span>
      </div>
      <div class="p-4 bg-white/5 rounded-sm">
        <span class="text-[10px] text-gray-400 tracking-widest block mb-1">RESOURCES</span>
        <span id="sidebar-res-value" class={`text-xl ${resourceClass()}`}>
          {props.resources.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
