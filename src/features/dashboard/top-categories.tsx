import { iconFor } from '@/features/categories/category.constants';
import type { CategoryTotal } from '@/shared/lib/aggregations';
import { formatMoney } from '@/shared/lib/money';
import type { Currency } from '@/shared/lib/types';

interface TopCategoriesProps {
  categories: readonly CategoryTotal[];
  currency: Currency;
  /** Total expenses of the month, to compute each category's share. */
  totalExpense: number;
}

/** Top expense categories of the month with their share of the total (SPEC 4.1). */
export function TopCategories({
  categories,
  currency,
  totalExpense
}: TopCategoriesProps) {
  if (categories.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-content-muted">
        Sin gastos con movimiento este mes.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {categories.map((category) => {
        const Icon = iconFor(category.icon);
        const share =
          totalExpense > 0 ? Math.round((category.total / totalExpense) * 100) : 0;
        return (
          <li key={category.categoryId} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid h-8 w-8 shrink-0 place-items-center rounded-control"
                style={{ backgroundColor: `${category.color}26`, color: category.color }}
              >
                <Icon size={16} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-content">
                {category.name}
              </span>
              <span className="amount shrink-0 text-sm font-semibold text-content">
                {formatMoney(category.total, currency)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                aria-hidden
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent-soft"
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${share}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-xs amount text-content-muted">
                {share} %
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
