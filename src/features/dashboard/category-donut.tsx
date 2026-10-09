import { m } from 'motion/react';
import { formatMoney } from '@/shared/lib/money';
import { chartVariants, transitions } from '@/shared/motion';
import type { Currency } from '@/shared/lib/types';
import { useChartEntrance } from './hooks/use-chart-entrance';
import type { DonutSlice } from './dashboard.helpers';

interface CategoryDonutProps {
  slices: readonly DonutSlice[];
  currency: Currency;
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

/** Expense donut by category (SPEC 4.1). Animates only on first mount (SPEC 7.7). */
export default function CategoryDonut({ slices, currency }: CategoryDonutProps) {
  const animateOnMount = useChartEntrance();
  const totalValue = slices.reduce((sum, s) => sum + s.total, 0);

  let cursor = 0;
  const arcs = slices.map((slice) => {
    const length = totalValue > 0 ? (slice.total / totalValue) * CIRCUMFERENCE : 0;
    const start = cursor;
    cursor += length;
    return { slice, offset: -start, visible: Math.max(length - GAP_ARCS, 0) };
  });

  return (
    <div>
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
          {arcs.map(({ slice, offset, visible }) => (
            <m.circle
              key={slice.categoryId}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={slice.color}
              strokeWidth={STROKE}
              strokeDasharray={`${visible} ${CIRCUMFERENCE - visible}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              initial={
                animateOnMount
                  ? { strokeDashoffset: offset - visible }
                  : false
              }
              animate={{ strokeDashoffset: offset, transition: transitions.chart }}
            >
              <title>{`${slice.name}: ${formatMoney(slice.total, currency)}`}</title>
            </m.circle>
          ))}
        </m.svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="amount whitespace-nowrap text-base font-semibold text-content sm:text-lg">
            {formatMoney(totalValue, currency, { decimals: false })}
          </div>
        </div>
      </div>

      {/* Leyenda visible (la tabla exacta queda detrás del <details>) */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {slices.map((slice) => (
          <li key={slice.categoryId} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-xs text-content-secondary">{slice.name}</span>
            <span className="text-xs amount text-content-muted">{slice.percent} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
