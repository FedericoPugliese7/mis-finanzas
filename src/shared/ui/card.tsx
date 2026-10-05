import type { HTMLAttributes, ReactNode } from 'react';
import { m } from 'motion/react';
import { presses, springs } from '@/shared/motion';
import { cn } from './utils';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';

interface CardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationCancel'
  | 'onAnimationIteration'
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDragStart'
  | 'onDrop'
> {
  /** Adds hover/press feedback for tappable cards. */
  interactive?: boolean;
  /** Visual variant of the card. */
  variant?: CardVariant;
  children?: ReactNode;
}

/**
 * One way to separate surfaces per variant:
 * in-page cards use a fine border (no shadow); `elevated` is reserved for
 * floating layers (dialog, sheet, toast) and drops the border for the shadow.
 */
const variantClasses: Record<CardVariant, string> = {
  default: 'rounded-card border border-border-subtle bg-surface',
  outlined: 'rounded-card border border-border bg-surface',
  elevated: 'rounded-card bg-surface shadow-elevated',
  filled: 'rounded-card border border-border-subtle bg-background-subtle'
};

export function Card({
  className,
  interactive = false,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  const classes = cn(variantClasses[variant], className);
  if (interactive) {
    return (
      <m.div
        className={classes}
        whileTap={presses.tap}
        transition={springs.micro}
        {...props}
      >
        {children}
      </m.div>
    );
  }
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
