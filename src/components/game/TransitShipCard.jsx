import { ProgressBar } from '../common/ProgressBar';

/**
 * @typedef {Object} TransitShipCardProps
 * @property {Object} ship - The ship object
 * @property {string} destinationName - Name of destination system
 */

/**
 * Card displaying a ship in transit.
 *
 * @param {TransitShipCardProps} props
 */
export const TransitShipCard = (props) => {
  const progress = () => {
    if (!props.ship.route?.length) return 0;
    return ((props.ship.currentSegment + props.ship.segmentProgress) / props.ship.route.length) * 100;
  };

  return (
    <div class="p-3 border border-white/30 bg-white/5 rounded mb-2">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm">Colony Ship</span>
        <span class="text-xs text-gray-400">TO: {props.destinationName}</span>
      </div>
      <ProgressBar progress={progress()} />
    </div>
  );
};
