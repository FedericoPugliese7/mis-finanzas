import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useThemeStore } from '@/shared/stores/theme.store';
import { durationsMs } from '@/shared/motion';
import { formatMoney } from '@/shared/lib/money';
import type { Currency } from '@/shared/lib/types';
import { useChartEntrance } from './hooks/use-chart-entrance';
import { chartTheme } from './chart-theme';
import type { DonutSlice } from './dashboard.helpers';

interface CategoryDonutProps {
  slices: readonly DonutSlice[];
  currency: Currency;
}

/** Expense donut by category (SPEC 4.1). Animates only on first mount (SPEC 7.7). */
export default function CategoryDonut({ slices, currency }: CategoryDonutProps) {
  const animateOnMount = useChartEntrance();
  useThemeStore((state) => state.theme);
  const colors = chartTheme();
  const data = slices.map((slice) => ({
    id: slice.categoryId,
    name: slice.name,
    value: slice.total,
    color: slice.color,
    percent: slice.percent
  }));

  const totalValue = slices.reduce((sum, s) => sum + s.total, 0);

  return (
    <div
      role="img"
      aria-label="Gastos por categoría en dona. Los montos exactos están en la tabla siguiente."
    >
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={96}
            paddingAngle={2}
            isAnimationActive={animateOnMount}
            animationDuration={durationsMs.chart}
            animationEasing="ease-out"
            stroke={colors.surface}
            strokeWidth={2}
            label={({ name, percent }) => {
              const p = typeof percent === 'number' ? percent : 0;
              const n = typeof name === 'string' ? name : '';
              if (p <= 5 || p >= 100) return null;
              return (
                <span style={{ fontSize: 11, fontWeight: 600, fill: colors.content }}>
                  {n} {p}%
                </span>
              );
            }}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            cursor={false}
            contentStyle={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              color: colors.content,
              fontSize: 12
            }}
            formatter={(value, name) => [formatMoney(Number(value), currency), name]}
          />
        </PieChart>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-content">
              {formatMoney(totalValue, currency)}
            </div>
            <div className="text-xs text-content-muted">Total gastos</div>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
