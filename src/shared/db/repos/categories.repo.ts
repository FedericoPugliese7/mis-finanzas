import { db } from '@/shared/db/database';
import type { Category, TransactionType } from '@/shared/lib/types';

export type NewCategory = Omit<Category, 'id'> & { id?: string };

export const categoriesRepo = {
  getAll(): Promise<Category[]> {
    return db.categories.toArray();
  },

  /** Non-archived categories (IndexedDB cannot index booleans). */
  async getActive(): Promise<Category[]> {
    const categories = await db.categories.toArray();
    return categories.filter((category) => !category.archived);
  },

  getById(id: string): Promise<Category | undefined> {
    return db.categories.get(id);
  },

  async getDefaultsByType(type: TransactionType): Promise<Category[]> {
    const categories = await db.categories.toArray();
    return categories.filter((category) => category.type === type && !category.archived);
  },

  async create(input: NewCategory): Promise<string> {
    const id = input.id ?? crypto.randomUUID();
    await db.categories.add({ ...input, id });
    return id;
  },

  async update(id: string, patch: Partial<NewCategory>): Promise<void> {
    await db.categories.update(id, patch);
  },

  archive(id: string): Promise<number> {
    return db.categories.update(id, { archived: true });
  },

  unarchive(id: string): Promise<number> {
    return db.categories.update(id, { archived: false });
  },

  remove(id: string): Promise<void> {
    return db.categories.delete(id);
  },

  /** Used by the archive-if-used rule: a category with movements is never deleted. */
  hasTransactions(categoryId: string): Promise<boolean> {
    return db.transactions
      .where('categoryId')
      .equals(categoryId)
      .count()
      .then((n) => n > 0);
  }
};
