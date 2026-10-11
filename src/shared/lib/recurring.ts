import { addMonthsToDate, type DateISO } from './dates';
import type { RecurringTemplate, Transaction } from './types';

/** Whole months between a start date and another date (same month -> 0). */
function monthsFromStart(startDate: DateISO, date: DateISO): number {
  const startYear = Number(startDate.slice(0, 4));
  const startMonth = Number(startDate.slice(5, 7)) - 1;
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7)) - 1;
  return (year - startYear) * 12 + (month - startMonth);
}

/**
 * Computes the ISO dates of all occurrences of a template up to `upToDate`.
 *
 * Occurrences are anchored to the day of `startDate`; if a target month has
 * fewer days, the day is clamped to its last day.
 */
export function generateOccurrences(
  template: RecurringTemplate,
  upToDate: DateISO
): DateISO[] {
  const occurrences: DateISO[] = [];
  const endDate = template.endDate ?? null;
  const startOffset = monthsFromStart(template.startDate, template.lastGeneratedDate);
  let offset = startOffset + 1;
  let current = addMonthsToDate(template.startDate, offset);

  while (current <= upToDate && (endDate === null || current <= endDate)) {
    occurrences.push(current);
    offset += 1;
    current = addMonthsToDate(template.startDate, offset);
  }

  return occurrences;
}

/** Builds a concrete transaction from a recurring template and a target date. */
export function buildTransactionFromTemplate(
  template: RecurringTemplate,
  date: DateISO
): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    type: template.type,
    amountMinor: template.amountMinor,
    currency: template.currency,
    categoryId: template.categoryId,
    date,
    note: template.note,
    exchangeRate: template.exchangeRate
  };
}
