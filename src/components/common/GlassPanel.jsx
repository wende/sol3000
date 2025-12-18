import { splitProps } from "solid-js";

/**
 * @typedef {Object} GlassPanelProps
 * @property {string} [id] - The HTML id attribute
 * @property {string} [class] - Additional CSS classes
 * @property {import("solid-js").JSX.Element} children - The content to render inside the panel
 * @property {import("solid-js").JSX.CSSProperties} [style] - Inline styles
 */

/**
 * A container component that applies the glassmorphism effect.
 * 
 * @param {GlassPanelProps} props
 */
export const GlassPanel = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "style"]);

  return (
    <div
      class={`panel-glass ${local.class || ""}`}
      style={{
        "background": "rgba(0, 0, 0, 0.9)", 
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
