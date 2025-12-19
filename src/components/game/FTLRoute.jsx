import { Show } from 'solid-js';

/**
 * @typedef {Object} FTLRouteProps
 * @property {Object} route - The route object with source and target systems
 * @property {string} routeId - The unique ID for this route
 * @property {boolean} isVisible - Whether the route is visible (fog of war)
 * @property {boolean} shouldFade - Whether the route should fade out (during fog transition)
 * @property {boolean} shouldFadeIn - Whether the route should fade in (newly revealed)
 * @property {boolean} isSelected - Whether this route is currently selected
 * @property {boolean} isBuilt - Whether FTL has been built on this route
 * @property {Function} onSelect - Callback when route is selected
 */

/**
 * Renders a single FTL route between two systems
 *
 * @param {FTLRouteProps} props
 */
export const FTLRoute = (props) => {
  const lineClass = () => {
    if (props.isSelected && props.isBuilt) return 'ftl-line-built-selected';
    if (props.isSelected) return 'ftl-line-selected';
    if (props.isBuilt) return 'ftl-line-built';
    return 'ftl-line';
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
      <line
        x1={props.route.source.x}
        y1={props.route.source.y}
        x2={props.route.target.x}
        y2={props.route.target.y}
        class={`${lineClass()} ${props.shouldFadeIn ? 'fog-fade-in' : ''}`}
        style={getOpacityStyle()}
      />
    </g>
  );
};
