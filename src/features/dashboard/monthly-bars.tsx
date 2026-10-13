import { m } from 'motion/react';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';
import { useThemeStore } from '@/shared/stores/theme.store';
import { barGrowthVariants, chartVariants, springs } from '@/shared/motion';
import { formatMonthShort } from '@/shared/lib/dates';
import { formatMoney, formatMoneyCompact } from '@/shared/lib/money';
import type { MonthlyBars } from '@/shared/lib/aggregations';
import type { Currency } from '@/shared/lib/types';
import { cn } from '@/shared/ui/utils';
import { useChartEntrance } from './hooks/use-chart-entrance';
import { chartTheme } from './chart-theme';
import { barLabelLayout } from './dashboard.helpers';

interface MonthlyBarsChartProps {
  bars: readonly MonthlyBars[];
  currency: Currency;
}

const TICK_COUNT = 4;
/** Headroom factor for the value labels above the tallest bar. */
const HEADROOM = 1.25;
/** Bars taller than this get their value label rendered inside the bar. */
const LABEL_INSIDE_THRESHOLD = 0.75;

/** Income vs expense bars for the last 6 months (SPEC 4.1). First mount only (SPEC 7.7). */
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
  const heightOf = (value: number): number =>
    scaleMax > 0 ? Math.min((value / scaleMax) * 100, 100) : 0;

  const labelLayout = barLabelLayout(bars, heightOf, LABEL_INSIDE_THRESHOLD);

  function labelClasses(lane: 'inside' | 'high' | 'low'): string {
    if (lane === 'inside') return 'top-2 text-content-inverse drop-shadow-sm';
    if (lane === 'high') return '-top-11 text-content';
    return '-top-5 text-content';
  }

  return (
    <m.div
      role="img"
      aria-label="Ingresos vs gastos de los últimos 6 meses en barras. Los montos exactos están en la tabla siguiente."
      className="h-[260px]"
      initial={animateOnMount ? 'hidden' : false}
      animate="visible"
      variants={chartVariants}
    >
      <div className="flex h-full gap-2">
        {/* Eje Y */}
        <div className="relative w-14 shrink-0 sm:w-[72px]">
          {ticks.map((tick) => {
            const bottom = Math.min(heightOf(tick), 92);
            return (
              <span
                key={tick}
                aria-hidden
                className="amount absolute right-0 -translate-y-1/2 text-[11px] font-medium text-content-secondary"
                style={{ bottom: `${bottom}%` }}
              >
                {formatMoney(Math.round(tick), currency, {
                  decimals: false,
                  symbol: false
                })}
              </span>
            );
          })}
        </div>

        {/* Área de plot */}
        <div className="relative flex-1">
          <div className="absolute inset-x-0 top-10 bottom-6">
            {/* Grilla horizontal + eje X */}
            {ticks.map((tick) => (
              <div
                key={tick}
                aria-hidden
                className="absolute inset-x-0 border-t border-dashed"
                style={{
                  bottom: `${Math.min(heightOf(tick), 92)}%`,
                  borderColor: colors.border
                }}
              />
            ))}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 border-t"
              style={{ borderColor: colors.border }}
            />

            {/* Barras */}
            <div className="absolute inset-0 flex items-end justify-around">
              {bars.map((bar, barIndex) => {
                const lanes = labelLayout[barIndex]!;
                return (
                  <div
                    key={bar.month}
                    className="flex h-full flex-1 items-end justify-center gap-1.5"
                  >
                    {lanes.map(({ kind, value, lane }, kindIndex) => {
                      const height = heightOf(value);
                      return (
                        <div
                          key={kind}
                          className="relative w-6 sm:w-8"
                          style={{ height: `${height}%` }}
                        >
                          <m.div
                            title={`${formatMonthShort(bar.month)} · ${kind}: ${formatMoney(value, currency)}`}
                            className="absolute inset-x-0 bottom-0 rounded-t-md"
                            style={{
                              height: '100%',
                              background:
                                kind === 'Ingresos'
                                  ? colors.incomeGradient
                                  : colors.expenseGradient,
                              transformOrigin: 'bottom',
                              boxShadow: `0 6px 16px -4px ${kind === 'Ingresos' ? colors.accentGlow.replace(')', ' / 0.45)') : 'rgb(255 122 107 / 0.35)'}`
                            }}
                            variants={barGrowthVariants}
                            initial={animateOnMount ? 'hidden' : false}
                            animate="visible"
                            whileHover={{ y: -2, transition: springs.micro }}
                            custom={barIndex * 2 + kindIndex}
                          />
                          {value > 0 && (
                            <span
                              aria-hidden
                              className={cn(
                                'amount absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold leading-none',
                                labelClasses(lane)
                              )}
                            >
                              {isDesktop
                                ? formatMoney(value, currency, { decimals: false })
                                : formatMoneyCompact(value, currency)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eje X: etiquetas de mes */}
          <div className="absolute inset-x-0 bottom-0 flex h-6 items-start">
            {bars.map((bar) => (
              <span
                key={bar.month}
                className="flex-1 text-center text-xs font-medium text-content-secondary"
              >
                {formatMonthShort(bar.month)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </m.div>
  );
}
