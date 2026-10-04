import type { HTMLAttributes, ReactNode } from 'react';
import { m } from 'motion/react';
import { presses, springs } from '@/shared/motion';
import { cn } from './utils';

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
  children?: ReactNode;
}

export function Card({ className, interactive = false, children, ...props }: CardProps) {
  const classes = cn(
    'rounded-card border border-border bg-surface shadow-subtle',
    className
  );
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
