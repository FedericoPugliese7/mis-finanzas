import { iconFor } from '@/features/categories/category.constants';
import type { CategoryTotal } from '@/shared/lib/aggregations';
import { formatMoney } from '@/shared/lib/money';
import type { Currency } from '@/shared/lib/types';

interface TopCategoriesProps {
  categories: readonly CategoryTotal[];
  currency: Currency;
}

/** Top expense categories of the month (SPEC 4.1). */
export function TopCategories({ categories, currency }: TopCategoriesProps) {
  if (categories.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-content-muted">
        Sin gastos con movimiento este mes.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {categories.map((category) => {
        const Icon = iconFor(category.icon);
        return (
          <li key={category.categoryId} className="flex items-center gap-3">
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
            <span className="shrink-0 text-sm font-semibold tabular-nums text-content">
              {formatMoney(category.total, currency)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
