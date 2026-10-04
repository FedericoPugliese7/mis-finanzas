import type { CategoryTotal } from '@/shared/lib/aggregations';
import { monthOf, type MonthKey } from '@/shared/lib/dates';
import type { Currency, DisplayCurrency, Transaction } from '@/shared/lib/types';

export interface DonutSlice {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  /** Share of the total expenses (%), rounded to an integer. */
  percent: number;
}

/** Currency used by the dashboard charts: `BOTH` falls back to ARS. */
export function chartCurrency(display: DisplayCurrency): Currency {
  return display === 'USD' ? 'USD' : 'ARS';
}

/** Expense categories with movement for the donut, with their share of the total. */
export function donutSlices(categoryTotals: readonly CategoryTotal[]): DonutSlice[] {
  const withMovement = categoryTotals.filter((item) => item.total > 0);
  const sum = withMovement.reduce((total, item) => total + item.total, 0);
  if (sum <= 0) return [];
  return withMovement.map((item) => ({
    categoryId: item.categoryId,
    name: item.name,
    color: item.color,
    icon: item.icon,
    total: item.total,
    percent: Math.round((item.total / sum) * 100)
  }));
}

/** Latest movements of a month: date descending, then creation time descending. */
export function latestTransactions(
  transactions: readonly Transaction[],
  month: MonthKey,
  limit: number
): Transaction[] {
  return transactions
    .filter((transaction) => monthOf(transaction.date) === month)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    .slice(0, limit);
}
