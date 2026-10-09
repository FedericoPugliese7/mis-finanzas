import { useId, type ReactNode } from 'react';
import { m } from 'motion/react';
import { springs } from '@/shared/motion';
import { cn } from './utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: (props: { size?: number; 'aria-hidden'?: boolean }) => ReactNode;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  ariaLabel: string;
  className?: string;
  /**
   * Optional stable id shared across instances. When two `Segmented` controls
   * represent the same logical choice (e.g. display currency in the header and
   * in settings), using the same `controlId` lets the indicator travel between
   * them with `layoutId`.
   */
  controlId?: string;
}

/** Segmented control (`role="radiogroup"`). Indicator moves with the shared UI spring. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  controlId
}: SegmentedProps<T>) {
  const generatedId = useId();
  const layoutId = `segmented-indicator-${controlId ?? generatedId}`;
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex rounded-control border border-border bg-background-subtle p-1',
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
              /* invisible padding grows the touch target to 44 px */
              "before:absolute before:inset-x-0 before:-inset-y-1 before:content-['']",
              active ? 'text-content' : 'text-content-secondary hover:text-content'
            )}
          >
            {active ? (
              <m.span
                layoutId={layoutId}
                transition={springs.ui}
                className="absolute inset-0 rounded-md bg-surface shadow-subtle"
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon ? <Icon size={16} aria-hidden /> : null}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
