import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { X } from 'lucide-react';
import { toastVariants } from '@/shared/motion';
import { useUiStore, type ToastItem } from '@/shared/stores/ui.store';

/**
 * Single toast: owns its own countdown so adding/removing other toasts never
 * restarts or clears this one's timer. Hovering or focusing it pauses the
 * countdown (undo toasts stay reachable for keyboard and pointer users).
 */
function ToastEntry({ toast }: { toast: ToastItem }) {
  const dismiss = useUiStore((state) => state.dismiss);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (toast.durationMs <= 0 || paused) return;
    const timer = setTimeout(() => dismiss(toast.id), toast.durationMs);
    return () => clearTimeout(timer);
  }, [toast.id, toast.durationMs, paused, dismiss]);

  return (
    <m.div
      role="status"
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-control border border-border bg-surface px-4 py-3 shadow-elevated"
    >
      <span className="text-sm text-content">{toast.message}</span>
      <div className="flex shrink-0 items-center gap-1">
        {toast.action ? (
          <button
            type="button"
            onClick={() => {
              toast.action?.onAction();
              dismiss(toast.id);
            }}
            className="rounded-control px-2.5 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
          >
            {toast.action.label}
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Cerrar aviso"
          onClick={() => dismiss(toast.id)}
          className="grid h-11 w-11 place-items-center rounded-control text-content-muted transition-colors hover:bg-surface-hover hover:text-content"
        >
          <X size={16} aria-hidden />
        </button>
      </div>
    </m.div>
  );
}

/** Fixed viewport for toasts (top center, safe-area aware). Mount once in the shell. */
export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 p-4 safe-top"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastEntry key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
