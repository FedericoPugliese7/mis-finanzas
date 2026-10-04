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
  // Suscripción al tema: fuerza el re-render para releer las variables CSS.
  useThemeStore((state) => state.theme);
  const colors = chartTheme();
  const data = slices.map((slice) => ({
    id: slice.categoryId,
    name: slice.name,
    value: slice.total,
    color: slice.color
  }));

  return (
    <div
      role="img"
      aria-label="Gastos por categoría en dona. Los montos exactos están en la tabla siguiente."
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={1}
            isAnimationActive={animateOnMount}
            animationDuration={durationsMs.chart}
            animationEasing="ease-out"
            stroke={colors.surface}
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
      </ResponsiveContainer>
    </div>
  );
}
