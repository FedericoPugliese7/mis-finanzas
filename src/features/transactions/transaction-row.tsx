import { Trash2 } from 'lucide-react';
import { m } from 'motion/react';
import { iconFor } from '@/features/categories/category.constants';
import { formatMoney } from '@/shared/lib/money';
import { RateLegend } from '@/shared/ui/rate-legend';
import { cn } from '@/shared/ui/utils';
import { listItemVariants } from '@/shared/motion';
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
  const color = category?.color ?? '#9b958a';
  const Icon = iconFor(category?.icon ?? 'circle-help');
  const amount = formatMoney(
    isExpense ? -transaction.amountMinor : transaction.amountMinor,
    transaction.currency
  );

  return (
    <m.li
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout="position"
      className="flex items-center gap-1 border-b border-border-subtle last:border-b-0"
    >
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-control px-2 py-3 text-left transition-colors hover:bg-surface-hover"
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
        <span className="shrink-0 text-right">
          <span
            className={cn(
              'amount block text-sm font-semibold',
              isExpense ? 'text-expense-content' : 'text-income-content'
            )}
          >
            {isExpense ? amount : `+${amount}`}
          </span>
          {transaction.currency === 'USD' ? (
            <RateLegend usdMinor={transaction.amountMinor} className="mt-0.5" />
          ) : null}
        </span>
      </button>
      <button
        type="button"
        aria-label={`Eliminar ${title}`}
        onClick={onDelete}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-control text-content-secondary transition-colors hover:bg-surface-hover hover:text-expense-content"
      >
        <Trash2 size={16} aria-hidden />
      </button>
    </m.li>
  );
}
