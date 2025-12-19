import { Show, createMemo } from 'solid-js';

/**
 * @typedef {Object} FTLRouteProps
 * @property {Object} route - The route object with source and target systems
 * @property {string} routeId - The unique ID for this route
 * @property {boolean} isVisible - Whether the route is visible (fog of war)
 * @property {boolean} shouldFade - Whether the route should fade out (during fog transition)
 * @property {boolean} shouldFadeIn - Whether the route should fade in (newly revealed)
 * @property {boolean} isSelected - Whether this route is currently selected
 * @property {boolean} isDimmed - Whether the route is dimmed (fog of war hint)
 * @property {Set} builtFTLs - Set of built FTL route IDs
 * @property {Object|null} ftlConstruction - FTL construction state { tetherId, startTime, duration }
 * @property {boolean} connectsMetalsSupplyDemand - Whether route connects supply to demand
 * @property {boolean} tradeReverse - Whether flow direction should be reversed (demand→supply in route coords)
 * @property {Function} onSelect - Callback when route is selected
 * @property {number} [throughput] - Flow throughput on this route (optional)
 */

/**
 * Renders a single FTL route between two systems
 *
 * @param {FTLRouteProps} props
 */
export const FTLRoute = (props) => {
  // Compute isBuilt reactively - this will update when builtFTLs changes
  const isBuilt = () => props.builtFTLs?.has(props.routeId);
  const isTrade = () => isBuilt() && props.connectsMetalsSupplyDemand;

  // Check if this route is under construction
  const isUnderConstruction = () => {
    const construction = props.ftlConstruction;
    if (!construction) return false;
    return construction.tetherId === props.routeId;
  };

  // Get construction duration for CSS animation
  const constructionDuration = () => {
    const construction = props.ftlConstruction;
    if (!construction || construction.tetherId !== props.routeId) return 0;
    return construction.duration;
  };

  // Calculate the line length
  const lineLength = createMemo(() => {
    const dx = props.route.target.x - props.route.source.x;
    const dy = props.route.target.y - props.route.source.y;
    return Math.sqrt(dx * dx + dy * dy);
  });

  // Calculate midpoint for throughput label
  const midX = () => (props.route.source.x + props.route.target.x) / 2;
  const midY = () => (props.route.source.y + props.route.target.y) / 2;

  // Format throughput for display (only show if > 0)
  const throughputText = () => {
    const t = props.throughput;
    if (!t || t <= 0) return null;
    return Math.round(t);
  };

  const lineClass = () => {
    if (props.isDimmed) return 'ftl-line-dimmed';
    if (props.isSelected && isBuilt()) return 'ftl-line-built-selected';
    if (props.isSelected) return 'ftl-line-selected';
    if (isBuilt()) return 'ftl-line-built';
    return 'ftl-line';
  };

  const tradeBaseClass = () => {
    if (props.isSelected) return 'ftl-line-trade-base-selected';
    return 'ftl-line-trade-base';
  };

  const tradeFlowClass = () => {
    const direction = props.tradeReverse ? 'reverse' : 'forward';
    if (props.isSelected) return `ftl-line-trade-flow ${direction} selected`;
    return `ftl-line-trade-flow ${direction}`;
  };

  // Determine opacity: fade-in animation handles its own opacity
  const getOpacityStyle = () => {
    if (props.shouldFadeIn) return {}; // Let CSS animation control opacity
    return {
      opacity: props.shouldFade ? 0 : 1,
      transition: 'opacity 700ms ease-out'
    };
  };

  return (
    <g class="cursor-pointer">
      {/* Invisible wider hit area for easier clicking */}
      <line
        x1={props.route.source.x}
        y1={props.route.source.y}
        x2={props.route.target.x}
        y2={props.route.target.y}
        stroke="transparent"
        stroke-width="15"
        onClick={(e) => {
          e.stopPropagation();
          props.onSelect(props.routeId);
        }}
      />
      {/* Visible line */}
      <Show
        when={isTrade()}
        fallback={
          <Show
            when={isUnderConstruction()}
            fallback={
              <line
                x1={props.route.source.x}
                y1={props.route.source.y}
                x2={props.route.target.x}
                y2={props.route.target.y}
                class={`${lineClass()} ${props.shouldFadeIn ? 'fog-fade-in' : ''}`}
                style={getOpacityStyle()}
              />
            }
          >
            {/* FTL Construction Animation - fills from both ends using CSS animation */}
            {(() => {
              const length = lineLength();
              const halfLength = length / 2;
              const duration = constructionDuration();
              const durationSec = duration / 1000;

              return (
                <>
                  {/* Background dashed line (unbuilt portion) */}
                  <line
                    x1={props.route.source.x}
                    y1={props.route.source.y}
                    x2={props.route.target.x}
                    y2={props.route.target.y}
                    class="ftl-line-construction-bg"
                    style={getOpacityStyle()}
                  />
                  {/* Progress line from source side - animates stroke-dasharray */}
                  <line
                    x1={props.route.source.x}
                    y1={props.route.source.y}
                    x2={props.route.target.x}
                    y2={props.route.target.y}
                    class="ftl-line-construction-progress"
                    style={{
                      ...getOpacityStyle(),
                      'stroke-dasharray': `${halfLength} ${length}`,
                      'stroke-dashoffset': '0',
                      'animation': `ftlBuildFromStart ${durationSec}s linear forwards`,
                      '--ftl-half-length': `${halfLength}`,
                      '--ftl-full-length': `${length}`
                    }}
                  />
                  {/* Progress line from target side - animates stroke-dasharray */}
                  <line
                    x1={props.route.target.x}
                    y1={props.route.target.y}
                    x2={props.route.source.x}
                    y2={props.route.source.y}
                    class="ftl-line-construction-progress"
                    style={{
                      ...getOpacityStyle(),
                      'stroke-dasharray': `${halfLength} ${length}`,
                      'stroke-dashoffset': '0',
                      'animation': `ftlBuildFromStart ${durationSec}s linear forwards`,
                      '--ftl-half-length': `${halfLength}`,
                      '--ftl-full-length': `${length}`
                    }}
                  />
                  {/* Construction indicator at endpoints */}
                  <circle
                    cx={props.route.source.x}
                    cy={props.route.source.y}
                    r={4}
                    class="ftl-construction-node"
                  />
                  <circle
                    cx={props.route.target.x}
                    cy={props.route.target.y}
                    r={4}
                    class="ftl-construction-node"
                  />
                </>
              );
            })()}
          </Show>
        }
      >
        {/* Base tether line (connected state) */}
        <line
          x1={props.route.source.x}
          y1={props.route.source.y}
          x2={props.route.target.x}
          y2={props.route.target.y}
          class={`${tradeBaseClass()} ${props.shouldFadeIn ? 'fog-fade-in' : ''}`}
          style={getOpacityStyle()}
        />
        {/* Flow overlay (animated dashes) */}
        <line
          x1={props.route.source.x}
          y1={props.route.source.y}
          x2={props.route.target.x}
          y2={props.route.target.y}
          class={`${tradeFlowClass()} ${props.shouldFadeIn ? 'fog-fade-in' : ''}`}
          style={getOpacityStyle()}
        />
        {/* Throughput label */}
        <Show when={throughputText()}>
          <g class="pointer-events-none">
            <rect
              x={midX() - 14}
              y={midY() - 8}
              width={28}
              height={16}
              rx={3}
              fill="rgba(0, 0, 0, 0.7)"
              stroke="rgba(255, 255, 255, 0.3)"
              stroke-width={1}
            />
            <text
              x={midX()}
              y={midY() + 4}
              text-anchor="middle"
              fill="white"
              font-size="10"
              class="font-mono"
            >
              {throughputText()}
            </text>
          </g>
        </Show>
      </Show>
    </g>
  );
};
