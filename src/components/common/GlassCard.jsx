import { splitProps } from "solid-js";

/**
 * @typedef {Object} GlassCardProps
 * @property {import("solid-js").JSX.Element} children
 * @property {string} [class]
 * @property {boolean} [interactive] - Whether the card has hover effects
 * @property {'default' | 'active' | 'queued'} [variant] - Visual state
 * @property {import("solid-js").JSX.CSSProperties} [style]
 */

/**
 * A glassmorphism card component, commonly used for list items or interactive rows.
 * Replaces patterns like .glass-panel-row
 */
export const GlassCard = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "variant", "interactive"]);

  const variant = () => local.variant || 'default';
  
  const baseClasses = "relative flex items-center p-4 transition-all duration-200 border overflow-hidden";
  
  // Backgrounds and borders based on variant
  // Note: These map to the .glass-panel-row styles
  const variantStyles = () => {
    switch (variant()) {
      case 'active':
        return "bg-blue-500/5 border-blue-500/30";
      case 'queued':
        return "bg-gray-500/5 border-gray-500/30";
      default:
        return "bg-white/[0.02] border-white/[0.08]";
    }
  };

  // Hover effects
  const interactiveClasses = () => local.interactive !== false 
    ? "hover:bg-white/5 hover:border-white/20 hover:translate-x-[2px] cursor-pointer" 
    : "";

  // The colored accent line on the left
  const accentLine = () => {
    let colorClass = "bg-transparent";
    if (variant() === 'active') colorClass = "bg-blue-500";
    if (variant() === 'queued') colorClass = "bg-gray-500";
    // Interactive default hover is handled by CSS in BuildingList currently, 
    // but we can make this component self-contained.
    
    return (
      <div 
        class={`absolute left-0 top-0 bottom-0 w-[2px] transition-colors duration-200 ${colorClass} ${local.interactive !== false && variant() === 'default' ? 'group-hover:bg-white' : ''}`} 
      />
    );
  };

  return (
    <div
      class={`glass-card group ${baseClasses} ${variantStyles()} ${interactiveClasses()} ${local.class || ""}`}
      {...others}
    >
      {accentLine()}
      {local.children}
    </div>
  );
};
