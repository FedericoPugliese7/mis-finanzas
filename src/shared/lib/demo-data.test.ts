import { describe, expect, it } from 'vitest';
import { defaultCategories } from '@/shared/db/database';
import { generateDemoTransactions } from './demo-data';

describe('generateDemoTransactions', () => {
  it('generates deterministic realistic demo transactions matching schema constraints', () => {
    const today = new Date(2026, 9, 4); // 2026-10-04
    const txs = generateDemoTransactions(defaultCategories, {
      months: 12,
      seed: 42,
      today
    });

    // Expect ~400-500 transactions
    expect(txs.length).toBeGreaterThan(350);
    expect(txs.length).toBeLessThan(550);

    // Every transaction must have valid fields
    for (const tx of txs) {
      expect(tx.id).toMatch(/^demo-\d{5}$/);
      expect(tx.amountMinor).toBeGreaterThan(0);
      expect(Number.isInteger(tx.amountMinor)).toBe(true);
      expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['ARS', 'USD']).toContain(tx.currency);
      expect(['income', 'expense']).toContain(tx.type);
    }

    // Deterministic given same seed
    const txs2 = generateDemoTransactions(defaultCategories, {
      months: 12,
      seed: 42,
      today
    });
    expect(txs2).toEqual(txs);
  });

  it('returns empty array if no active expenses or incomes exist', () => {
    const txs = generateDemoTransactions([], { months: 12 });
    expect(txs).toEqual([]);
  });
});
