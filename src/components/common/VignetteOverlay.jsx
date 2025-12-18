/**
 * Radial vignette overlay for visual depth.
 */
export const VignetteOverlay = () => {
  return (
    <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)]" />
  );
};
