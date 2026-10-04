import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useThemeStore } from '@/shared/stores/theme.store';
import { durationsMs } from '@/shared/motion';
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

/** Income vs expense bars for the last 6 months (SPEC 4.1). First mount only (SPEC 7.7). */
export default function MonthlyBarsChart({ bars, currency }: MonthlyBarsChartProps) {
  const animateOnMount = useChartEntrance();
  // Suscripción al tema: fuerza el re-render para releer las variables CSS.
  useThemeStore((state) => state.theme);
  const colors = chartTheme();
  const data = bars.map((bar) => ({
    month: formatMonthShort(bar.month),
    income: bar.income,
    expense: bar.expense
  }));

  return (
    <div
      role="img"
      aria-label="Ingresos vs gastos de los últimos 6 meses en barras. Los montos exactos están en la tabla siguiente."
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          barGap={4}
        >
          <CartesianGrid vertical={false} stroke={colors.border} strokeDasharray="4 4" />
          <XAxis
            dataKey="month"
            interval={0}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
            tick={{ fill: colors.contentMuted, fontSize: 12 }}
          />
          <YAxis
            width={76}
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.contentMuted, fontSize: 12 }}
            tickFormatter={(value: number) =>
              formatMoney(value, currency, { decimals: false })
            }
          />
          <Tooltip
            cursor={{ fill: colors.border, fillOpacity: 0.35 }}
            contentStyle={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              color: colors.content,
              fontSize: 12
            }}
            formatter={(value, name) => [
              formatMoney(Number(value), currency),
              name === 'income' ? 'Ingresos' : 'Gastos'
            ]}
          />
          <Bar
            dataKey="income"
            fill={colors.income}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={animateOnMount}
            animationDuration={durationsMs.chart}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="expense"
            fill={colors.expense}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={animateOnMount}
            animationDuration={durationsMs.chart}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
