import { describe, expect, it, beforeEach } from 'vitest';
import { db } from '@/shared/db/database';
import { recurringRepo } from '@/shared/db/repos/recurring.repo';
import type { RecurringTemplate, Transaction } from '@/shared/lib/types';

function makeTemplate(overrides: Partial<RecurringTemplate> = {}): RecurringTemplate {
  return {
    id: 'template-1',
    type: 'expense',
    amountMinor: 10_000,
    currency: 'ARS',
    categoryId: 'category-1',
    frequency: 'monthly',
    startDate: '2026-01-01',
    endDate: null,
    lastGeneratedDate: '2026-01-01',
    ...overrides
  };
}

function baseTransaction(): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    type: 'expense',
    amountMinor: 5_000,
    currency: 'ARS',
    categoryId: 'category-1',
    date: '2026-01-15',
    note: 'Suscripción'
  };
}

describe('recurringRepo', () => {
  beforeEach(async () => {
    await db.recurringTemplates.clear();
    await db.transactions.clear();
  });

  it('returns 0 when there are no templates', async () => {
    const created = await recurringRepo.generateUpTo('2026-12-31');
    expect(created).toBe(0);
  });

  it('generates monthly occurrences and updates lastGeneratedDate', async () => {
    await db.recurringTemplates.add(makeTemplate());

    const created = await recurringRepo.generateUpTo('2026-04-01');
    expect(created).toBe(3);

    const templates = await db.recurringTemplates.toArray();
    expect(templates[0]?.lastGeneratedDate).toBe('2026-04-01');

    const transactions = await db.transactions.toArray();
    const dates = transactions.map((t) => t.date).sort();
    expect(dates).toEqual(['2026-02-01', '2026-03-01', '2026-04-01']);
  });

  it('is idempotent: repeated calls do not duplicate transactions', async () => {
    await db.recurringTemplates.add(makeTemplate());

    await recurringRepo.generateUpTo('2026-04-01');
    const second = await recurringRepo.generateUpTo('2026-04-01');

    expect(second).toBe(0);
    expect(await db.transactions.count()).toBe(3);
  });

  it('advances correctly through time without gaps or duplicates', async () => {
    await db.recurringTemplates.add(makeTemplate());

    await recurringRepo.generateUpTo('2026-04-01');
    const second = await recurringRepo.generateUpTo('2026-06-01');

    expect(second).toBe(2);
    expect(await db.transactions.count()).toBe(5);

    const dates = (await db.transactions.toArray()).map((t) => t.date).sort();
    expect(dates).toEqual([
      '2026-02-01',
      '2026-03-01',
      '2026-04-01',
      '2026-05-01',
      '2026-06-01'
    ]);
  });

  it('respects endDate', async () => {
    await db.recurringTemplates.add(makeTemplate({ endDate: '2026-03-31' }));

    const created = await recurringRepo.generateUpTo('2026-12-31');
    expect(created).toBe(2);

    const dates = (await db.transactions.toArray()).map((t) => t.date).sort();
    expect(dates).toEqual(['2026-02-01', '2026-03-01']);
  });

  it('clamps the day when the target month has fewer days', async () => {
    await db.recurringTemplates.add(
      makeTemplate({
        startDate: '2026-01-31',
        lastGeneratedDate: '2026-01-31'
      })
    );

    const created = await recurringRepo.generateUpTo('2026-05-31');
    expect(created).toBe(4);

    const dates = (await db.transactions.toArray()).map((t) => t.date).sort();
    expect(dates).toEqual(['2026-02-28', '2026-03-31', '2026-04-30', '2026-05-31']);
  });

  describe('createFromTransaction', () => {
    it('creates a template from a transaction and uses its date as the first occurrence', async () => {
      const id = await recurringRepo.createFromTransaction(baseTransaction());
      expect(id).toBeTypeOf('string');

      const templates = await db.recurringTemplates.toArray();
      expect(templates).toHaveLength(1);

      const template = templates[0]!;
      expect(template).toMatchObject({
        type: 'expense',
        amountMinor: 5_000,
        currency: 'ARS',
        categoryId: 'category-1',
        frequency: 'monthly',
        startDate: '2026-01-15',
        endDate: null,
        lastGeneratedDate: '2026-01-15'
      });
    });
  });

  describe('remove', () => {
    it('deletes a template without touching transactions', async () => {
      await db.recurringTemplates.add(makeTemplate());
      await recurringRepo.remove('template-1');

      expect(await db.recurringTemplates.count()).toBe(0);
    });
  });
});
