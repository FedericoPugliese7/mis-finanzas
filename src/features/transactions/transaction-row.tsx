import { Trash2 } from 'lucide-react';
import { iconFor } from '@/features/categories/category.constants';
import { formatMoney } from '@/shared/lib/money';
import { cn } from '@/shared/ui/utils';
import type { Category, Transaction } from '@/shared/lib/types';

interface TransactionRowProps {
  transaction: Transaction;
  category?: Category;
  onEdit: () => void;
  onDelete: () => void;
}

/** One movement inside a day group: tap to edit, trash to delete (undoable). */
export function TransactionRow({
  transaction,
  category,
  onEdit,
  onDelete
}: TransactionRowProps) {
  const isExpense = transaction.type === 'expense';
  const note = transaction.note?.trim();
  const title = note || category?.name || 'Sin categoría';
  const subtitle = note ? category?.name : undefined;
  const color = category?.color ?? '#94a3b8';
  const Icon = iconFor(category?.icon ?? 'circle-help');
  const amount = formatMoney(
    isExpense ? -transaction.amountMinor : transaction.amountMinor,
    transaction.currency
  );

  return (
    <li className="flex items-center gap-1 border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-surface-hover"
      >
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-control"
          style={{ backgroundColor: `${color}26`, color }}
        >
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-content">{title}</span>
          {subtitle ? (
            <span className="block truncate text-xs text-content-muted">{subtitle}</span>
          ) : null}
        </span>
        <span
          className={cn(
            'shrink-0 text-sm font-semibold tabular-nums',
            isExpense ? 'text-expense-content' : 'text-income-content'
          )}
        >
          {isExpense ? amount : `+${amount}`}
        </span>
      </button>
      <button
        type="button"
        aria-label={`Eliminar ${title}`}
        onClick={onDelete}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-content-secondary transition-colors hover:bg-surface-hover hover:text-expense"
      >
        <Trash2 size={16} aria-hidden />
      </button>
    </li>
  );
}
