import { m } from 'motion/react';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';
import { useThemeStore } from '@/shared/stores/theme.store';
import { barGrowthXVariants, chartVariants, springs } from '@/shared/motion';
import { formatMonthShort } from '@/shared/lib/dates';
import { formatMoney, formatMoneyCompact } from '@/shared/lib/money';
import type { MonthlyBars } from '@/shared/lib/aggregations';
import type { Currency } from '@/shared/lib/types';
import { cn } from '@/shared/ui/utils';
import { useChartEntrance } from './hooks/use-chart-entrance';
import { chartTheme } from './chart-theme';
import { barLabelPlacement } from './dashboard.helpers';

interface MonthlyBarsChartProps {
  bars: readonly MonthlyBars[];
  currency: Currency;
}

const TICK_COUNT = 4;
/** Headroom factor so the longest bar leaves room for its value label. */
const HEADROOM = 1.15;
/** Bars longer than this place the value label inside the bar end. */
const LABEL_INSIDE_THRESHOLD = 0.75;

/** Horizontal income vs expense bars for the last 6 months. First mount only (SPEC 7.7). */
export default function MonthlyBarsChart({ bars, currency }: MonthlyBarsChartProps) {
  const animateOnMount = useChartEntrance();
  const isDesktop = useIsDesktop();
  useThemeStore((state) => state.theme);
  const colors = chartTheme();

  const maxValue = Math.max(...bars.map((b) => Math.max(b.income, b.expense)), 0);
  const scaleMax = maxValue * HEADROOM;
  const ticks =
    scaleMax > 0
      ? Array.from({ length: TICK_COUNT }, (_, i) => (scaleMax * i) / (TICK_COUNT - 1))
      : [0];
  const widthOf = (value: number): number =>
    scaleMax > 0 ? Math.min((value / scaleMax) * 100, 100) : 0;

  const labelLayout = barLabelPlacement(bars, widthOf, LABEL_INSIDE_THRESHOLD);

  return (
    <m.div
      role="img"
      aria-label="Ingresos vs gastos de los últimos 6 meses en barras horizontales. Los montos exactos están en la tabla siguiente."
      className="flex flex-col gap-3"
      initial={animateOnMount ? 'hidden' : false}
      animate="visible"
      variants={chartVariants}
    >
      {bars.map((bar, barIndex) => {
        const placements = labelLayout[barIndex]!;
        return (
          <div key={bar.month} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-right text-xs font-medium text-content-secondary sm:w-16">
              {formatMonthShort(bar.month)}
            </span>

            <div className="relative flex-1">
              {/* Grilla vertical */}
              {ticks.map((tick) => (
                <div
                  key={tick}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 border-l border-dashed"
                  style={{
                    left: `${widthOf(tick)}%`,
                    borderColor: colors.border
                  }}
                />
              ))}

              {/* Barras */}
              <div className="flex flex-col justify-center gap-1 py-0.5">
                {placements.map(({ kind, value, width, placement }, kindIndex) => {
                  const isIncome = kind === 'Ingresos';
                  return (
                    <div key={kind} className="relative h-3 w-full">
                      {value > 0 && (
                        <>
                          <m.div
                            title={`${formatMonthShort(bar.month)} · ${kind}: ${formatMoney(value, currency)}`}
                            className="absolute inset-y-0 left-0 rounded-r-md"
                            style={{
                              width: `${width}%`,
                              background: isIncome
                                ? colors.incomeGradient
                                : colors.expenseGradient,
                              transformOrigin: 'left',
                              boxShadow: `4px 0 16px -4px ${isIncome ? colors.accentGlow.replace(')', ' / 0.45)') : 'rgb(255 122 107 / 0.35)'}`
                            }}
                            variants={barGrowthXVariants}
                            initial={animateOnMount ? 'hidden' : false}
                            animate="visible"
                            whileHover={{ x: 2, transition: springs.micro }}
                            custom={barIndex * 2 + kindIndex}
                          />
                          <span
                            aria-hidden
                            className={cn(
                              'amount pointer-events-none absolute inset-y-0 flex items-center whitespace-nowrap text-[10px] font-semibold leading-none',
                              placement === 'inside'
                                ? 'justify-end pr-1.5 text-content-inverse drop-shadow-sm'
                                : 'pl-1.5 text-content'
                            )}
                            style={{
                              left: `${width}%`,
                              transform:
                                placement === 'inside' ? 'translateX(-100%)' : undefined
                            }}
                          >
                            {isDesktop
                              ? formatMoney(value, currency, { decimals: false })
                              : formatMoneyCompact(value, currency)}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </m.div>
  );
}
