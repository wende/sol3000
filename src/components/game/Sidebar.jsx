import { createSignal, createEffect, onCleanup, Show } from 'solid-js';
import { GlassPanel } from '../common/GlassPanel';
import { DestinationSelector } from './DestinationSelector';
import { SidebarHeader } from './SidebarHeader';
import { SystemOverviewPanel } from './SystemOverviewPanel';
import { TetherInfoPanel } from './TetherInfoPanel';

/**
 * @typedef {Object} SidebarProps
 * @property {Object|null} system - The selected system
 * @property {Object|null} tether - The selected tether { id, source, target, distance }
 * @property {Function} onClose - Callback to close the sidebar
 * @property {Object} gameState - The game state object
 * @property {Object} tradeFlows - Trade flow data { systemSatisfaction, routeThroughput }
 */

/**
 * Sidebar component displaying system details and actions.
 *
 * @param {SidebarProps} props
 */
export const Sidebar = (props) => {
  const isOpen = () => (!!props.system || !!props.tether) && props.gameState.viewState() === 'galaxy';
  const [isVisible, setIsVisible] = createSignal(false);
  const [view, setView] = createSignal('overview'); // 'overview' | 'launch'
  const [now, setNow] = createSignal(Date.now());
  let closeTimer = null;

  // Timer for updating progress bars
  const timer = setInterval(() => setNow(Date.now()), 100);
  onCleanup(() => clearInterval(timer));
  onCleanup(() => {
    if (closeTimer) {
      clearTimeout(closeTimer);
    }
  });

  // Reset view when system/tether changes or closes
  createEffect(() => {
    if (!props.system && !props.tether) setView('overview');
  });

  // Get docked ships at this system
  const dockedShipsHere = () => {
    if (!props.system) return [];
    return props.gameState.ships().filter(
      s => s.status === 'docked' && s.systemId === props.system.id
    );
  };

  // Get reachable unclaimed systems for colonization
  const reachableSystems = () => {
    if (!props.system || dockedShipsHere().length === 0) return [];

    const galaxy = props.gameState.galaxyData();
    const unclaimed = galaxy.systems.filter(s => s.owner === 'Unclaimed');

    return unclaimed
      .map(s => {
        const path = props.gameState.findPath(galaxy, props.system.id, s.id);
        return path ? { system: s, hops: path.length } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.hops - b.hops)
      .slice(0, 10); // Show top 10 closest
  };

  const handleLaunchShip = (destinationId) => {
    const ship = dockedShipsHere()[0];
    if (ship) {
      props.gameState.launchColonyShip(ship.id, destinationId);
      setView('overview');
    }
  };

  // Keep the sidebar mounted briefly to allow closing transitions
  createEffect(() => {
    if (isOpen()) {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      setIsVisible(true);
    } else if (isVisible()) {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        setIsVisible(false);
        closeTimer = null;
      }, 500);
    }
  });

  return (
    <Show when={isVisible()}>
      <Show when={isOpen() && view() === 'launch'}>
        <div
          class="fixed inset-0 transition-opacity duration-300 ease-out opacity-100 pointer-events-auto"
          style={{ "z-index": 49, background: "rgba(0, 0, 0, 0.35)" }}
          onClick={() => setView('overview')}
        />
      </Show>

      <div
        class={`fixed top-0 right-0 h-full z-50 transform transition-all duration-500 ease-out ${isOpen() ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-10 opacity-0 pointer-events-none'}`}
        style={{ "will-change": "transform, opacity" }}
      >
        <GlassPanel
          id="sidebar-panel"
          class={`h-full ${view() === 'launch' ? 'sidebar-launch' : 'sidebar-overview'}`}
          style={{
            "will-change": "width, opacity",
          }}
        >
          <SidebarHeader
            system={props.system}
            tether={props.tether}
            onClose={props.onClose}
            onBack={() => setView('overview')}
            isInOverview={view() === 'overview'}
          />

          <Show when={props.system}>
            <div class="p-8 space-y-8 font-mono overflow-y-auto h-[calc(100%-12rem)]">
              <Show when={view() === 'overview'}>
                <SystemOverviewPanel
                  system={props.system}
                  gameState={props.gameState}
                  now={now()}
                  tradeFlows={props.tradeFlows}
                  onLaunchShip={() => setView('launch')}
                />
              </Show>

              <Show when={view() === 'launch'}>
                <DestinationSelector
                  destinations={reachableSystems()}
                  onSelect={handleLaunchShip}
                />
              </Show>
            </div>
          </Show>

          <Show when={props.tether}>
            <div class="p-8 space-y-8 font-mono overflow-y-auto h-[calc(100%-12rem)]">
              <TetherInfoPanel tether={props.tether} gameState={props.gameState} />
            </div>
          </Show>
        </GlassPanel>
      </div>
    </Show>
  );
};
