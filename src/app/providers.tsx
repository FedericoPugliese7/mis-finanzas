import { useEffect, type ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';
import { useThemeSync } from '@/shared/hooks/use-theme-sync';
import { motionCssVars } from '@/shared/motion';

const loadMotionFeatures = () => import('./motion-features').then((m) => m.default);

/**
 * Global Motion setup.
 *
 * - `LazyMotion` + `m` components keep Motion's features out of the initial
 *   bundle: the engine chunk (`src/app/motion-features.ts`) is fetched async.
 * - `strict` is intentionally off: features arrive asynchronously, and a
 *   gesture that runs before they load must degrade silently instead of
 *   throwing (the animation is simply skipped).
 * - `reducedMotion="user"` makes Motion respect `prefers-reduced-motion`.
 * - Motion tokens are mirrored into CSS variables so plain CSS transitions
 *   (including the View Transitions API) use the exact same values.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  useThemeSync();

  useEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(motionCssVars())) {
      root.style.setProperty(name, value);
    }
  }, []);

  return (
    <LazyMotion features={loadMotionFeatures}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
