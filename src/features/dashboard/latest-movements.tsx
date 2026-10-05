import { iconFor } from '@/features/categories/category.constants';
import { formatDayLabel } from '@/shared/lib/dates';
import { formatMoney } from '@/shared/lib/money';
import { cn } from '@/shared/ui/utils';
import type { Category, Transaction } from '@/shared/lib/types';

interface LatestMovementsProps {
  transactions: readonly Transaction[];
  categoriesById: ReadonlyMap<string, Category>;
}

/** Latest movements of the selected month (SPEC 4.1), read-only. */
export function LatestMovements({ transactions, categoriesById }: LatestMovementsProps) {
  if (transactions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-content-muted">
        Sin movimientos este mes.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {transactions.map((transaction) => {
        const category = categoriesById.get(transaction.categoryId);
        const isExpense = transaction.type === 'expense';
        const note = transaction.note?.trim();
        const title = note || category?.name || 'Sin categoría';
        const color = category?.color ?? '#9b958a';
        const Icon = iconFor(category?.icon ?? 'circle-help');
        const amount = formatMoney(
          isExpense ? -transaction.amountMinor : transaction.amountMinor,
          transaction.currency
        );

        return (
          <li key={transaction.id} className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-control"
              style={{ backgroundColor: `${color}26`, color }}
            >
              <Icon size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-content">{title}</span>
              <span className="block text-xs text-content-muted">
                {formatDayLabel(transaction.date)}
              </span>
            </span>
            <span
              className={cn(
                'amount shrink-0 text-sm font-semibold',
                isExpense ? 'text-expense-content' : 'text-income-content'
              )}
            >
              {isExpense ? amount : `+${amount}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
