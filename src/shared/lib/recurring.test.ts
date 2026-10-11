import { describe, expect, it } from 'vitest';
import { generateOccurrences } from './recurring';
import type { RecurringTemplate } from './types';

const baseTemplate = (overrides: Partial<RecurringTemplate> = {}): RecurringTemplate => ({
  id: 'rec-1',
  type: 'expense',
  amountMinor: 100000,
  currency: 'ARS',
  categoryId: 'expense-supermercado',
  frequency: 'monthly',
  startDate: '2026-01-15',
  lastGeneratedDate: '2026-01-15',
  ...overrides
});

describe('generateOccurrences', () => {
  it('returns empty when upToDate is before the next occurrence', () => {
    const template = baseTemplate();
    expect(generateOccurrences(template, '2026-01-20')).toEqual([]);
  });

  it('generates one occurrence for the very next month', () => {
    const template = baseTemplate();
    expect(generateOccurrences(template, '2026-02-28')).toEqual(['2026-02-15']);
  });

  it('generates multiple months until upToDate', () => {
    const template = baseTemplate();
    expect(generateOccurrences(template, '2026-04-10')).toEqual([
      '2026-02-15',
      '2026-03-15'
    ]);
  });

  it('respects endDate', () => {
    const template = baseTemplate({ endDate: '2026-03-15' });
    expect(generateOccurrences(template, '2026-05-01')).toEqual([
      '2026-02-15',
      '2026-03-15'
    ]);
  });

  it('clamps day when target month has fewer days', () => {
    const template = baseTemplate({ startDate: '2026-01-31', lastGeneratedDate: '2026-01-31' });
    expect(generateOccurrences(template, '2026-04-30')).toEqual([
      '2026-02-28',
      '2026-03-31',
      '2026-04-30'
    ]);
  });

  it('does not generate anything before startDate', () => {
    const template = baseTemplate({
      startDate: '2026-05-01',
      lastGeneratedDate: '2026-05-01'
    });
    expect(generateOccurrences(template, '2026-04-01')).toEqual([]);
  });
});
