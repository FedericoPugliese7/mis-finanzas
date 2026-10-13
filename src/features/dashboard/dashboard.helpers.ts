import type { CategoryTotal, MonthlyBars } from '@/shared/lib/aggregations';
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

export type BarLabelLane = 'inside' | 'high' | 'low';

export interface BarLabelInfo {
  kind: 'Ingresos' | 'Gastos';
  value: number;
  height: number;
  lane: BarLabelLane;
}

/**
 * Decides the vertical lane for each bar's value label to avoid overlap.
 * - `inside`: label sits at the top of the bar (very tall bars).
 * - `high`: label sits higher above the bar (`-top-11`).
 * - `low`: label sits just above the bar (`-top-5`).
 *
 * The taller bar of the pair is biased toward `high`/`inside`, the shorter
 * toward `low`. When heights are equal, income is `high` and expense `low`.
 */
export function barLabelLayout(
  bars: readonly MonthlyBars[],
  heightOf: (value: number) => number,
  insideThreshold = 0.75
): Array<[BarLabelInfo, BarLabelInfo]> {
  const INSIDE = insideThreshold * 100;

  return bars.map((bar) => {
    const incomeHeight = heightOf(bar.income);
    const expenseHeight = heightOf(bar.expense);
    // Income wins ties so the lane assignment is deterministic.
    const incomeTaller = incomeHeight >= expenseHeight;

    function lane(height: number, isTaller: boolean): BarLabelLane {
      if (height > INSIDE) return 'inside';
      if (isTaller) return 'high';
      return 'low';
    }

    return [
      {
        kind: 'Ingresos',
        value: bar.income,
        height: incomeHeight,
        lane: lane(incomeHeight, incomeTaller)
      },
      {
        kind: 'Gastos',
        value: bar.expense,
        height: expenseHeight,
        lane: lane(expenseHeight, !incomeTaller)
      }
    ];
  });
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
