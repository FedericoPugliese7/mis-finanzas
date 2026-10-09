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
  className
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

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        aria-label="Mes anterior"
        disabled={atMin}
        onClick={goPrevious}
        className="grid h-11 w-11 place-items-center rounded-full text-content-secondary transition-colors hover:bg-surface-hover hover:text-content disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={20} aria-hidden />
      </button>
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={month}
          aria-live="polite"
          variants={monthChangeVariants}
          initial={direction === 'right' ? 'enterFromRight' : 'enterFromLeft'}
          animate="settle"
          exit={direction === 'right' ? 'exitLeft' : 'exitRight'}
          className="min-w-40 text-center text-sm font-semibold text-content"
        >
          {formatMonth(month)}
        </m.span>
      </AnimatePresence>
      <button
        type="button"
        aria-label="Mes siguiente"
        disabled={atMax}
        onClick={goNext}
        className="grid h-11 w-11 place-items-center rounded-full text-content-secondary transition-colors hover:bg-surface-hover hover:text-content disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight size={20} aria-hidden />
      </button>
    </div>
  );
}
