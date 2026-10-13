import type { Category } from './types';
import type { CategoryTotal } from './aggregations';

export interface BudgetStatus {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  budgetMinor: number;
  spentMinor: number;
  /** Percentage of the budget already spent (can exceed 100). */
  percent: number;
  overBudget: boolean;
  /** Amount still available (zero when over budget). */
  remainingMinor: number;
  /** Amount spent beyond the budget (zero when under budget). */
  overspentMinor: number;
}

/**
 * Computes the monthly budget status for every active expense category that has
 * a `budgetMinor` configured. Spending is compared in the same currency as the
 * budget (ARS). Categories without a budget or with a non-positive budget are
 * skipped.
 */
export function computeBudgetStatuses(
  categories: readonly Category[],
  expenseTotals: readonly CategoryTotal[]
): BudgetStatus[] {
  const spentById = new Map<string, number>();
  for (const item of expenseTotals) {
    spentById.set(item.categoryId, item.total);
  }

  return categories
    .filter(
      (category) =>
        category.type === 'expense' &&
        !category.archived &&
        category.budgetMinor != null &&
        category.budgetMinor > 0
    )
    .map((category) => {
      const spentMinor = spentById.get(category.id) ?? 0;
      const budgetMinor = category.budgetMinor ?? 0;
      const percent = budgetMinor > 0 ? Math.round((spentMinor / budgetMinor) * 100) : 0;
      const overBudget = spentMinor > budgetMinor;
      return {
        categoryId: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        budgetMinor,
        spentMinor,
        percent,
        overBudget,
        remainingMinor: overBudget ? 0 : budgetMinor - spentMinor,
        overspentMinor: overBudget ? spentMinor - budgetMinor : 0
      };
    })
    .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name, 'es'));
}

/** Clamps a percentage between 0 and 100 for visual bars. */
export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}
