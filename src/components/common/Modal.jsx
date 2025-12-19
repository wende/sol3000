import { Show } from 'solid-js';
import { X } from 'lucide-solid';
import { GlassPanel } from './GlassPanel';

/**
 * @typedef {Object} ModalProps
 * @property {boolean} open - Whether the modal is visible
 * @property {() => void} onClose - Callback to close the modal
 * @property {string} title - Modal title
 * @property {import('solid-js').JSX.Element} icon - Icon element to show in header
 * @property {string} [width] - Modal width (default: "500px")
 * @property {import('solid-js').JSX.Element} children - Modal content
 */

/**
 * Reusable modal component with glassmorphism styling.
 *
 * @param {ModalProps} props
 */
export const Modal = (props) => {
  return (
    <Show when={props.open}>
      <div
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
        onClick={props.onClose}
      >
        <GlassPanel
          class={`max-h-[80vh] overflow-hidden`}
          style={{ width: props.width || '500px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div class="flex items-center justify-between p-6">
            <div class="flex items-center gap-3">
              {props.icon}
              <h2 class="text-lg tracking-widest">{props.title}</h2>
            </div>
            <button onClick={props.onClose} class="p-2 hover:bg-white/10 rounded">
              <X size={18} />
            </button>
          </div>
          <div class="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
            {props.children}
          </div>
        </GlassPanel>
      </div>
    </Show>
  );
};
