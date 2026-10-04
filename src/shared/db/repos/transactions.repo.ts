import { db } from '@/shared/db/database';
import { monthEnd, monthStart, type DateISO, type MonthKey } from '@/shared/lib/dates';
import type { Transaction, TransactionType } from '@/shared/lib/types';

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

export const transactionsRepo = {
  getAll(): Promise<Transaction[]> {
    return db.transactions.toArray();
  },

  getById(id: string): Promise<Transaction | undefined> {
    return db.transactions.get(id);
  },

  getByDateRange(from: DateISO, to: DateISO): Promise<Transaction[]> {
    return db.transactions.where('date').between(from, to, true, true).toArray();
  },

  getByMonth(month: MonthKey): Promise<Transaction[]> {
    return transactionsRepo.getByDateRange(monthStart(month), monthEnd(month));
  },

  getByType(type: TransactionType): Promise<Transaction[]> {
    return db.transactions.where('type').equals(type).toArray();
  },

  getByCategory(categoryId: string): Promise<Transaction[]> {
    return db.transactions.where('categoryId').equals(categoryId).toArray();
  },

  countByCategory(categoryId: string): Promise<number> {
    return db.transactions.where('categoryId').equals(categoryId).count();
  },

  async create(input: NewTransaction): Promise<string> {
    const now = Date.now();
    const id = crypto.randomUUID();
    await db.transactions.add({ ...input, id, createdAt: now, updatedAt: now });
    return id;
  },

  async update(id: string, patch: Partial<NewTransaction>): Promise<void> {
    await db.transactions.update(id, { ...patch, updatedAt: Date.now() });
  },

  remove(id: string): Promise<void> {
    return db.transactions.delete(id);
  },

  removeMany(ids: readonly string[]): Promise<void> {
    return db.transactions.bulkDelete([...ids]);
  }
};
