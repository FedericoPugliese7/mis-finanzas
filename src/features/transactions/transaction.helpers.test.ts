import { describe, expect, it } from 'vitest';
import {
  categoryOptionsFor,
  filterTransactions,
  groupTransactionsByDay
} from './transaction.helpers';
import type { Category, Transaction } from '@/shared/lib/types';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: 'tx-1',
    type: 'expense',
    amountMinor: 100000,
    currency: 'ARS',
    categoryId: 'expense-food',
    date: '2026-10-01',
    createdAt: 1,
    updatedAt: 1,
    ...overrides
  };
}

const TRANSACTIONS: Transaction[] = [
  tx({ id: 'a', note: 'Almuerzo', date: '2026-10-01', createdAt: 1 }),
  tx({
    id: 'b',
    note: 'Sueldo octubre',
    type: 'income',
    currency: 'ARS',
    categoryId: 'income-salary',
    date: '2026-10-02',
    createdAt: 2
  }),
  tx({ id: 'c', note: 'Café', currency: 'USD', date: '2026-10-02', createdAt: 3 }),
  tx({ id: 'd', note: 'Alquiler', date: '2026-09-30', createdAt: 4 })
];

const BASE_FILTERS = {
  month: '2026-10',
  type: 'all' as const,
  currency: 'all' as const,
  categoryId: 'all' as const,
  query: ''
};

describe('filterTransactions', () => {
  it('keeps only the selected month', () => {
    const result = filterTransactions(TRANSACTIONS, BASE_FILTERS);
    expect(result.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });

  it('filters by type, currency and category', () => {
    expect(
      filterTransactions(TRANSACTIONS, { ...BASE_FILTERS, type: 'income' }).map(
        (t) => t.id
      )
    ).toEqual(['b']);
    expect(
      filterTransactions(TRANSACTIONS, { ...BASE_FILTERS, currency: 'USD' }).map(
        (t) => t.id
      )
    ).toEqual(['c']);
    expect(
      filterTransactions(TRANSACTIONS, {
        ...BASE_FILTERS,
        categoryId: 'expense-food'
      }).map((t) => t.id)
    ).toEqual(['a', 'c']);
  });

  it('searches notes and category names ignoring case and accents', () => {
    const names = new Map([
      ['expense-food', 'Alimentos'],
      ['income-salary', 'Sueldo']
    ]);
    expect(
      filterTransactions(TRANSACTIONS, { ...BASE_FILTERS, query: 'cafe' }, names).map(
        (t) => t.id
      )
    ).toEqual(['c']);
    expect(
      filterTransactions(
        TRANSACTIONS,
        { ...BASE_FILTERS, query: 'alimentos' },
        names
      ).map((t) => t.id)
    ).toEqual(['a', 'c']);
    expect(
      filterTransactions(TRANSACTIONS, { ...BASE_FILTERS, query: 'SUELDO' }, names).map(
        (t) => t.id
      )
    ).toEqual(['b']);
  });
});

describe('groupTransactionsByDay', () => {
  it('groups by day descending, newest first inside each day', () => {
    const groups = groupTransactionsByDay(TRANSACTIONS);
    expect(groups.map((group) => group.date)).toEqual([
      '2026-10-02',
      '2026-10-01',
      '2026-09-30'
    ]);
    expect(groups[0]?.items.map((t) => t.id)).toEqual(['c', 'b']);
    expect(groups[1]?.items.map((t) => t.id)).toEqual(['a']);
  });
});

describe('categoryOptionsFor', () => {
  const CATEGORIES: Category[] = [
    {
      id: 'expense-food',
      name: 'Comida',
      type: 'expense',
      color: '#f59e0b',
      icon: 'utensils',
      isDefault: false,
      archived: false
    },
    {
      id: 'expense-old',
      name: 'Vieja',
      type: 'expense',
      color: '#64748b',
      icon: 'tag',
      isDefault: false,
      archived: true
    },
    {
      id: 'income-salary',
      name: 'Sueldo',
      type: 'income',
      color: '#10b981',
      icon: 'briefcase',
      isDefault: false,
      archived: false
    }
  ];

  it('returns active categories of the requested type', () => {
    const options = categoryOptionsFor(CATEGORIES, 'expense');
    expect(options.map((c) => c.id)).toEqual(['expense-food']);
  });

  it('keeps an archived category that the movement still references', () => {
    const options = categoryOptionsFor(CATEGORIES, 'expense', 'expense-old');
    expect(options.map((c) => c.id)).toEqual(['expense-food', 'expense-old']);
  });
});
