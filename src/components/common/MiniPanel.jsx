import { splitProps } from "solid-js";

/**
 * @typedef {Object} MiniPanelProps
 * @property {import("solid-js").JSX.Element} children
 * @property {string} [class]
 * @property {import("solid-js").JSX.CSSProperties} [style]
 */

/**
 * A dark, inset glass panel used for headers, resource bars, or data displays.
 * Replaces patterns like .glass-panel-inset
 */
export const MiniPanel = (props) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <div
      class={`bg-black/40 border border-white/10 rounded-[2px] p-4 shadow-inner ${local.class || ""}`}
      style={{
        "box-shadow": "inset 0 2px 10px rgba(0,0,0,0.5)"
      }}
      {...others}
    >
      {local.children}
    </div>
  );
};
