import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, formatMonth, type MonthKey } from '@/shared/lib/dates';
import { cn } from './utils';

interface MonthSelectorProps {
  month: MonthKey;
  onChange: (month: MonthKey) => void;
  minMonth?: MonthKey;
  maxMonth?: MonthKey;
  className?: string;
}

export function MonthSelector({
  month,
  onChange,
  minMonth,
  maxMonth,
  className
}: MonthSelectorProps) {
  const atMin = minMonth !== undefined && month <= minMonth;
  const atMax = maxMonth !== undefined && month >= maxMonth;

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        aria-label="Mes anterior"
        disabled={atMin}
        onClick={() => onChange(addMonths(month, -1))}
        className="grid h-11 w-11 place-items-center rounded-full text-content-secondary transition-colors hover:bg-surface-hover hover:text-content disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={20} aria-hidden />
      </button>
      <span
        aria-live="polite"
        className="min-w-40 text-center text-sm font-semibold text-content"
      >
        {formatMonth(month)}
      </span>
      <button
        type="button"
        aria-label="Mes siguiente"
        disabled={atMax}
        onClick={() => onChange(addMonths(month, 1))}
        className="grid h-11 w-11 place-items-center rounded-full text-content-secondary transition-colors hover:bg-surface-hover hover:text-content disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight size={20} aria-hidden />
      </button>
    </div>
  );
}
