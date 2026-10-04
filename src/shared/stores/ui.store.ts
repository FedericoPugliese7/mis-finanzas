import { create } from 'zustand';

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  action?: ToastAction;
  durationMs: number;
}

export interface ToastInput {
  message: string;
  action?: ToastAction;
  /** `0` keeps the toast until it is dismissed manually. */
  durationMs?: number;
}

const DEFAULT_TOAST_DURATION_MS = 5000;

interface UiState {
  toasts: ToastItem[];
  show: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

/** Transient UI state: toasts (undo actions live here). */
export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  show: (input) => {
    const id = crypto.randomUUID();
    const toast: ToastItem = {
      id,
      message: input.message,
      action: input.action,
      durationMs: input.durationMs ?? DEFAULT_TOAST_DURATION_MS
    };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    return id;
  },
  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  }
}));
