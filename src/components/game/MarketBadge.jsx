/**
 * @typedef {Object} MarketBadgeProps
 * @property {'supply' | 'demand'} type - Whether this is a supply or demand badge
 * @property {number} y - Y position offset from star center
 * @property {Object} [satisfaction] - Trade flow satisfaction data { ratio, used/satisfied, total }
 * @property {boolean} [isTransitioning] - Forces full opacity during the galaxy→system zoom
 */

/**
 * Renders a market indicator badge (M+ for supply, M- for demand)
 * with optional satisfaction percentage.
 *
 * @param {MarketBadgeProps} props
 */
export const MarketBadge = (props) => {
  const isSupply = () => props.type === 'supply';

  // Format satisfaction percentage for display
  const satisfactionText = () => {
    const sat = props.satisfaction;
    if (!sat || sat.ratio === 0) return null;
    const pct = Math.round(sat.ratio * 100);
    return `${pct}%`;
  };

  // Determine badge width based on whether we show satisfaction
  const badgeWidth = () => satisfactionText() ? 50 : 36;

  const label = () => {
    const base = isSupply() ? 'M+' : 'M-';
    const suffix = satisfactionText() ? ` ${satisfactionText()}` : '';
    return base + suffix;
  };

  return (
    <g class={`transition-opacity duration-200 pointer-events-none ${props.isTransitioning ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
      <rect
        x={-badgeWidth() / 2}
        y={props.y}
        width={badgeWidth()}
        height={16}
        rx={2}
        fill="rgba(0, 0, 0, 0.85)"
        stroke="rgba(255, 255, 255, 0.3)"
        stroke-width={1}
      />
      <text
        x={0}
        y={props.y + 12}
        text-anchor="middle"
        fill="white"
        font-size="10"
        class="tracking-widest font-mono"
      >
        {label()}
      </text>
    </g>
  );
};
