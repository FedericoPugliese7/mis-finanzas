import { describe, expect, it } from 'vitest';
import { convert, convertTransaction, resolveRate } from './currency';
import type { Transaction } from './types';

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

describe('convert', () => {
  it('converts USD to ARS using the rate as ARS per USD', () => {
    expect(convert(1000, 'USD', 'ARS', 1500)).toBe(1500000);
  });

  it('converts ARS to USD', () => {
    // ARS 15.000,00 a 1500 ARS/USD = USD 10,00 = 1000 centavos.
    expect(convert(1500000, 'ARS', 'USD', 1500)).toBe(1000);
  });

  it('keeps the amount when both currencies match', () => {
    expect(convert(123456, 'ARS', 'ARS', 1500)).toBe(123456);
  });

  it('rounds to integer minor units', () => {
    expect(convert(1, 'USD', 'ARS', 1485.7)).toBe(1486);
    expect(convert(1000, 'ARS', 'USD', 3)).toBe(333);
  });

  it('never converts with an invalid rate', () => {
    expect(convert(1000, 'USD', 'ARS', 0)).toBe(1000);
    expect(convert(1000, 'USD', 'ARS', -5)).toBe(1000);
    expect(convert(1000, 'USD', 'ARS', Number.NaN)).toBe(1000);
  });
});

describe('resolveRate / convertTransaction', () => {
  it('uses the transaction exchangeRate over the reference rate', () => {
    const tx = makeTx({ currency: 'USD', amountMinor: 1000, exchangeRate: 1500 });
    expect(resolveRate(tx, 999999)).toBe(1500);
    expect(convertTransaction(tx, 'ARS', 999999)).toBe(1500000);
  });

  it('falls back to Settings.referenceRate when the transaction has no rate', () => {
    const tx = makeTx({ currency: 'USD', amountMinor: 1000 });
    expect(resolveRate(tx, 1500)).toBe(1500);
    expect(convertTransaction(tx, 'ARS', 1500)).toBe(1500000);
    expect(convertTransaction(tx, 'ARS', 2000)).toBe(2000000);
  });

  it('converts ARS to USD with the transaction rate', () => {
    const tx = makeTx({ currency: 'ARS', amountMinor: 1500000, exchangeRate: 1500 });
    expect(convertTransaction(tx, 'USD', 999999)).toBe(1000);
  });
});
