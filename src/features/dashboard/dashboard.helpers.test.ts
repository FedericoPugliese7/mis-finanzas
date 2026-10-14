import { describe, expect, it } from 'vitest';
import type { CategoryTotal } from '@/shared/lib/aggregations';
import type { Transaction } from '@/shared/lib/types';
import { chartCurrency, donutSlices, latestTransactions } from './dashboard.helpers';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    type: 'expense',
    amountMinor: 1000,
    currency: 'ARS',
    categoryId: 'c1',
    date: '2026-10-01',
    createdAt: 1,
    updatedAt: 1,
    ...overrides
  };
}

function total(overrides: Partial<CategoryTotal>): CategoryTotal {
  return {
    categoryId: 'c1',
    name: 'Supermercado',
    color: '#22c55e',
    icon: 'shopping-cart',
    total: 1000,
    ...overrides
  };
}

describe('chartCurrency', () => {
  it('keeps USD, maps BOTH to ARS', () => {
    expect(chartCurrency('ARS')).toBe('ARS');
    expect(chartCurrency('USD')).toBe('USD');
    expect(chartCurrency('BOTH')).toBe('ARS');
  });
});

describe('donutSlices', () => {
  it('drops categories without movement and computes integer shares', () => {
    const slices = donutSlices([
      total({ categoryId: 'a', name: 'Supermercado', total: 7500 }),
      total({ categoryId: 'b', name: 'Transporte', total: 2500 }),
      total({ categoryId: 'c', name: 'Ocio', total: 0 })
    ]);
    expect(slices.map((slice) => slice.categoryId)).toEqual(['a', 'b']);
    expect(slices.map((slice) => slice.percent)).toEqual([75, 25]);
  });

  it('returns an empty list when there are no expenses', () => {
    expect(donutSlices([total({ total: 0 })])).toEqual([]);
    expect(donutSlices([])).toEqual([]);
  });

  it('rounds shares that do not divide evenly', () => {
    const slices = donutSlices([
      total({ categoryId: 'a', total: 1000 }),
      total({ categoryId: 'b', total: 1000 }),
      total({ categoryId: 'c', total: 1001 })
    ]);
    expect(slices.reduce((sum, slice) => sum + slice.percent, 0)).toBeGreaterThanOrEqual(
      99
    );
    expect(slices.reduce((sum, slice) => sum + slice.percent, 0)).toBeLessThanOrEqual(
      101
    );
  });
});

describe('latestTransactions', () => {
  const transactions: Transaction[] = [
    tx({ id: '1', date: '2026-10-01', createdAt: 10 }),
    tx({ id: '2', date: '2026-10-15', createdAt: 20 }),
    tx({ id: '3', date: '2026-10-15', createdAt: 30 }),
    tx({ id: '4', date: '2026-09-30', createdAt: 40 }),
    tx({ id: '5', date: '2026-10-10', createdAt: 50 })
  ];

  it('sorts by date desc, then createdAt desc, limited to the month', () => {
    const latest = latestTransactions(transactions, '2026-10', 10);
    expect(latest.map((item) => item.id)).toEqual(['3', '2', '5', '1']);
  });

  it('respects the limit', () => {
    expect(latestTransactions(transactions, '2026-10', 2).map((item) => item.id)).toEqual(
      ['3', '2']
    );
  });

  it('returns an empty list for a month without movements', () => {
    expect(latestTransactions(transactions, '2026-08', 5)).toEqual([]);
  });
});
