import { Show } from 'solid-js';
import { Lock, Check } from 'lucide-solid';
import { ProgressBar } from '../common/ProgressBar';
import { formatTime } from '../../utils/format';
import { TECH_TREE } from '../../utils/gameState';

/**
 * @typedef {Object} TechListItemProps
 * @property {Object} tech - The tech object from TECH_TREE
 * @property {boolean} isResearched - Whether this tech is already researched
 * @property {boolean} isResearching - Whether this tech is currently being researched
 * @property {boolean} canResearch - Whether the player can start researching this tech
 * @property {boolean} hasPrerequisites - Whether prerequisites are met
 * @property {number} progress - Research progress percentage (0-100)
 * @property {number} remainingTime - Time remaining in ms
 * @property {(techId: string) => void} onResearch - Callback to start research
 */

/**
 * Single tech item in the technology list.
 *
 * @param {TechListItemProps} props
 */
export const TechListItem = (props) => {
  return (
    <div
      class={`p-4 border rounded transition-all ${
        props.isResearched
          ? 'border-green-500/30 bg-green-500/5'
          : props.isResearching
          ? 'border-white/30 bg-white/5'
          : props.canResearch
          ? 'border-white/20 hover:border-white/40 cursor-pointer hover:bg-white/5'
          : 'border-white/10 opacity-50'
      }`}
      onClick={() => props.canResearch && props.onResearch(props.tech.id)}
    >
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <Show when={props.isResearched}>
              <Check size={14} class="text-green-400" />
            </Show>
            <Show when={!props.isResearched && !props.hasPrerequisites}>
              <Lock size={14} class="text-gray-500" />
            </Show>
            <span class="text-sm font-medium">{props.tech.name}</span>
          </div>
          <p class="text-xs text-gray-400">{props.tech.description}</p>
          <Show when={props.tech.requires.length > 0}>
            <p class="text-[10px] text-gray-600 mt-1">
              Requires: {props.tech.requires.map(r => TECH_TREE[r]?.name).join(', ')}
            </p>
          </Show>
        </div>
        <div class="text-right">
          <Show when={!props.isResearched}>
            <div class="text-xs text-yellow-400">{props.tech.cost} CR</div>
            <div class="text-[10px] text-gray-500">{formatTime(props.tech.researchTime)}</div>
          </Show>
          <Show when={props.isResearched}>
            <div class="text-xs text-green-400">COMPLETE</div>
          </Show>
        </div>
      </div>
      <Show when={props.isResearching}>
        <div class="mt-3">
          <div class="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Researching...</span>
            <span>{formatTime(props.remainingTime)}</span>
          </div>
          <ProgressBar progress={props.progress} />
        </div>
      </Show>
    </div>
  );
};
