import { cn } from './utils';

interface SpinnerProps {
  size?: number;
  label?: string;
  className?: string;
}

export function Spinner({ size = 20, label = 'Cargando', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-border border-t-accent',
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}
