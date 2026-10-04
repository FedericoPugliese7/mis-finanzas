import { useEffect, type ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';
import { durationsMs, easingsCss } from '@/shared/motion';

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
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--motion-duration-theme', `${durationsMs.theme}ms`);
    root.style.setProperty('--motion-duration-enter', `${durationsMs.enter}ms`);
    root.style.setProperty('--motion-duration-micro', `${durationsMs.micro}ms`);
    root.style.setProperty('--motion-ease-ios', easingsCss.ios);
    root.style.setProperty('--motion-ease-standard', easingsCss.standard);
  }, []);

  return (
    <LazyMotion features={loadMotionFeatures}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
