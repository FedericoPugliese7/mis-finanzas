import { monthOf, todayISO, type DateISO, type MonthKey } from '@/shared/lib/dates';
import type {
  Category,
  Currency,
  Transaction,
  TransactionType
} from '@/shared/lib/types';
import type { TransactionFormValues } from './transaction.schema';

export type TypeFilter = TransactionType | 'all';
export type CurrencyFilter = Currency | 'all';

export interface TransactionFilters {
  month: MonthKey;
  type: TypeFilter;
  currency: CurrencyFilter;
  categoryId: string | 'all';
  query: string;
}

const DIACRITIC_PATTERN = /\p{Diacritic}/gu;

function normalize(text: string): string {
  return text.normalize('NFD').replace(DIACRITIC_PATTERN, '').toLowerCase();
}

/** Pure month/type/currency/category/text filter (text ignores case and accents). */
export function filterTransactions(
  transactions: readonly Transaction[],
  filters: TransactionFilters,
  categoryNames: ReadonlyMap<string, string> = new Map()
): Transaction[] {
  const query = normalize(filters.query.trim());
  return transactions.filter((transaction) => {
    if (monthOf(transaction.date) !== filters.month) return false;
    if (filters.type !== 'all' && transaction.type !== filters.type) return false;
    if (filters.currency !== 'all' && transaction.currency !== filters.currency)
      return false;
    if (filters.categoryId !== 'all' && transaction.categoryId !== filters.categoryId) {
      return false;
    }
    if (query.length > 0) {
      const haystack = normalize(
        `${transaction.note ?? ''} ${categoryNames.get(transaction.categoryId) ?? ''}`
      );
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export interface DayGroup {
  date: DateISO;
  items: Transaction[];
}

/** Groups by day (descending); within a day the newest `createdAt` goes first. */
export function groupTransactionsByDay(transactions: readonly Transaction[]): DayGroup[] {
  const sorted = [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

  const groups: DayGroup[] = [];
  for (const transaction of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.date === transaction.date) {
      last.items.push(transaction);
    } else {
      groups.push({ date: transaction.date, items: [transaction] });
    }
  }
  return groups;
}

/**
 * Categories selectable for a transaction of `type`: active ones, plus the
 * category a transaction already references even if it was archived later.
 */
export function categoryOptionsFor(
  categories: readonly Category[],
  type: TransactionType,
  keepId?: string
): Category[] {
  const options = categories.filter(
    (category) => category.type === type && !category.archived
  );
  if (keepId !== undefined && keepId !== '' && !options.some((c) => c.id === keepId)) {
    const keep = categories.find((category) => category.id === keepId);
    if (keep && keep.type === type) options.push(keep);
  }
  return options;
}

/** Form defaults for a new movement (first active expense category, today). */
export function newTransactionDefaults(
  categories: readonly Category[]
): TransactionFormValues {
  const firstCategory = categories.find(
    (category) => category.type === 'expense' && !category.archived
  );
  return {
    type: 'expense',
    amountMinor: null,
    currency: 'ARS',
    categoryId: firstCategory?.id ?? '',
    date: todayISO(),
    note: '',
    exchangeRate: null
  };
}

/** Form defaults for editing an existing movement. */
export function editTransactionDefaults(transaction: Transaction): TransactionFormValues {
  return {
    type: transaction.type,
    amountMinor: transaction.amountMinor,
    currency: transaction.currency,
    categoryId: transaction.categoryId,
    date: transaction.date,
    note: transaction.note ?? '',
    exchangeRate: transaction.exchangeRate ?? null
  };
}
