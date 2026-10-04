import { describe, expect, it } from 'vitest';
import { transactionsToCsv } from './csv';
import type { Category, Transaction } from './types';

describe('transactionsToCsv', () => {
  const categories: Category[] = [
    {
      id: 'expense-super',
      name: 'Supermercado y "almacén"',
      type: 'expense',
      color: '#f59e0b',
      icon: 'shopping-cart',
      isDefault: true,
      archived: false
    }
  ];

  const transactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'expense',
      amountMinor: 123456,
      currency: 'ARS',
      categoryId: 'expense-super',
      date: '2026-10-04',
      note: 'Pan; leche\ny huevos',
      exchangeRate: 1540.5,
      createdAt: 100,
      updatedAt: 100
    }
  ];

  it('prepends BOM and formats rows with semicolons and escaped cells', () => {
    const csv = transactionsToCsv(transactions, categories);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    const lines = csv.substring(1).trim().split('\r\n');
    expect(lines[0]).toBe('fecha;tipo;monto;moneda;categoria;nota;cotizacion');

    // Escalated cells:
    // Supermercado y "almacén" -> "Supermercado y ""almacén"""
    // Pan; leche\ny huevos -> "Pan; leche\ny huevos"
    expect(csv).toContain(';Gasto;');
    expect(csv).toContain(';1.234,56;');
    expect(csv).toContain(';"Supermercado y ""almacén""";');
    expect(csv).toContain(';1540.5');
  });
});
