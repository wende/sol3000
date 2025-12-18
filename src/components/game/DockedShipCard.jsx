/**
 * @typedef {Object} DockedShipCardProps
 * @property {Object} ship - The ship object
 * @property {string} systemName - Name of the system where ship is docked
 */

/**
 * Card displaying a docked ship's status.
 *
 * @param {DockedShipCardProps} props
 */
export const DockedShipCard = (props) => {
  return (
    <div class="p-3 border border-white/10 rounded mb-2 flex items-center justify-between">
      <div>
        <span class="text-sm">Colony Ship</span>
        <span class="text-xs text-gray-500 ml-2">@ {props.systemName}</span>
      </div>
      <span class="text-[10px] text-green-400">READY</span>
    </div>
  );
};
