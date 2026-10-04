import { cn } from './utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label': string;
  className?: string;
}

/**
 * Accessible switch (`role="switch"`). The thumb moves with a CSS transition
 * fed by the Motion CSS variables (single source of truth in `motion.ts`).
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  'aria-label': ariaLabel,
  className
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
        checked ? 'border-accent bg-accent' : 'border-border bg-background-subtle',
        disabled && 'opacity-50',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-content-inverse shadow-subtle',
          checked && 'translate-x-5'
        )}
        style={{
          transition:
            'transform var(--motion-duration-micro, 180ms) var(--motion-ease-standard, cubic-bezier(0.4, 0, 0.2, 1))'
        }}
      />
    </button>
  );
}
