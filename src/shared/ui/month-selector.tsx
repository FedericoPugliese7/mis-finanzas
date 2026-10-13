import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { monthChangeVariants } from '@/shared/motion';
import { addMonths, formatMonth, type MonthKey } from '@/shared/lib/dates';
import { cn } from './utils';

interface MonthSelectorProps {
  month: MonthKey;
  onChange: (month: MonthKey) => void;
  minMonth?: MonthKey;
  maxMonth?: MonthKey;
  className?: string;
  size?: 'md' | 'sm';
}

/**
 * Month selector with a directional slide on the label:
 * next month slides from right to left, previous month from left to right.
 */
export function MonthSelector({
  month,
  onChange,
  minMonth,
  maxMonth,
  className,
  size = 'md'
}: MonthSelectorProps) {
  const atMin = minMonth !== undefined && month <= minMonth;
  const atMax = maxMonth !== undefined && month >= maxMonth;
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  function goPrevious(): void {
    setDirection('left');
    onChange(addMonths(month, -1));
  }

  function goNext(): void {
    setDirection('right');
    onChange(addMonths(month, 1));
  }

  const isSmall = size === 'sm';

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        aria-label="Mes anterior"
        disabled={atMin}
        onClick={goPrevious}
        className={cn(
          'grid place-items-center rounded-full text-content-secondary transition-colors hover:bg-surface-hover hover:text-content disabled:pointer-events-none disabled:opacity-40',
          isSmall ? 'h-9 w-9' : 'h-11 w-11'
        )}
      >
        <ChevronLeft size={isSmall ? 18 : 20} aria-hidden />
      </button>
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={month}
          aria-live="polite"
          variants={monthChangeVariants}
          initial={direction === 'right' ? 'enterFromRight' : 'enterFromLeft'}
          animate="settle"
          exit={direction === 'right' ? 'exitLeft' : 'exitRight'}
          className={cn(
            'text-center font-semibold text-content',
            isSmall ? 'min-w-36 text-[13px]' : 'min-w-40 text-sm'
          )}
        >
          {formatMonth(month)}
        </m.span>
      </AnimatePresence>
      <button
        type="button"
        aria-label="Mes siguiente"
        disabled={atMax}
        onClick={goNext}
        className={cn(
          'grid place-items-center rounded-full text-content-secondary transition-colors hover:bg-surface-hover hover:text-content disabled:pointer-events-none disabled:opacity-40',
          isSmall ? 'h-9 w-9' : 'h-11 w-11'
        )}
      >
        <ChevronRight size={isSmall ? 18 : 20} aria-hidden />
      </button>
    </div>
  );
}
