import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from './utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Renders the field with the expense color (form validation). */
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-11 w-full rounded-control border bg-surface px-3.5 text-sm text-content transition-colors placeholder:text-content-muted',
        invalid
          ? 'border-expense'
          : 'border-border hover:border-border focus:border-accent',
        className
      )}
      {...props}
    />
  );
});
