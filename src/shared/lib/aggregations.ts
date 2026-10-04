import type { Rate } from './currency';
import { convert, resolveRate } from './currency';
import { addMonths, monthOf, type MonthKey } from './dates';
import type {
  Category,
  Currency,
  DisplayCurrency,
  Transaction,
  TransactionType
} from './types';

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryTotal {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
}

export interface MonthlyBars {
  month: MonthKey;
  income: number;
  expense: number;
}

/** Income/expense totals of a single month, normalized to `target` currency. */
export function totalsByMonth(
  transactions: readonly Transaction[],
  month: MonthKey,
  target: Currency,
  referenceRate: Rate
): Totals {
  let income = 0;
  let expense = 0;
  for (const tx of transactions) {
    if (monthOf(tx.date) !== month) continue;
    const amount = convert(
      tx.amountMinor,
      tx.currency,
      target,
      resolveRate(tx, referenceRate)
    );
    if (tx.type === 'income') income += amount;
    else expense += amount;
  }
  return { income, expense, balance: income - expense };
}

/**
 * Expense (or income) totals grouped by category for a month, including
 * categories without movements (`total: 0`), sorted by total descending
 * and name ascending on ties.
 */
export function totalsByCategory(
  transactions: readonly Transaction[],
  month: MonthKey,
  categories: readonly Category[],
  target: Currency,
  referenceRate: Rate,
  type: TransactionType = 'expense'
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== type || monthOf(tx.date) !== month) continue;
    const amount = convert(
      tx.amountMinor,
      tx.currency,
      target,
      resolveRate(tx, referenceRate)
    );
    totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + amount);
  }
  return categories
    .filter((category) => category.type === type)
    .map((category) => ({
      categoryId: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      total: totals.get(category.id) ?? 0
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'es'));
}

/** Top categories with movement, limited to `limit` entries. */
export function topCategories(
  list: readonly CategoryTotal[],
  limit: number
): CategoryTotal[] {
  return list.filter((item) => item.total > 0).slice(0, limit);
}

/** Income vs expense bars for the 6 months ending at `anchorMonth` (inclusive). */
export function lastSixMonths(
  transactions: readonly Transaction[],
  anchorMonth: MonthKey,
  target: Currency,
  referenceRate: Rate
): MonthlyBars[] {
  const bars: MonthlyBars[] = [];
  for (let offset = -5; offset <= 0; offset += 1) {
    const month = addMonths(anchorMonth, offset);
    const totals = totalsByMonth(transactions, month, target, referenceRate);
    bars.push({ month, income: totals.income, expense: totals.expense });
  }
  return bars;
}

/** Totals of a month for the selected display currency (`BOTH` returns ARS and USD). */
export function totalsForDisplay(
  transactions: readonly Transaction[],
  month: MonthKey,
  display: DisplayCurrency,
  referenceRate: Rate
): Partial<Record<Currency, Totals>> {
  if (display === 'BOTH') {
    return {
      ARS: totalsByMonth(transactions, month, 'ARS', referenceRate),
      USD: totalsByMonth(transactions, month, 'USD', referenceRate)
    };
  }
  return { [display]: totalsByMonth(transactions, month, display, referenceRate) };
}
