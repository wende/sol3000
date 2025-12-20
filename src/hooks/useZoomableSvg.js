import { onMount, onCleanup } from 'solid-js';
import * as d3 from 'd3';

/**
 * @typedef {Object} ZoomContext
 * @property {import('d3-selection').Selection | null} svg
 * @property {import('d3-selection').Selection | null} group
 * @property {import('d3-zoom').ZoomBehavior | undefined} zoomBehavior
 * @property {typeof d3} d3
 * @property {(transform: import('d3-zoom').ZoomTransform) => void} applyTransform
 */

/**
 * Shared D3 zoom setup for SVG scenes. Handles initialization, cleanup,
 * disabling default double-click zoom, and exposes helpers for manual transforms.
 *
 * @param {Object} options
 * @param {number} [options.minScale=0.1] - Minimum zoom scale
 * @param {number} [options.maxScale=4] - Maximum zoom scale
 * @param {Array} [options.translateExtent] - Optional translateExtent passed to d3.zoom
 * @param {number} [options.clickDistance] - Optional clickDistance passed to d3.zoom
 * @param {boolean} [options.disableDoubleClick=true] - Disable default double-click zoom handling
 * @param {(event: d3.D3ZoomEvent) => void} [options.onZoom] - Callback for zoom updates
 * @param {(context: ZoomContext) => void} [options.onInitialize] - Callback once zoom is initialized
 * @param {(context: ZoomContext) => void} [options.onDispose] - Callback during cleanup
 * @returns {Object} Zoom helpers for Solid components
 */
export const useZoomableSvg = (options = {}) => {
  let svgElement;
  let groupElement;
  let zoomBehavior;

  const setSvgRef = (el) => {
    svgElement = el;
  };

  const setGroupRef = (el) => {
    groupElement = el;
  };

  const getSvgSelection = () => (svgElement ? d3.select(svgElement) : null);
  const getGroupSelection = () => (groupElement ? d3.select(groupElement) : null);

  const applyTransform = (transform) => {
    if (!transform) return;
    const svgSel = getSvgSelection();
    if (svgSel && zoomBehavior) {
      svgSel.call(zoomBehavior.transform, transform);
    }
  };

  const getContext = () => ({
    svg: getSvgSelection(),
    group: getGroupSelection(),
    zoomBehavior,
    d3,
    applyTransform,
  });

  onMount(() => {
    if (!svgElement) return;

    zoomBehavior = d3.zoom()
      .scaleExtent([options.minScale ?? 0.1, options.maxScale ?? 4]);

    if (options.translateExtent) {
      zoomBehavior.translateExtent(options.translateExtent);
    }

    if (typeof options.clickDistance === 'number') {
      zoomBehavior.clickDistance(options.clickDistance);
    }

    if (typeof options.filter === 'function') {
      zoomBehavior.filter(options.filter);
    }

    zoomBehavior.on('zoom', (event) => {
      const groupSel = getGroupSelection();
      if (groupSel) {
        groupSel.attr('transform', event.transform);
      }
      options.onZoom?.(event, getContext());
    });

    const svgSel = getSvgSelection();
    if (!svgSel) return;

    svgSel.call(zoomBehavior);

    if (options.disableDoubleClick !== false) {
      svgSel.on('dblclick.zoom', null);
    }

    options.onInitialize?.(getContext());
  });

  onCleanup(() => {
    const svgSel = getSvgSelection();
    if (svgSel) {
      svgSel.on('.zoom', null);
      svgSel.interrupt();
    }
    options.onDispose?.(getContext());
  });

  return {
    setSvgRef,
    setGroupRef,
    getSvgElement: () => svgElement,
    getGroupElement: () => groupElement,
    getZoomBehavior: () => zoomBehavior,
    getSvgSelection,
    getGroupSelection,
    applyTransform,
  };
};
