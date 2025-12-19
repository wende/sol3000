/**
 * @typedef {Object} StartGameButtonProps
 * @property {() => void} onClick - Callback when button is clicked
 */

/**
 * Centered "Start New Game" button shown before game begins.
 *
 * @param {StartGameButtonProps} props
 */
export const StartGameButton = (props) => {
  return (
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      <button
        class="pointer-events-auto text-xl font-medium tracking-wide text-white
               hover:opacity-70 transition-opacity duration-200 cursor-pointer"
        style="animation: fadeInUp 1s ease-out 0.5s both;"
        onClick={props.onClick}
      >
        Start New Game
      </button>
    </div>
  );
};
