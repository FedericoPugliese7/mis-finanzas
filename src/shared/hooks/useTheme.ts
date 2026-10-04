import { useEffect } from 'react';
import type { Theme } from '@/shared/lib/types';
import { useThemeStore } from '@/shared/stores/theme.store';

const META_COLORS = { light: '#f8fafc', dark: '#0b1120' } as const;

function resolveEffective(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

let initialApplyDone = false;

/**
 * Applies `data-theme`, `color-scheme` and `<meta name="theme-color">`.
 *
 * Never animates on the initial load (the inline script in `index.html` already
 * applied the theme before React mounts — see SPEC 7.6). After that, real
 * changes use the View Transitions API when the browser supports it.
 */
export function applyTheme(theme: Theme): void {
  const effective = resolveEffective(theme);
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const alreadyApplied =
    root.getAttribute('data-theme') === effective &&
    meta?.getAttribute('content') === META_COLORS[effective];
  if (alreadyApplied) {
    initialApplyDone = true;
    return;
  }

  const update = () => {
    root.setAttribute('data-theme', effective);
    root.style.colorScheme = effective;
    meta?.setAttribute('content', META_COLORS[effective]);
  };

  const animate = initialApplyDone;
  initialApplyDone = true;
  if (animate && typeof document.startViewTransition === 'function') {
    document.startViewTransition(update);
  } else {
    update();
  }
}

/**
 * Keeps the document theme in sync with the stored preference.
 * Also re-applies `system` when the OS color scheme changes.
 */
export function useTheme(): Theme {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  return theme;
}
