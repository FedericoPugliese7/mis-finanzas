import { useUiStore, type ToastInput } from '@/shared/stores/ui.store';

/** Imperative toast API for features (e.g. undoable deletes). */
export function useToast() {
  const show = useUiStore((state) => state.show);
  const dismiss = useUiStore((state) => state.dismiss);
  return { show, dismiss };
}

export type { ToastInput };
