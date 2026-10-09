import { useReducedMotion, m } from 'motion/react';
import { fadeOnlyVariants } from '@/shared/motion';
import { cn } from './utils';

interface SpinnerProps {
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Loading indicator with a gentle fade-in and reduced-motion support.
 * The spin animation is disabled when the user prefers reduced motion.
 */
export function Spinner({ size = 20, label = 'Cargando', className }: SpinnerProps) {
  const reduced = useReducedMotion();

  return (
    <m.span
      role="status"
      aria-label={label}
      variants={fadeOnlyVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'inline-block rounded-full border-2 border-border border-t-accent',
        !reduced && 'animate-spin',
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}
