import { describe, expect, it } from 'vitest';
import { computeBudgetStatuses } from './budgets';
import type { Category } from './types';
import type { CategoryTotal } from './aggregations';

const baseCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'expense-test',
  name: 'Test',
  type: 'expense',
  color: '#ff0000',
  icon: 'bus',
  isDefault: false,
  archived: false,
  ...overrides
});

const baseTotal = (overrides: Partial<CategoryTotal> = {}): CategoryTotal => ({
  categoryId: 'expense-test',
  name: 'Test',
  color: '#ff0000',
  icon: 'bus',
  total: 0,
  ...overrides
});

describe('computeBudgetStatuses', () => {
  it('returns an empty array when no categories have a budget', () => {
    const categories = [baseCategory({ budgetMinor: undefined })];
    const result = computeBudgetStatuses(categories, [baseTotal({ total: 50000 })]);
    expect(result).toEqual([]);
  });

  it('skips archived categories and income categories', () => {
    const categories = [
      baseCategory({ id: 'inc', type: 'income', budgetMinor: 100000 }),
      baseCategory({ id: 'arch', archived: true, budgetMinor: 100000 })
    ];
    const totals = [baseTotal({ categoryId: 'inc', total: 50000 })];
    expect(computeBudgetStatuses(categories, totals)).toEqual([]);
  });

  it('computes percent and over-budget correctly', () => {
    const categories = [baseCategory({ budgetMinor: 100000 })];
    const totals = [baseTotal({ total: 75000 })];
    const result = computeBudgetStatuses(categories, totals);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      budgetMinor: 100000,
      spentMinor: 75000,
      percent: 75,
      overBudget: false
    });
  });

  it('flags over-budget and computes percentages above 100', () => {
    const categories = [baseCategory({ budgetMinor: 100000 })];
    const totals = [baseTotal({ total: 123456 })];
    const result = computeBudgetStatuses(categories, totals);
    expect(result[0]).toMatchObject({
      percent: 123,
      overBudget: true
    });
  });

  it('treats missing spending as zero', () => {
    const categories = [baseCategory({ budgetMinor: 100000 })];
    const result = computeBudgetStatuses(categories, []);
    expect(result[0]).toMatchObject({
      spentMinor: 0,
      percent: 0,
      overBudget: false
    });
  });

  it('sorts by percent descending and then by name', () => {
    const categories = [
      baseCategory({ id: 'a', name: 'A', budgetMinor: 100000 }),
      baseCategory({ id: 'b', name: 'B', budgetMinor: 100000 })
    ];
    const totals = [
      baseTotal({ categoryId: 'a', total: 50000 }),
      baseTotal({ categoryId: 'b', total: 80000 })
    ];
    const result = computeBudgetStatuses(categories, totals);
    expect(result.map((item) => item.categoryId)).toEqual(['b', 'a']);
  });
});
