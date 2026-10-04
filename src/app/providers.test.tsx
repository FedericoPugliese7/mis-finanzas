import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MotionProvider } from './providers';
import { durationsMs, easingsCss, fadeVariants, presses, springs } from '@/shared/motion';

afterEach(async () => {
  // `LazyMotion` loads its features asynchronously and calls `setState` when
  // the import resolves. Settling that promise here keeps the update inside
  // the test environment instead of leaking into the torn-down one.
  await act(async () => {
    await import('./motion-features');
  });
});

describe('MotionProvider', () => {
  it('renders its children', () => {
    render(
      <MotionProvider>
        <p>Contenido</p>
      </MotionProvider>
    );
    expect(screen.getByText('Contenido')).toBeDefined();
  });

  it('mirrors motion tokens into CSS variables', () => {
    render(
      <MotionProvider>
        <p>Contenido</p>
      </MotionProvider>
    );
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--motion-duration-theme')).toBe(
      `${durationsMs.theme}ms`
    );
    expect(root.style.getPropertyValue('--motion-ease-ios')).toBe(easingsCss.ios);
  });
});

describe('shared motion tokens', () => {
  it('uses iOS-like easing values', () => {
    expect(easingsCss.ios).toBe('cubic-bezier(0.32, 0.72, 0, 1)');
  });

  it('keeps springs within UI stiffness range and without noticeable bounce', () => {
    for (const spring of Object.values(springs)) {
      expect(spring.type).toBe('spring');
      const { stiffness, damping, mass = 1 } = spring;
      expect(stiffness).toBeGreaterThanOrEqual(260);
      expect(stiffness).toBeLessThanOrEqual(500);
      expect(damping).toBeGreaterThanOrEqual(28);

      // Damping ratio: zeta >= 1 is critically damped (no overshoot at all).
      // Below 0.8 the spring visibly bounces, which the spec forbids.
      const zeta = damping / (2 * Math.sqrt(stiffness * mass));
      expect(zeta).toBeGreaterThanOrEqual(0.8);
    }
  });

  it('exposes fade variants for enter/exit', () => {
    const hidden = fadeVariants.hidden as { opacity?: number };
    const visible = fadeVariants.visible as { opacity?: number };
    expect(hidden.opacity).toBe(0);
    expect(visible.opacity).toBe(1);
  });

  it('uses a 0.97 press scale for tappable elements', () => {
    expect(presses.tap.scale).toBe(0.97);
  });
});
