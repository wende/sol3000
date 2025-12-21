import { Show } from 'solid-js';
import { GlassPanel } from '../common/GlassPanel';
import { ProgressBar } from '../common/ProgressBar';
import { StatBlock } from '../common/StatBlock';
import { formatNumber, formatRate } from '../../utils/format';

/**
 * @typedef {Object} StatsPanelProps
 * @property {number} credits - Global credits
 * @property {number} creditsRate - Credits production per second
 * @property {{ researched: string[], current: object|null }} tech - Tech state
 */

/**
 * Panel displaying real-time game statistics.
 * Shows only global credits - metals and energy are now per-system.
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
      class="absolute top-6 left-6 px-4 py-12 slide-in-left z-40"
    >
      {/* Global Credits */}
      <div class="flex items-center gap-4">
        <span class="text-[10px] text-gray-400 tracking-widest">CREDITS</span>
        <span id="stats-credits-value" class="text-lg text-white font-light tabular-nums">
          {formatNumber(props.credits)}
        </span>
        <Show when={props.creditsRate !== undefined}>
          <span class="text-[10px] text-green-400 tabular-nums">
            {formatRate(props.creditsRate)}/s
          </span>
        </Show>
      </div>

      {/* Tech Research Progress */}
      <Show when={props.tech?.current}>
        <div class="mt-4 pt-4 border-t border-white/10">
          <StatBlock label="RESEARCHING">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-blue-300">{props.tech?.current?.id?.charAt(0).toUpperCase() + props.tech?.current?.id?.slice(1).replace(/([A-Z])/g, ' $1').trim()}</span>
              <span class="text-[10px] text-gray-500">{Math.floor(techProgress()?.remaining || 0)}s</span>
            </div>
            <ProgressBar progress={techProgress()?.progress || 0} color="#60a5fa" />
          </StatBlock>
        </div>
      </Show>

    </GlassPanel>
  );
};
