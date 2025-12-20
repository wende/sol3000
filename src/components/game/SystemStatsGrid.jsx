import { StatLabel } from '../common/StatLabel';

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
        <StatLabel 
          label="POPULATION" 
          value={props.population} 
          size="xl" 
          id="sidebar-pop-value" 
        />
      </div>
      <div class="p-4 bg-white/5 rounded-sm">
        <StatLabel 
          label="RESOURCES" 
          value={props.resources.toUpperCase()} 
          size="xl" 
          valueClass={resourceClass()}
          id="sidebar-res-value" 
        />
      </div>
    </div>
  );
};
