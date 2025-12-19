import { splitProps } from "solid-js";

/**
 * @typedef {Object} DemoContainerProps
 * @property {string} [id] - The HTML id attribute
 * @property {string} [class] - Additional CSS classes
 * @property {import("solid-js").JSX.Element} children - The content to render inside the container
 * @property {'gradient' | 'solid' | 'transparent'} [background='transparent'] - Background style variant
 * @property {string} [label] - Optional label to display at the bottom
 */

/**
 * A demonstration container component for showcasing background elements.
 * Provides consistent styling for component library examples.
 *
 * @param {DemoContainerProps} props
 */
export const DemoContainer = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "background", "label"]);

  const background = local.background || 'transparent';

  // Define background styles for each variant
  const backgroundStyles = {
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    solid: "#333",
    transparent: "transparent"
  };

  return (
    <div
      class={`relative h-48 border-2 border-white/20 rounded overflow-hidden ${local.class || ""}`}
      style={{ background: backgroundStyles[background] }}
      {...others}
    >
      {local.children}
      {local.label && (
        <div class="absolute bottom-4 left-4">
          <span class="text-xs text-gray-400 tracking-widest">{local.label}</span>
        </div>
      )}
    </div>
  );
};
