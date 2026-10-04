import { describe, expect, it } from 'vitest';
import {
  lastSixMonths,
  totalsByCategory,
  totalsByMonth,
  totalsForDisplay,
  topCategories
} from './aggregations';
import type { Category, Transaction } from './types';

function makeTx(overrides: Partial<Transaction>): Transaction {
  return {
    id: crypto.randomUUID(),
    type: 'expense',
    amountMinor: 0,
    currency: 'ARS',
    categoryId: 'expense-otros',
    date: '2026-10-01',
    createdAt: 0,
    updatedAt: 0,
    ...overrides
  };
}

const categories: Category[] = [
  {
    id: 'expense-supermercado',
    name: 'Supermercado',
    type: 'expense',
    color: '#f59e0b',
    icon: 'shopping-cart',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-transporte',
    name: 'Transporte',
    type: 'expense',
    color: '#0ea5e9',
    icon: 'bus',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-ocio',
    name: 'Ocio',
    type: 'expense',
    color: '#ec4899',
    icon: 'ticket',
    isDefault: true,
    archived: false
  },
  {
    id: 'income-sueldo',
    name: 'Sueldo',
    type: 'income',
    color: '#10b981',
    icon: 'briefcase',
    isDefault: true,
    archived: false
  }
];

describe('totalsByMonth', () => {
  it('sums income, expense and balance for a month, ignoring other months', () => {
    const transactions = [
      makeTx({ type: 'income', amountMinor: 200000, date: '2026-10-05' }),
      makeTx({ type: 'expense', amountMinor: 50000, date: '2026-10-10' }),
      makeTx({ type: 'expense', amountMinor: 999999, date: '2026-09-30' }),
      makeTx({ type: 'income', amountMinor: 777777, date: '2026-11-01' })
    ];
    expect(totalsByMonth(transactions, '2026-10', 'ARS', 1500)).toEqual({
      income: 200000,
      expense: 50000,
      balance: 150000
    });
    expect(totalsByMonth(transactions, '2026-09', 'ARS', 1500)).toEqual({
      income: 0,
      expense: 999999,
      balance: -999999
    });
    expect(totalsByMonth(transactions, '2026-12', 'ARS', 1500)).toEqual({
      income: 0,
      expense: 0,
      balance: 0
    });
  });
});

describe('totalsByCategory', () => {
  it('groups expenses by category with name, color and descending totals', () => {
    const transactions = [
      makeTx({
        categoryId: 'expense-supermercado',
        amountMinor: 30000,
        date: '2026-10-02'
      }),
      makeTx({
        categoryId: 'expense-supermercado',
        amountMinor: 10000,
        date: '2026-10-06'
      }),
      makeTx({
        categoryId: 'expense-transporte',
        amountMinor: 20000,
        date: '2026-10-07'
      }),
      makeTx({
        categoryId: 'income-sueldo',
        type: 'income',
        amountMinor: 500000,
        date: '2026-10-01'
      }),
      makeTx({ categoryId: 'expense-transporte', amountMinor: 555, date: '2026-09-01' })
    ];
    const result = totalsByCategory(transactions, '2026-10', categories, 'ARS', 1500);
    expect(result).toEqual([
      {
        categoryId: 'expense-supermercado',
        name: 'Supermercado',
        color: '#f59e0b',
        icon: 'shopping-cart',
        total: 40000
      },
      {
        categoryId: 'expense-transporte',
        name: 'Transporte',
        color: '#0ea5e9',
        icon: 'bus',
        total: 20000
      },
      {
        categoryId: 'expense-ocio',
        name: 'Ocio',
        color: '#ec4899',
        icon: 'ticket',
        total: 0
      }
    ]);
  });

  it('returns income categories when type is income', () => {
    const transactions = [
      makeTx({
        categoryId: 'income-sueldo',
        type: 'income',
        amountMinor: 500000,
        date: '2026-10-01'
      })
    ];
    const result = totalsByCategory(
      transactions,
      '2026-10',
      categories,
      'ARS',
      1500,
      'income'
    );
    expect(result).toEqual([
      {
        categoryId: 'income-sueldo',
        name: 'Sueldo',
        color: '#10b981',
        icon: 'briefcase',
        total: 500000
      }
    ]);
  });

  it('sorts ties by name and keeps unused categories with total 0', () => {
    const result = totalsByCategory([], '2026-10', categories, 'ARS', 1500);
    expect(result.map((item) => [item.name, item.total])).toEqual([
      ['Ocio', 0],
      ['Supermercado', 0],
      ['Transporte', 0]
    ]);
  });
});

describe('mixed-currency balance normalized to a display currency', () => {
  const transactions = [
    makeTx({
      currency: 'USD',
      amountMinor: 1000,
      exchangeRate: 1500,
      date: '2026-10-02'
    }),
    makeTx({ amountMinor: 50000, date: '2026-10-03' }),
    makeTx({ type: 'income', amountMinor: 200000, date: '2026-10-01' })
  ];

  it('normalizes to ARS using each transaction rate', () => {
    expect(totalsByMonth(transactions, '2026-10', 'ARS', 999999)).toEqual({
      income: 200000,
      expense: 1550000,
      balance: -1350000
    });
  });

  it('normalizes to USD mixing tx rate and reference rate', () => {
    expect(totalsByMonth(transactions, '2026-10', 'USD', 1500)).toEqual({
      income: 133,
      expense: 1033,
      balance: -900
    });
  });

  it('returns only the requested currency for single display', () => {
    expect(Object.keys(totalsForDisplay(transactions, '2026-10', 'ARS', 1500))).toEqual([
      'ARS'
    ]);
    expect(Object.keys(totalsForDisplay(transactions, '2026-10', 'USD', 1500))).toEqual([
      'USD'
    ]);
    expect(Object.keys(totalsForDisplay(transactions, '2026-10', 'BOTH', 1500))).toEqual([
      'ARS',
      'USD'
    ]);
  });
});

describe('lastSixMonths', () => {
  it('returns the 6 months ending at the anchor month, oldest first', () => {
    const bars = lastSixMonths([], '2026-10', 'ARS', 1500);
    expect(bars.map((bar) => bar.month)).toEqual([
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10'
    ]);
  });

  it('crosses year boundaries and aggregates per month', () => {
    const transactions = [
      makeTx({ amountMinor: 100, date: '2026-12-31' }),
      makeTx({ type: 'income', amountMinor: 300, date: '2027-01-15' }),
      makeTx({ amountMinor: 999, date: '2026-06-01' })
    ];
    const bars = lastSixMonths(transactions, '2027-01', 'ARS', 1500);
    expect(bars.map((bar) => bar.month)).toEqual([
      '2026-08',
      '2026-09',
      '2026-10',
      '2026-11',
      '2026-12',
      '2027-01'
    ]);
    expect(bars.find((bar) => bar.month === '2026-12')).toEqual({
      month: '2026-12',
      income: 0,
      expense: 100
    });
    expect(bars.find((bar) => bar.month === '2027-01')).toEqual({
      month: '2027-01',
      income: 300,
      expense: 0
    });
  });
});

describe('topCategories', () => {
  it('excludes categories without movement and respects the limit', () => {
    const list = totalsByCategory(
      [
        makeTx({ categoryId: 'expense-supermercado', amountMinor: 30000 }),
        makeTx({ categoryId: 'expense-transporte', amountMinor: 20000 })
      ],
      '2026-10',
      categories,
      'ARS',
      1500
    );
    expect(topCategories(list, 1).map((item) => item.name)).toEqual(['Supermercado']);
    expect(topCategories(list, 5).map((item) => item.name)).toEqual([
      'Supermercado',
      'Transporte'
    ]);
  });
});
