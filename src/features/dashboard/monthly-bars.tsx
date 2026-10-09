import { m } from 'motion/react';
import { useThemeStore } from '@/shared/stores/theme.store';
import { barGrowthVariants, chartVariants } from '@/shared/motion';
import { formatMonthShort } from '@/shared/lib/dates';
import { formatMoney } from '@/shared/lib/money';
import type { MonthlyBars } from '@/shared/lib/aggregations';
import type { Currency } from '@/shared/lib/types';
import { useChartEntrance } from './hooks/use-chart-entrance';
import { chartTheme } from './chart-theme';

interface MonthlyBarsChartProps {
  bars: readonly MonthlyBars[];
  currency: Currency;
}

const TICK_COUNT = 4;
/** Headroom factor for the value labels above the tallest bar (was Recharts' `domain`). */
const HEADROOM = 1.15;

/** Income vs expense bars for the last 6 months (SPEC 4.1). First mount only (SPEC 7.7). */
export default function MonthlyBarsChart({ bars, currency }: MonthlyBarsChartProps) {
  const animateOnMount = useChartEntrance();
  useThemeStore((state) => state.theme);
  const colors = chartTheme();

  const maxValue = Math.max(...bars.map((b) => Math.max(b.income, b.expense)), 0);
  const scaleMax = maxValue * HEADROOM;
  const ticks =
    scaleMax > 0
      ? Array.from({ length: TICK_COUNT }, (_, i) => (scaleMax * i) / (TICK_COUNT - 1))
      : [0];
  const heightOf = (value: number): string =>
    scaleMax > 0 ? `${Math.min((value / scaleMax) * 100, 100)}%` : '0%';

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
          {ticks.map((tick) => (
            <span
              key={tick}
              aria-hidden
              className="amount absolute right-0 -translate-y-1/2 text-[11px] text-content-muted"
              style={{ bottom: heightOf(tick) }}
            >
              {formatMoney(Math.round(tick), currency, {
                decimals: false,
                symbol: false
              })}
            </span>
          ))}
        </div>

        {/* Área de plot */}
        <div className="relative flex-1">
          <div className="absolute inset-x-0 top-4 bottom-6">
            {/* Grilla horizontal + eje X */}
            {ticks.map((tick) => (
              <div
                key={tick}
                aria-hidden
                className="absolute inset-x-0 border-t border-dashed"
                style={{ bottom: heightOf(tick), borderColor: colors.border }}
              />
            ))}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 border-t"
              style={{ borderColor: colors.border }}
            />

            {/* Barras */}
            <div className="absolute inset-0 flex items-end justify-around">
              {bars.map((bar, barIndex) => (
                <div
                  key={bar.month}
                  className="flex h-full flex-1 items-end justify-center gap-1.5"
                >
                  {(
                    [
                      { kind: 'Ingresos', value: bar.income, color: colors.income },
                      { kind: 'Gastos', value: bar.expense, color: colors.expense }
                    ] as const
                  ).map(({ kind, value, color }) => (
                    <m.div
                      key={kind}
                      title={`${formatMonthShort(bar.month)} · ${kind}: ${formatMoney(value, currency)}`}
                      className="relative w-6 rounded-t-md sm:w-8"
                      style={{ height: heightOf(value), backgroundColor: color, transformOrigin: 'bottom' }}
                      variants={barGrowthVariants}
                      initial={animateOnMount ? 'hidden' : false}
                      animate="visible"
                      custom={barIndex * 2 + (kind === 'Ingresos' ? 0 : 1)}
                    >
                        {value > 0 && (
                        <span
                          aria-hidden
                          className="amount absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-content"
                        >
                          {formatMoney(value, currency, { decimals: false })}
                        </span>
                      )}
                    </m.div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Eje X: etiquetas de mes */}
          <div className="absolute inset-x-0 bottom-0 flex h-6 items-start">
            {bars.map((bar) => (
              <span
                key={bar.month}
                className="flex-1 text-center text-xs font-medium text-content-muted"
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
