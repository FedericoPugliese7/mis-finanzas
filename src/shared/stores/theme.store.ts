import { create } from 'zustand';
import { ThemeSchema, type Theme } from '@/shared/lib/types';

/**
 * Theme preference.
 *
 * Persistence uses the exact same storage key and JSON format as the inline
 * anti-flash script in `index.html` (`mis-finanzas-theme`), so both worlds
 * (pre-React script and React) read and write the same value.
 */
export const THEME_STORAGE_KEY = 'mis-finanzas-theme';

function readStoredTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === null) return 'system';
    const parsed: unknown = JSON.parse(raw);
    const result = ThemeSchema.safeParse(parsed);
    return result.success ? result.data : 'system';
  } catch {
    return 'system';
  }
}

function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    /* storage unavailable: the app keeps working without persistence */
  }
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: readStoredTheme(),
  setTheme: (theme) => {
    writeStoredTheme(theme);
    set({ theme });
  }
}));
