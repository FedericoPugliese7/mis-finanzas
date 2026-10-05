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
    <div>
      <div
        role="img"
        aria-label={`Gastos por categoría en dona. Total: ${formatMoney(totalValue, currency, { decimals: false })}. Los montos exactos están en la tabla siguiente.`}
        className="relative"
      >
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={68}
              outerRadius={96}
              paddingAngle={2}
              isAnimationActive={animateOnMount}
              animationDuration={durationsMs.chart}
              animationEasing="ease-out"
              stroke={colors.surface}
              strokeWidth={2}
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
