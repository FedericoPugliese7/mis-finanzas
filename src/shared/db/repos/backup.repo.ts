import {
  db,
  defaultCategories,
  defaultSettings,
  SETTINGS_ID
} from '@/shared/db/database';
import { createBackup, type ImportPlan } from '@/shared/lib/backup';
import type { Backup, Transaction } from '@/shared/lib/types';
import { categoriesRepo } from './categories.repo';
import { settingsRepo } from './settings.repo';
import { transactionsRepo } from './transactions.repo';

export const backupRepo = {
  /** Exports all transactions, categories, and settings as a Backup payload. */
  async exportAll(): Promise<Backup> {
    const [transactions, categories, settings] = await Promise.all([
      transactionsRepo.getAll(),
      categoriesRepo.getAll(),
      settingsRepo.get()
    ]);
    return createBackup(transactions, categories, settings);
  },

  /**
   * Applies an `ImportPlan` atomically inside a single Dexie write transaction.
   * On `replace` mode, existing transactions and categories are cleared first.
   */
  async apply(plan: ImportPlan): Promise<void> {
    await db.transaction('rw', db.transactions, db.categories, db.settings, async () => {
      if (plan.mode === 'replace') {
        await db.transactions.clear();
        await db.categories.clear();
      }
      if (plan.transactions.length > 0) {
        await db.transactions.bulkPut(plan.transactions);
      }
      if (plan.categories.length > 0) {
        await db.categories.bulkPut(plan.categories);
      }
      if (plan.settings) {
        await db.settings.put({ id: SETTINGS_ID, ...plan.settings });
      }
    });
  },

  /**
   * Factory reset (SPEC 4.4): deletes all transactions, resets categories to
   * defaults and settings to `defaultSettings`.
   */
  async clearAll(): Promise<void> {
    await db.transaction('rw', db.transactions, db.categories, db.settings, async () => {
      await db.transactions.clear();
      await db.categories.clear();
      await db.categories.bulkPut(defaultCategories);
      await db.settings.put({ id: SETTINGS_ID, ...defaultSettings });
    });
  },

  /** Inserts demo transactions into IndexedDB. */
  async insertDemo(transactions: readonly Transaction[]): Promise<void> {
    if (transactions.length === 0) return;
    await db.transaction('rw', db.transactions, async () => {
      await db.transactions.bulkPut(transactions);
    });
  },

  /** Returns current transaction count (used to warn before demo insert). */
  async countTransactions(): Promise<number> {
    return db.transactions.count();
  }
};
