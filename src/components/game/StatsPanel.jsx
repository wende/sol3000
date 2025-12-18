import { Show } from 'solid-js';
import { GlassPanel } from '../common/GlassPanel';
import { ProgressBar } from '../common/ProgressBar';
import { RotateCcw, Pickaxe, Zap, Coins } from 'lucide-solid';
import { formatNumber, formatRate } from '../../utils/format';

/**
 * @typedef {Object} StatsPanelProps
 * @property {{ ore: number, energy: number, credits: number }} resources - Current resources
 * @property {{ ore: number, energy: number, credits: number }} productionRates - Production per second
 * @property {number} systemsOwned - Number of systems owned by player
 * @property {number} maxSystems - Total number of systems
 * @property {() => void} onNewGame - Callback to start a new game
 * @property {{ researched: string[], current: object|null }} tech - Tech state
 */

/**
 * Panel displaying real-time game statistics.
 *
 * @param {StatsPanelProps} props
 */
export const StatsPanel = (props) => {
  const handleNewGame = (e) => {
    e.stopPropagation();
    if (confirm('Start a new game? Current progress will be lost.')) {
      props.onNewGame();
    }
  };

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
      class="absolute top-6 left-6 w-[280px] p-5 slide-in-left pointer-events-auto z-40"
    >
      {/* Resources Section */}
      <div class="space-y-3 mb-5">
        {/* Ore */}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Pickaxe size={14} class="text-amber-400" />
            <span class="text-[10px] text-gray-400 tracking-widest">ORE</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span id="stats-ore-value" class="text-lg text-white font-light tabular-nums">
              {formatNumber(props.resources.ore)}
            </span>
            <span class="text-[10px] text-green-400/80 tabular-nums">
              {formatRate(props.productionRates.ore)}/s
            </span>
          </div>
        </div>

        {/* Energy */}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Zap size={14} class="text-yellow-300" />
            <span class="text-[10px] text-gray-400 tracking-widest">ENERGY</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span id="stats-energy-value" class="text-lg text-white font-light tabular-nums">
              {formatNumber(props.resources.energy)}
            </span>
            <span class="text-[10px] text-green-400/80 tabular-nums">
              {formatRate(props.productionRates.energy)}/s
            </span>
          </div>
        </div>

        {/* Credits */}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Coins size={14} class="text-emerald-400" />
            <span class="text-[10px] text-gray-400 tracking-widest">CREDITS</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span id="stats-credits-value" class="text-lg text-white font-light tabular-nums">
              {formatNumber(props.resources.credits)}
            </span>
            <span class="text-[10px] text-green-400/80 tabular-nums">
              {formatRate(props.productionRates.credits)}/s
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div class="border-t border-white/10 my-4" />

      {/* Dominion */}
      <div class="mb-4">
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
        <div class="mb-4">
          <div class="text-[10px] text-gray-500 tracking-widest mb-2">RESEARCHING</div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-blue-300">{props.tech?.current?.id?.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span class="text-[10px] text-gray-500">{Math.floor(techProgress()?.remaining || 0)}s</span>
          </div>
          <ProgressBar progress={techProgress()?.progress || 0} color="bg-blue-400" />
        </div>
      </Show>

      {/* New Game Button */}
      <div class="pt-3 border-t border-white/10">
        <button
          onClick={handleNewGame}
          class="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs tracking-widest
                 text-white/70 hover:text-white border border-white/20 hover:border-white/40
                 transition-all duration-200 hover:bg-white/5"
        >
          <RotateCcw size={14} />
          NEW GAME
        </button>
      </div>
    </GlassPanel>
  );
};
