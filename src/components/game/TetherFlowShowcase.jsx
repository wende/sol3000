import { GlassPanel } from '../common/GlassPanel';

/**
 * Showcase component for the FTL Tether flow animation.
 * Uses CSS-based dash animation with enhanced glow effect.
 * Route length matches typical FTL distances (~180px).
 */
export const TetherFlowShowcase = () => {
  // Tether coordinates (realistic FTL route length ~180px)
  const start = { x: 150, y: 100 };
  const end = { x: 330, y: 100 };

  return (
    <GlassPanel class="p-8 my-10">
      <h2 class="text-xl font-light tracking-widest text-white mb-6 pb-4">
        TRADE TETHER FLOW ANIMATION
      </h2>

      <div class="relative h-48 bg-[#0a0a0a] rounded overflow-hidden">
        {/* SVG Layer: Tether with CSS animation */}
        <svg width="100%" height="100%" class="absolute inset-0 z-0">
          <defs>
            <filter id="glow-static" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base Tether Line (Connected State) */}
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            class="ftl-line-trade-base"
          />

          {/* Flow Overlay (Animated Dashes) */}
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            class="ftl-line-trade-flow"
          />

          {/* Source System (M+ Supply) */}
          <g transform={`translate(${start.x}, ${start.y})`}>
            <circle r="6" fill="#000" stroke="white" stroke-width="1" stroke-opacity="0.5" />
            <circle r="2" fill="white" />
            <text y="20" text-anchor="middle" fill="white" font-size="10">M+</text>
          </g>

          {/* Target System (M- Demand) */}
          <g transform={`translate(${end.x}, ${end.y})`}>
            <circle r="6" fill="#000" stroke="white" stroke-width="1" stroke-opacity="0.5" />
            <circle r="2" fill="white" />
            <text y="20" text-anchor="middle" fill="white" font-size="10">M-</text>
          </g>
        </svg>

        {/* Overlay Text */}
        <div class="absolute bottom-4 left-4 text-[10px] text-gray-500 font-mono tracking-[0.3em] uppercase z-20">
          Trade_Route_Status: Active // Metals_Flow: Supply → Demand
        </div>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-4 text-[10px] text-gray-500 font-mono">
        <div>TYPE: CSS_DASH_ANIMATION</div>
        <div>SPEED: 2.5s_LOOP</div>
        <div>STYLE: HARDWARE_ACCELERATED</div>
      </div>

      <div class="mt-4 p-4 bg-white/5 rounded text-xs text-gray-400 leading-relaxed">
        <strong class="text-white">How it works:</strong> When an FTL route connects a Metals Supply (M+) system to a Metals Demand (M-) system, it becomes a "trade tether" with animated flow particles. The base line is solid white, with fast-moving glowing dashes on top to show the direction of trade.
      </div>
    </GlassPanel>
  );
};