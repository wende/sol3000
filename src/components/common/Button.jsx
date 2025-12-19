import { splitProps, Show } from 'solid-js';

/**
 * @typedef {'command' | 'primary' | 'secondary' | 'glass' | 'icon' | 'text' | 'success'} ButtonVariant
 */

/**
 * @typedef {Object} ButtonProps
 * @property {import('solid-js').JSX.Element} [children] - Button content
 * @property {import('solid-js').JSX.Element} [icon] - Icon element
 * @property {string} [label] - Label for command variant (displayed below icon)
 * @property {ButtonVariant} [variant='glass'] - Button style variant
 * @property {boolean} [danger] - Use danger colors (for command variant)
 * @property {boolean} [disabled] - Whether button is disabled
 * @property {boolean} [fullWidth] - Whether button takes full width
 * @property {string} [class] - Additional CSS classes
 * @property {() => void} [onClick] - Click handler
 */

/**
 * Reusable button component matching existing Sol3000 styles.
 *
 * Variants (from actual codebase usage):
 * - `command`: Circular icon button with label below (CommandBar style)
 * - `primary`: White bg, black text (MANAGE BUILDINGS style)
 * - `secondary`: White/10 bg with border (SCAN SYSTEM style)
 * - `glass`: Small glass button (Build/Upgrade style from BuildingList)
 * - `icon`: Icon only with hover background (close button style)
 * - `text`: Text only with hover color change (back button style)
 * - `success`: Green background (LAUNCH button style)
 *
 * @param {ButtonProps & import('solid-js').JSX.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export const Button = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'icon',
    'label',
    'variant',
    'danger',
    'disabled',
    'fullWidth',
    'class',
    'onClick',
  ]);

  const variant = () => local.variant || 'glass';

  // Command variant: circular icon + label below (CommandBar.jsx style)
  // Copied exactly from CommandBar.jsx
  if (variant() === 'command') {
    const hoverBg = local.danger
      ? 'group-hover:bg-red-500/10'
      : 'group-hover:bg-blue-500/10';
    const labelHover = local.danger
      ? 'group-hover:text-red-300'
      : 'group-hover:text-gray-300';

    return (
      <button
        class={`flex flex-col items-center group ${local.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${local.class || ''}`}
        style="display: flex; flex-direction: column; align-items: center;"
        onClick={local.disabled ? undefined : local.onClick}
        disabled={local.disabled}
        {...others}
      >
        <div
          class={`w-10 h-10 flex items-center justify-center ${hoverBg} transition-all`}
          style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;"
        >
          {local.icon}
        </div>
        <span class={`text-[9px] tracking-widest text-gray-500 ${labelHover} mt-1`} style="text-align: center;">
          {local.label}
        </span>
      </button>
    );
  }

  // Icon variant: icon only with hover background (Modal close, Sidebar close)
  if (variant() === 'icon') {
    return (
      <button
        class={`p-2 hover:bg-white/10 rounded ${local.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${local.class || ''}`}
        onClick={local.disabled ? undefined : local.onClick}
        disabled={local.disabled}
        {...others}
      >
        {local.icon}
      </button>
    );
  }

  // Text variant: text only with hover color (back button style)
  if (variant() === 'text') {
    return (
      <button
        class={`text-[10px] text-gray-500 hover:text-white transition-colors tracking-widest ${local.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${local.class || ''}`}
        onClick={local.disabled ? undefined : local.onClick}
        disabled={local.disabled}
        {...others}
      >
        {local.children}
      </button>
    );
  }

  // Primary variant: white bg, black text (MANAGE BUILDINGS style)
  if (variant() === 'primary') {
    return (
      <button
        class={`${local.fullWidth ? 'w-full' : ''} bg-white text-black py-3 text-xs tracking-[0.2em] font-bold hover:bg-gray-200 transition-colors ${local.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${local.class || ''}`}
        onClick={local.disabled ? undefined : local.onClick}
        disabled={local.disabled}
        {...others}
      >
        {local.icon && <span class="mr-2">{local.icon}</span>}
        {local.children}
      </button>
    );
  }

  // Secondary variant: white/10 bg (SCAN SYSTEM style)
  if (variant() === 'secondary') {
    return (
      <button
        class={`${local.fullWidth ? 'w-full' : ''} bg-white/10 text-white py-3 text-xs tracking-[0.2em] font-bold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${local.class || ''}`}
        onClick={local.disabled ? undefined : local.onClick}
        disabled={local.disabled}
        {...others}
      >
        {local.icon && <span class="mr-2">{local.icon}</span>}
        {local.children}
      </button>
    );
  }

  // Success variant: green background (LAUNCH button style)
  if (variant() === 'success') {
    return (
      <button
        class={`text-xs bg-green-500/20 hover:bg-green-500/30 px-3 py-1 rounded transition-colors ${local.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${local.class || ''}`}
        onClick={local.disabled ? undefined : local.onClick}
        disabled={local.disabled}
        {...others}
      >
        {local.icon && <span class="mr-2">{local.icon}</span>}
        {local.children}
      </button>
    );
  }

  // Glass variant (default): BuildingList glass-button style
  return (
    <button
      class={`glass-button ${local.disabled ? 'opacity-30 cursor-not-allowed' : ''} ${local.class || ''}`}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '8px 16px',
        'font-size': '11px',
        'font-weight': '500',
        'letter-spacing': '0.1em',
        color: 'white',
        cursor: local.disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        'text-transform': 'uppercase',
      }}
      onClick={local.disabled ? undefined : local.onClick}
      disabled={local.disabled}
      {...others}
    >
      {local.icon && <span class="mr-2">{local.icon}</span>}
      {local.children}
    </button>
  );
};
