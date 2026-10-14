import { m } from 'motion/react';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';
import { useThemeStore } from '@/shared/stores/theme.store';
import { barGrowthXVariants, barLabelXVariants, chartVariants } from '@/shared/motion';
import { formatMonthShort } from '@/shared/lib/dates';
import { formatMoney, formatMoneyCompact } from '@/shared/lib/money';
import type { MonthlyBars } from '@/shared/lib/aggregations';
import type { Currency } from '@/shared/lib/types';
import { cn } from '@/shared/ui/utils';
import { useChartEntrance } from './hooks/use-chart-entrance';
import { chartTheme } from './chart-theme';

interface MonthlyBarsChartProps {
  bars: readonly MonthlyBars[];
  currency: Currency;
}

const TICK_COUNT = 4;

/** Horizontal income vs expense bars for the last 6 months. First mount only (SPEC 7.7). */
export default function MonthlyBarsChart({ bars, currency }: MonthlyBarsChartProps) {
  const animateOnMount = useChartEntrance();
  const isDesktop = useIsDesktop();
  useThemeStore((state) => state.theme);
  const colors = chartTheme();

  const maxValue = Math.max(...bars.map((b) => Math.max(b.income, b.expense)), 0);
  const ticks =
    maxValue > 0
      ? Array.from({ length: TICK_COUNT }, (_, i) => (maxValue * i) / (TICK_COUNT - 1))
      : [0];
  const widthOf = (value: number): number =>
    maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

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
        const rows: Array<{
          kind: 'Ingresos' | 'Gastos';
          value: number;
          colorClass: string;
          glow: string;
          gradient: string;
        }> = [
          {
            kind: 'Ingresos',
            value: bar.income,
            colorClass: 'text-income-content',
            glow: colors.incomeGlow,
            gradient: colors.incomeGradient
          },
          {
            kind: 'Gastos',
            value: bar.expense,
            colorClass: 'text-expense-content',
            glow: colors.expenseGlow,
            gradient: colors.expenseGradient
          }
        ];

        return (
          <div key={bar.month} className="flex items-stretch gap-2 sm:gap-3">
            <span className="w-10 shrink-0 self-center text-right text-xs font-medium text-content-secondary sm:w-12">
              {formatMonthShort(bar.month)}
            </span>

            <div className="relative flex-1">
              {/* Grilla vertical */}
              {ticks.map((tick) => (
                <div
                  key={tick}
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute inset-y-0 border-l',
                    tick === 0 ? 'border-solid' : 'border-dashed'
                  )}
                  style={{
                    left: `${widthOf(tick)}%`,
                    borderColor: tick === 0 ? colors.border : colors.borderSubtle
                  }}
                />
              ))}

              {/* Barras */}
              <div className="flex flex-col justify-center gap-1 py-0.5">
                {rows.map(({ kind, value, glow, gradient }, kindIndex) => {
                  const width = widthOf(value);
                  const custom = barIndex * 2 + kindIndex;
                  return (
                    <div key={kind} className="relative h-3 w-full">
                      <m.div
                        title={`${formatMonthShort(bar.month)} · ${kind}: ${formatMoney(value, currency)}`}
                        className="absolute inset-y-0 left-0 rounded-r-md"
                        style={{
                          width: `${width}%`,
                          background: gradient,
                          transformOrigin: 'left',
                          boxShadow: `4px 0 16px -4px ${glow}`
                        }}
                        variants={barGrowthXVariants}
                        initial={animateOnMount ? 'hidden' : false}
                        animate="visible"
                        custom={custom}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Columna de montos */}
            <div className="flex w-20 shrink-0 flex-col justify-center gap-1 py-0.5 text-right sm:w-28">
              {rows.map(({ kind, value, colorClass }, kindIndex) => {
                const custom = barIndex * 2 + kindIndex;
                return (
                  <m.span
                    key={kind}
                    aria-hidden
                    variants={barLabelXVariants}
                    initial={animateOnMount ? 'hidden' : false}
                    animate="visible"
                    custom={custom}
                    className={cn(
                      'amount block text-xs font-medium leading-none',
                      colorClass,
                      value === 0 && 'text-content-muted'
                    )}
                  >
                    {value === 0
                      ? '—'
                      : isDesktop
                        ? formatMoney(value, currency, { decimals: false })
                        : formatMoneyCompact(value, currency)}
                  </m.span>
                );
              })}
            </div>
          </div>
        );
      })}
    </m.div>
  );
}
