import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
  useThemeStore((state) => state.theme);
  const colors = chartTheme();
  const data = bars.map((bar) => ({
    month: formatMonthShort(bar.month),
    income: bar.income,
    expense: bar.expense
  }));

  const maxIncome = Math.max(...bars.map((b) => b.income), 0);
  const maxExpense = Math.max(...bars.map((b) => b.expense), 0);
  const maxValue = Math.max(maxIncome, maxExpense);

  const incomeGradientId = 'incomeGradient';
  const expenseGradientId = 'expenseGradient';

  const formatBarLabel = (value: unknown) => {
    if (typeof value === 'number' && value > 0) {
      return formatMoney(value, currency, { decimals: false });
    }
    return '';
  };

  return (
    <div
      role="img"
      aria-label="Ingresos vs gastos de los últimos 6 meses en barras. Los montos exactos están en la tabla siguiente."
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
          barGap={6}
          barCategoryGap={12}
        >
          <defs>
            <linearGradient id={incomeGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.income} stopOpacity={0.9} />
              <stop offset="100%" stopColor={colors.income} stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id={expenseGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.expense} stopOpacity={0.9} />
              <stop offset="100%" stopColor={colors.expense} stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={colors.border} strokeDasharray="4 4" />
          <XAxis
            dataKey="month"
            interval={0}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
            tick={{ fill: colors.contentMuted, fontSize: 12, fontWeight: 500 }}
            dy={8}
          />
          <YAxis
            width={72}
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.contentMuted, fontSize: 11 }}
            tickFormatter={(value: number) =>
              formatMoney(value, currency, { decimals: false, symbol: false })
            }
            domain={[0, maxValue * 1.15]}
          />
          <Tooltip
            cursor={{ fill: colors.border, fillOpacity: 0.25, stroke: colors.border }}
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
            labelFormatter={(month) => month}
          />
          <Bar
            dataKey="income"
            fill={`url(#${incomeGradientId})`}
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
            isAnimationActive={animateOnMount}
            animationDuration={durationsMs.chart}
            animationEasing="ease-out"
          >
            <LabelList
              dataKey="income"
              position="top"
              offset={4}
              formatter={formatBarLabel}
              style={{ fontSize: 10, fontWeight: 600, fill: colors.content }}
            />
          </Bar>
          <Bar
            dataKey="expense"
            fill={`url(#${expenseGradientId})`}
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
            isAnimationActive={animateOnMount}
            animationDuration={durationsMs.chart}
            animationEasing="ease-out"
          >
            <LabelList
              dataKey="expense"
              position="top"
              offset={4}
              formatter={formatBarLabel}
              style={{ fontSize: 10, fontWeight: 600, fill: colors.content }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
