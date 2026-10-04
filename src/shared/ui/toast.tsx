import { useEffect } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { X } from 'lucide-react';
import { toastVariants } from '@/shared/motion';
import { useUiStore } from '@/shared/stores/ui.store';
import { cn } from './utils';

/** Fixed viewport for toasts (top center, safe-area aware). Mount once in the shell. */
export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);
  const dismiss = useUiStore((state) => state.dismiss);

  useEffect(() => {
    const timers = toasts
      .filter((toast) => toast.durationMs > 0)
      .map((toast) => setTimeout(() => dismiss(toast.id), toast.durationMs));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, dismiss]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 p-4 safe-top"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <m.div
            key={toast.id}
            role="status"
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-control border border-border bg-surface px-4 py-3 shadow-elevated'
            )}
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
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
                >
                  {toast.action.label}
                </button>
              ) : null}
              <button
                type="button"
                aria-label="Cerrar aviso"
                onClick={() => dismiss(toast.id)}
                className="grid h-8 w-8 place-items-center rounded-lg text-content-muted transition-colors hover:bg-surface-hover hover:text-content"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
