/**
 * @typedef {Object} ProgressBarProps
 * @property {number} progress - Progress percentage (0-100)
 * @property {string} [color] - Fill color class (default: "bg-white")
 * @property {string} [height] - Height class (default: "h-1")
 * @property {boolean} [glow] - Whether to add glow effect
 */

/**
 * Simple progress bar component.
 *
 * @param {ProgressBarProps} props
 */
export const ProgressBar = (props) => {
  const color = () => props.color || 'bg-white';
  const height = () => props.height || 'h-1';

  return (
    <div class={`w-full ${height()} bg-white/10 rounded-full overflow-hidden`}>
      <div
        class={`${height()} ${color()} transition-all duration-100 ${props.glow ? 'shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}
        style={{ width: `${Math.min(100, Math.max(0, props.progress))}%` }}
      />
    </div>
  );
};
