import { useEffect } from 'react';
import { animate, m, useMotionValue, useTransform } from 'motion/react';
import { transitions } from '@/shared/motion';
import { cn } from './utils';

interface AnimatedNumberProps {
  value: number;
  format: (value: number) => string;
  className?: string;
}

/**
 * Smooth count-up for dashboard figures (SPEC 7.7): animates from the previous
 * value to the new one with the shared `count` transition. With
 * `prefers-reduced-motion` the value jumps directly to its final state.
 */
export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const text = useTransform(motionValue, (latest) => format(Math.round(latest)));

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, transitions.count);
    return () => controls.stop();
  }, [value, motionValue]);

  return (
    <>
      {/* El valor final, legible y estable, es lo que escucha el lector de pantalla. */}
      <span className="sr-only">{format(value)}</span>
      <m.span aria-hidden className={cn('tabular-nums', className)}>
        {text}
      </m.span>
    </>
  );
}
