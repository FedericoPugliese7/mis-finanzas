import { describe, expect, it } from 'vitest';
import {
  BACKUP_SCHEMA_VERSION,
  BackupParseError,
  buildImportPlan,
  createBackup,
  parseBackup
} from './backup';
import type { Backup, Category, Settings, Transaction } from './types';

const sampleSettings: Settings = {
  theme: 'dark',
  displayCurrency: 'USD',
  referenceRate: 1200,
  rateSource: 'manual'
};

const sampleCategories: Category[] = [
  {
    id: 'expense-supermercado',
    name: 'Supermercado',
    type: 'expense',
    color: '#f59e0b',
    icon: 'shopping-cart',
    isDefault: true,
    archived: false
  }
];

const sampleTransactions: Transaction[] = [
  {
    id: 'tx-001',
    type: 'expense',
    amountMinor: 123456,
    currency: 'ARS',
    categoryId: 'expense-supermercado',
    date: '2026-10-01',
    note: 'Compra semanal',
    createdAt: 1700000000000,
    updatedAt: 1700000000000
  }
];

describe('backup lib', () => {
  it('creates and parses a valid backup round-trip', () => {
    const backup = createBackup(sampleTransactions, sampleCategories, sampleSettings);
    expect(backup.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(backup.transactions).toHaveLength(1);

    const raw = JSON.stringify(backup);
    const parsed = parseBackup(raw);

    expect(parsed.settings.theme).toBe('dark');
    expect(parsed.transactions[0]?.id).toBe('tx-001');
  });

  it('throws BackupParseError on invalid JSON', () => {
    expect(() => parseBackup('{ invalid json')).toThrowError(BackupParseError);
    expect(() => parseBackup('{ invalid json')).toThrow(
      'El archivo no es un JSON válido.'
    );
  });

  it('throws BackupParseError with path on schema violation', () => {
    const badBackup = {
      schemaVersion: 1,
      exportedAt: '2026-10-01T00:00:00.000Z',
      transactions: [
        {
          id: 'tx-bad',
          type: 'expense',
          amountMinor: -50, // invalid: must be positive
          currency: 'ARS',
          categoryId: 'cat-1',
          date: '2026-10-01',
          createdAt: 100,
          updatedAt: 100
        }
      ],
      categories: [],
      settings: sampleSettings
    };

    expect(() => parseBackup(JSON.stringify(badBackup))).toThrowError(BackupParseError);
    expect(() => parseBackup(JSON.stringify(badBackup))).toThrow(
      'El backup no es válido (campo «transactions.0.amountMinor»:'
    );
  });

  it('throws BackupParseError when schemaVersion is unsupported', () => {
    const backup = createBackup(sampleTransactions, sampleCategories, sampleSettings);
    (backup as unknown as { schemaVersion: number }).schemaVersion = 999;

    expect(() => parseBackup(JSON.stringify(backup))).toThrowError(BackupParseError);
  });

  describe('buildImportPlan', () => {
    const current: { transactions: Transaction[]; categories: Category[] } = {
      transactions: [
        {
          id: 'tx-001',
          type: 'expense',
          amountMinor: 1000,
          currency: 'ARS',
          categoryId: 'cat-1',
          date: '2026-09-01',
          createdAt: 100,
          updatedAt: 100
        }
      ],
      categories: sampleCategories
    };

    const incomingBackup: Backup = {
      schemaVersion: 1,
      exportedAt: '2026-10-01T00:00:00.000Z',
      transactions: [
        current.transactions[0]!, // existing (should be skipped in merge)
        {
          id: 'tx-002', // new
          type: 'income',
          amountMinor: 500000,
          currency: 'ARS',
          categoryId: 'cat-2',
          date: '2026-10-02',
          createdAt: 200,
          updatedAt: 200
        }
      ],
      categories: [
        sampleCategories[0]!, // existing
        {
          id: 'cat-2',
          name: 'Freelance',
          type: 'income',
          color: '#10b981',
          icon: 'briefcase',
          isDefault: false,
          archived: false
        }
      ],
      settings: sampleSettings
    };

    it('handles merge mode by adding only missing records and keeping current settings', () => {
      const plan = buildImportPlan(incomingBackup, current, 'merge');

      expect(plan.mode).toBe('merge');
      expect(plan.settings).toBeNull();
      expect(plan.transactions).toHaveLength(1);
      expect(plan.transactions[0]?.id).toBe('tx-002');
      expect(plan.categories).toHaveLength(1);
      expect(plan.categories[0]?.id).toBe('cat-2');
      expect(plan.counts).toEqual({
        transactions: 1,
        transactionsSkipped: 1,
        categories: 1,
        categoriesSkipped: 1
      });
    });

    it('handles replace mode by applying all incoming records and settings', () => {
      const plan = buildImportPlan(incomingBackup, current, 'replace');

      expect(plan.mode).toBe('replace');
      expect(plan.settings).toEqual(sampleSettings);
      expect(plan.transactions).toHaveLength(2);
      expect(plan.categories).toHaveLength(2);
      expect(plan.counts).toEqual({
        transactions: 2,
        transactionsSkipped: 0,
        categories: 2,
        categoriesSkipped: 0
      });
    });
  });
});
