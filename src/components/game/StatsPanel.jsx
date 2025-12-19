import { Show } from 'solid-js';
import { GlassPanel } from '../common/GlassPanel';
import { ProgressBar } from '../common/ProgressBar';
import { ResourceStat } from './ResourceStat';
import { EnergyStat } from './EnergyStat';

/**
 * @typedef {Object} StatsPanelProps
 * @property {{ ore: number, credits: number }} resources - Current resources
 * @property {{ ore: number, credits: number }} productionRates - Production per second
 * @property {{ capacity: number, usage: number }} energyState - Energy capacity and usage
 * @property {number} systemsOwned - Number of systems owned by player
 * @property {number} maxSystems - Total number of systems
 * @property {{ researched: string[], current: object|null }} tech - Tech state
 */

/**
 * Panel displaying real-time game statistics.
 *
 * @param {StatsPanelProps} props
 */
export const StatsPanel = (props) => {
  // Calculate tech research progress (uses reactive remainingTime from tech signal)
  const techProgress = () => {
    if (!props.tech?.current) return null;
    const remaining = (props.tech.current.remainingTime || 0) / 1000;
    const elapsed = props.tech.current.duration - (props.tech.current.remainingTime || 0);
    const progress = Math.min(100, (elapsed / props.tech.current.duration) * 100);
    return { progress, remaining };
  };

  return (
    <GlassPanel
      id="stats-panel"
      class="absolute top-6 left-6 w-[300px] p-6 slide-in-left z-40"
    >
      {/* Resources Section */}
      <div class="space-y-6 mb-6">
        <ResourceStat
          label="ORE"
          value={props.resources.ore}
          rate={props.productionRates.ore}
          id="stats-ore-value"
        />

        <EnergyStat
          capacity={props.energyState?.capacity}
          usage={props.energyState?.usage}
        />

        <ResourceStat
          label="CREDITS"
          value={props.resources.credits}
          rate={props.productionRates.credits}
          id="stats-credits-value"
        />
      </div>

      {/* Divider */}
      <div class="my-6" />

      {/* Dominion */}
      <div class="mb-6">
        <div class="text-[10px] text-gray-500 tracking-widest mb-2">DOMINION</div>
        <div class="flex items-end justify-between mb-2">
          <span id="stats-dominion-value" class="text-lg text-white font-light">
            {props.systemsOwned} <span class="text-xs text-gray-500">SYS</span>
          </span>
          <span class="text-xs text-gray-500">{Math.round((props.systemsOwned / props.maxSystems) * 100)}%</span>
        </div>
        <ProgressBar
          progress={(props.systemsOwned / props.maxSystems) * 100}
          glow={true}
        />
      </div>

      {/* Tech Research Progress */}
      <Show when={props.tech?.current}>
        <div class="mb-6">
          <div class="text-[10px] text-gray-500 tracking-widest mb-2">RESEARCHING</div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-blue-300">{props.tech?.current?.id?.charAt(0).toUpperCase() + props.tech?.current?.id?.slice(1).replace(/([A-Z])/g, ' $1').trim()}</span>
            <span class="text-[10px] text-gray-500">{Math.floor(techProgress()?.remaining || 0)}s</span>
          </div>
          <ProgressBar progress={techProgress()?.progress || 0} color="#60a5fa" />
        </div>
      </Show>

    </GlassPanel>
  );
};
