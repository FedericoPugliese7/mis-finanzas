import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { m } from 'motion/react';
import { presses, springs } from '@/shared/motion';
import { cn } from './utils';

const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 rounded-control font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-content hover:bg-accent-hover',
        secondary:
          'border border-border bg-surface text-content shadow-subtle hover:bg-surface-hover',
        ghost: 'text-content-secondary hover:bg-surface-hover hover:text-content',
        danger: 'bg-expense-soft text-expense-content hover:brightness-95',
        link: 'text-accent underline-offset-4 hover:underline'
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
);
/**
 * React's animation/drag DOM events clash with Motion's own handlers that
 * share those names, so they cannot be spread onto an `m.button`.
 */
type NativeProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
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
>;

export interface ButtonProps extends NativeProps, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref
) {
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
  return (
    <m.button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      whileTap={presses.tap}
      transition={springs.micro}
      {...props}
    />
  );
});
