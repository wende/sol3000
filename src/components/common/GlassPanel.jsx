import { splitProps } from "solid-js";

/**
 * @typedef {Object} GlassPanelProps
 * @property {string} [id] - The HTML id attribute
 * @property {string} [class] - Additional CSS classes
 * @property {import("solid-js").JSX.Element} children - The content to render inside the panel
 * @property {import("solid-js").JSX.CSSProperties} [style] - Inline styles (use variant prop instead when possible)
 * @property {'default' | 'highlighted' | 'warning' | 'selected' | 'sidebar' | 'overlay'} [variant='default'] - Visual variant of the panel
 */

/**
 * A container component that applies the glassmorphism effect.
 *
 * @param {GlassPanelProps} props
 */
export const GlassPanel = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "style", "variant"]);

  const variant = local.variant || 'default';

  // Define background colors for each variant
  const variantBackgrounds = {
    default: "rgba(0, 0, 0, 0.4)",
    highlighted: "rgba(59, 130, 246, 0.1)",
    warning: "rgba(239, 68, 68, 0.1)",
    selected: "rgba(59, 130, 246, 0.15)",
    sidebar: "rgba(0, 0, 0, 0.4)",
    overlay: "rgba(0, 0, 0, 0.6)"
  };

  // Define border classes for each variant
  const variantBorders = {
    default: "",
    highlighted: "border border-blue-500/30",
    warning: "border border-red-500/30",
    selected: "border border-blue-500/30",
    sidebar: "border-r border-white/10",
    overlay: "border-t border-white/10"
  };

  return (
    <div
      class={`panel-glass ${variantBorders[variant]} ${local.class || ""}`}
      style={{
        "background": variantBackgrounds[variant],
        "backdrop-filter": "blur(16px)",
        "-webkit-backdrop-filter": "blur(16px)",
        ...local.style
      }}
      {...others}
    >
      {local.children}
    </div>
  );
};
