import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/shared/stores/theme.store';
import type { Theme } from '@/shared/lib/types';

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return theme;
}

function applyTheme(resolved: 'light' | 'dark'): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute(
      'content',
      resolved === 'dark' ? '#141311' : '#f7f5f2'
    );
  }
}

/**
 * Keeps the stored theme in sync with the document root.
 * Uses the View Transitions API for smooth light/dark switches,
 * unless the user prefers reduced motion.
 */
export function useThemeSync(): void {
  const theme = useThemeStore((state) => state.theme);
  const initial = useRef(true);

  useEffect(() => {
    const resolved = resolveTheme(theme);

    if (initial.current) {
      initial.current = false;
      applyTheme(resolved);
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('startViewTransition' in document)) {
      applyTheme(resolved);
      return;
    }

    const transition = document.startViewTransition(() => {
      applyTheme(resolved);
    });

    return () => {
      transition.skipTransition();
    };
  }, [theme]);
}
