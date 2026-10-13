import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { formatMoney } from '@/shared/lib/money';
import {
  chartVariants,
  chartPhaseDelay,
  durations,
  fadeOnlyVariants,
  springs,
  transitions
} from '@/shared/motion';
import type { Currency } from '@/shared/lib/types';
import { cn } from '@/shared/ui/utils';
import { useChartEntrance } from './hooks/use-chart-entrance';
import type { DonutSlice } from './dashboard.helpers';

interface CategoryDonutProps {
  slices: readonly DonutSlice[];
  currency: Currency;
  /** Navigates to Movimientos filtered by the tapped category. */
  onSelectCategory: (categoryId: string) => void;
}

/* Geometry: matches the previous innerRadius 68 / outerRadius 96 pie. */
const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 82;
const STROKE = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Slice separator, in degrees (the previous `paddingAngle`). */
const GAP_DEGREES = 2;
const GAP_ARCS = (GAP_DEGREES / 360) * CIRCUMFERENCE;

/**
 * Expense donut by category (SPEC 4.1). Animates only on first mount (SPEC 7.7).
 * Hovering or focusing a slice highlights it; tapping it drills down into
 * Movimientos filtered by the category.
 */
export default function CategoryDonut({
  slices,
  currency,
  onSelectCategory
}: CategoryDonutProps) {
  const animateOnMount = useChartEntrance();
  const [activeId, setActiveId] = useState<string | null>(null);
  const totalValue = slices.reduce((sum, s) => sum + s.total, 0);
  const active = slices.find((slice) => slice.categoryId === activeId);
  const hasActive = activeId !== null;

  let cursor = 0;
  const arcs = slices.map((slice) => {
    const length = totalValue > 0 ? (slice.total / totalValue) * CIRCUMFERENCE : 0;
    const start = cursor;
    cursor += length;
    return { slice, offset: -start, visible: Math.max(length - GAP_ARCS, 0) };
  });

  return (
    <div className="select-none">
      <div
        role="img"
        aria-label={`Gastos por categoría en dona. Total: ${formatMoney(totalValue, currency, { decimals: false })}. Los montos exactos están en la tabla siguiente.`}
        className="relative"
      >
        <m.svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-[240px] w-full"
          initial={animateOnMount ? 'hidden' : false}
          animate="visible"
          variants={chartVariants}
        >
          {arcs.map(({ slice, offset, visible }, index) => {
            const isActive = slice.categoryId === activeId;
            return (
              <g key={slice.categoryId}>
                {/* Halo: wider hit area + highlight behind the slice */}
                <m.circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={hasActive && isActive ? STROKE + 10 : STROKE + 6}
                  strokeDasharray={`${visible} ${CIRCUMFERENCE - visible}`}
                  strokeDashoffset={offset}
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                  initial={{ opacity: 0.18 }}
                  animate={{
                    opacity:
                      hasActive && !isActive ? 0.08 : hasActive && isActive ? 0.3 : 0.18
                  }}
                  transition={springs.ui}
                  className="cursor-pointer"
                  onHoverStart={() => setActiveId(slice.categoryId)}
                  onHoverEnd={() => setActiveId(null)}
                  onClick={() =>
                    isActive
                      ? onSelectCategory(slice.categoryId)
                      : setActiveId(slice.categoryId)
                  }
                  whileTap={{ scale: 0.98, transition: springs.micro }}
                  style={{ transformOrigin: 'center' }}
                />
                <m.circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${visible} ${CIRCUMFERENCE - visible}`}
                  strokeDashoffset={offset}
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                  className="cursor-pointer"
                  initial={
                    animateOnMount ? { strokeDashoffset: offset - visible } : false
                  }
                  animate={{
                    strokeDashoffset: offset,
                    scale: isActive ? 1.03 : 1,
                    strokeWidth: isActive ? STROKE + 6 : STROKE,
                    opacity: hasActive && !isActive ? 0.45 : 1
                  }}
                  transition={{
                    strokeDashoffset: {
                      ...transitions.chart,
                      delay: chartPhaseDelay + index * durations.stagger
                    },
                    scale: springs.ui,
                    strokeWidth: springs.ui,
                    opacity: springs.ui
                  }}
                  onHoverStart={() => setActiveId(slice.categoryId)}
                  onHoverEnd={() => setActiveId(null)}
                  onClick={() =>
                    isActive
                      ? onSelectCategory(slice.categoryId)
                      : setActiveId(slice.categoryId)
                  }
                  whileTap={{ scale: 0.98, transition: springs.micro }}
                  style={{ transformOrigin: 'center' }}
                >
                  <title>{`${slice.name}: ${formatMoney(slice.total, currency)}`}</title>
                </m.circle>
              </g>
            );
          })}
        </m.svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={activeId ?? 'total'}
              variants={fadeOnlyVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex max-w-32 flex-col items-center gap-0.5 text-center"
            >
              {active ? (
                <>
                  <span className="max-w-32 truncate text-xs font-medium text-content-secondary">
                    {active.name}
                  </span>
                  <span className="amount whitespace-nowrap text-base font-semibold text-content sm:text-lg">
                    {formatMoney(active.total, currency, { decimals: false })}
                  </span>
                  <span className="amount text-xs text-content-muted">
                    {active.percent} % del total
                  </span>
                </>
              ) : (
                <span className="amount whitespace-nowrap text-base font-semibold text-content sm:text-lg">
                  {formatMoney(totalValue, currency, { decimals: false })}
                </span>
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Legend: interactive buttons that mirror the chart highlight. */}
      <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
        {slices.map((slice) => {
          const isActive = slice.categoryId === activeId;
          return (
            <li key={slice.categoryId}>
              <button
                type="button"
                aria-pressed={isActive}
                aria-label={`${slice.name}: ${formatMoney(slice.total, currency)} (${slice.percent} % del total)`}
                className="flex items-center gap-1.5 rounded-control px-1.5 py-1 transition-colors hover:bg-surface-hover focus-visible:outline-offset-1"
                onMouseEnter={() => setActiveId(slice.categoryId)}
                onFocus={() => setActiveId(slice.categoryId)}
                onClick={() =>
                  setActiveId((current) =>
                    current === slice.categoryId ? null : slice.categoryId
                  )
                }
              >
                <m.span
                  aria-hidden
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                  animate={{ scale: isActive ? 1.5 : 1 }}
                  transition={springs.micro}
                />
                <span
                  className={cn(
                    'text-xs',
                    isActive ? 'font-semibold text-content' : 'text-content-secondary'
                  )}
                >
                  {slice.name}
                </span>
                <span
                  className={cn(
                    'amount text-xs',
                    isActive ? 'font-semibold text-content' : 'text-content-muted'
                  )}
                >
                  {slice.percent} %
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
