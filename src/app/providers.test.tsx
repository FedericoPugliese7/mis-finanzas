import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MotionProvider } from './providers';
import {
  barGrowthVariants,
  dashboardStaggerVariants,
  durations,
  durationsMs,
  easings,
  easingsCss,
  fadeVariants,
  indicatorVariants,
  listContainerVariants,
  listItemVariants,
  monthChangeVariants,
  motionCssVars,
  motionCssVarNames,
  pathSweepVariants,
  presses,
  springs,
  staggerContainerVariants,
  tightListContainerVariants
} from '@/shared/motion';

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
    const vars = motionCssVars();
    for (const [name, value] of Object.entries(vars)) {
      expect(root.style.getPropertyValue(name)).toBe(value);
    }
  });
});

describe('shared motion tokens', () => {
  it('uses iOS-like easing values', () => {
    expect(easingsCss.ios.startsWith('cubic-bezier')).toBe(true);
  });

  it('keeps all easings and css strings in sync', () => {
    const keys = Object.keys(easings) as (keyof typeof easings)[];
    for (const key of keys) {
      const [a, b, c, d] = easings[key];
      expect(easingsCss[key]).toMatch(new RegExp(`cubic-bezier\\(${a},\\s*${b},\\s*${c},\\s*${d}\\)`));
    }
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

  it('exposes durations in both seconds and milliseconds', () => {
    expect(durationsMs.micro).toBe(durations.micro * 1000);
    expect(durationsMs.chart).toBe(durations.chart * 1000);
    expect(durationsMs.stagger).toBe(durations.stagger * 1000);
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

  it('exports bar growth variants with origin-friendly defaults', () => {
    const hidden = barGrowthVariants.hidden as { scaleY?: number };
    const visible = barGrowthVariants.visible as { scaleY?: number };
    expect(hidden.scaleY).toBe(0);
    expect(visible.scaleY).toBe(1);
  });

  it('exports path sweep variants for SVG charts', () => {
    const hidden = pathSweepVariants.hidden as { pathLength?: number };
    const visible = pathSweepVariants.visible as { pathLength?: number };
    expect(hidden.pathLength).toBe(0);
    expect(visible.pathLength).toBe(1);
  });

  it('exports month change variants with directional exits and entrances', () => {
    expect(
      (monthChangeVariants.exitLeft as { x?: number }).x
    ).toBeLessThan(0);
    expect(
      (monthChangeVariants.exitRight as { x?: number }).x
    ).toBeGreaterThan(0);
    expect(
      (monthChangeVariants.enterLeft as { opacity?: number }).opacity
    ).toBe(1);
    expect(
      (monthChangeVariants.enterRight as { opacity?: number }).opacity
    ).toBe(1);
  });

  it('exports indicator variants for sliding nav indicators', () => {
    const hidden = indicatorVariants.hidden as { scaleX?: number };
    const visible = indicatorVariants.visible as { scaleX?: number };
    expect(hidden.scaleX).toBe(0);
    expect(visible.scaleX).toBe(1);
  });

  it('exports stagger containers with bounded delays', () => {
    const list = listContainerVariants.visible as { transition?: { staggerChildren: number; delayChildren: number } };
    expect(list.transition?.staggerChildren).toBe(durations.stagger);

    const tight = tightListContainerVariants.visible as { transition?: { staggerChildren: number; delayChildren: number } };
    expect(tight.transition?.staggerChildren).toBe(durations.stagger);
    expect((tight.transition?.delayChildren ?? 0)).toBeLessThanOrEqual(0.05);

    const dashboard = dashboardStaggerVariants.visible as { transition?: { staggerChildren: number; delayChildren: number } };
    expect(dashboard.transition?.staggerChildren).toBe(durations.stagger);
    expect((dashboard.transition?.delayChildren ?? 0)).toBeLessThanOrEqual(0.05);

    const stagger = staggerContainerVariants.visible as { transition?: { staggerChildren: number; delayChildren: number } };
    expect(stagger.transition?.staggerChildren).toBe(durations.stagger);
  });

  it('uses spring transitions for list items', () => {
    const visible = listItemVariants.visible as { transition?: { type?: string } };
    expect(visible.transition?.type).toBe('spring');
  });

  it('exposes the stagger duration as a CSS variable name', () => {
    expect(motionCssVarNames.durationStagger).toBe('--motion-duration-stagger');
  });
});
