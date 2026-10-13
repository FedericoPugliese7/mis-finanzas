import { db } from '@/shared/db/database';
import type { DateISO } from '@/shared/lib/dates';
import {
  buildTransactionFromTemplate,
  generateOccurrences
} from '@/shared/lib/recurring';
import type { RecurringTemplate, Transaction } from '@/shared/lib/types';

export type NewRecurringTemplate = Omit<RecurringTemplate, 'id'>;

export const recurringRepo = {
  getAll(): Promise<RecurringTemplate[]> {
    return db.recurringTemplates.toArray();
  },

  /**
   * Creates a recurring template from an existing transaction. The transaction
   * itself is considered the first generated occurrence.
   */
  async createFromTransaction(
    transaction: Transaction | Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const id = crypto.randomUUID();
    const template: RecurringTemplate = {
      id,
      type: transaction.type,
      amountMinor: transaction.amountMinor,
      currency: transaction.currency,
      categoryId: transaction.categoryId,
      note: transaction.note,
      exchangeRate: transaction.exchangeRate,
      frequency: 'monthly',
      startDate: transaction.date,
      endDate: null,
      lastGeneratedDate: transaction.date
    };
    await db.recurringTemplates.add(template);
    return id;
  },

  async remove(id: string): Promise<void> {
    await db.recurringTemplates.delete(id);
  },

  /**
   * Generates concrete transactions for all recurring templates up to the given
   * date. Updates each template's `lastGeneratedDate` so repeated calls are
   * idempotent.
   */
  async generateUpTo(upToDate: DateISO): Promise<number> {
    const templates = await db.recurringTemplates.toArray();
    if (templates.length === 0) return 0;

    let created = 0;
    await db.transaction('rw', db.transactions, db.recurringTemplates, async () => {
      for (const template of templates) {
        const dates = generateOccurrences(template, upToDate);
        if (dates.length === 0) continue;

        const now = Date.now();
        const newTransactions: Transaction[] = dates.map((date) => ({
          ...buildTransactionFromTemplate(template, date),
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now
        }));

        await db.transactions.bulkAdd(newTransactions);
        await db.recurringTemplates.update(template.id, {
          lastGeneratedDate: dates[dates.length - 1]
        });
        created += newTransactions.length;
      }
    });

    return created;
  }
};
