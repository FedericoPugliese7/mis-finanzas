import { useEffect, useRef } from 'react';
import { durationsMs, easingsCss } from '@/shared/motion';
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
      resolved === 'dark' ? '#0c0c0a' : '#f4f4f0'
    );
  }
}

/**
 * Last pointer position: the origin of the theme-change ripple (the control
 * the user just tapped). Captured once, passively, at capture phase.
 */
const pointerOrigin = { x: 0, y: 0 };
let trackingPointer = false;

function trackPointerOrigin(): void {
  if (trackingPointer) return;
  trackingPointer = true;
  window.addEventListener(
    'pointerdown',
    (event) => {
      pointerOrigin.x = event.clientX;
      pointerOrigin.y = event.clientY;
    },
    { capture: true, passive: true }
  );
}

/**
 * Keeps the stored theme in sync with the document root.
 * Uses the View Transitions API with a circular clip-path ripple that grows
 * from the last pointer position (iOS 18 style), unless the user prefers
 * reduced motion (then: instant swap).
 */
export function useThemeSync(): void {
  const theme = useThemeStore((state) => state.theme);
  const initial = useRef(true);

  useEffect(() => {
    trackPointerOrigin();
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

    void transition.ready
      .then(() => {
        const x = pointerOrigin.x || window.innerWidth / 2;
        const y = pointerOrigin.y || 0;
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: durationsMs.theme * 2,
            easing: easingsCss.ios,
            pseudoElement: '::view-transition-new(root)'
          }
        );
      })
      .catch(() => {
        /* ready rechazado: el corte directo del fallback es suficiente */
      });

    return () => {
      transition.skipTransition();
    };
  }, [theme]);
}
