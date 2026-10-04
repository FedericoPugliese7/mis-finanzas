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

const variantClasses: Record<CardVariant, string> = {
  default: 'rounded-card border border-border bg-surface shadow-card',
  outlined: 'rounded-card border-2 border-border bg-surface',
  elevated: 'rounded-card border border-border bg-surface shadow-elevated',
  filled: 'rounded-card border-0 bg-background-subtle'
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
        whileHover={presses.hover}
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
