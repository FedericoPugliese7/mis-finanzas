import { easingsCss } from '@/shared/motion';
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
        'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
        /* invisible padding grows the touch target to 44 px */
        "before:absolute before:inset-x-0 before:-inset-y-2 before:content-['']",
        checked ? 'border-accent bg-accent' : 'border-border bg-background-subtle',
        disabled && 'opacity-50',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-content-inverse shadow-subtle',
          checked && 'translate-x-5'
        )}
        style={{
          transition: `transform var(--motion-duration-micro, 180ms) var(--motion-ease-standard, ${easingsCss.standard})`
        }}
      />
    </button>
  );
}
