import { describe, expect, it } from 'vitest';
import {
  addMonths,
  daysInMonth,
  formatDayLabel,
  formatLongDate,
  formatMonth,
  isLeapYear,
  isValidMonth,
  monthEnd,
  monthOf,
  monthStart
} from './dates';

describe('month keys', () => {
  it('extracts YYYY-MM from a date', () => {
    expect(monthOf('2026-10-04')).toBe('2026-10');
    expect(monthOf('2026-01-31')).toBe('2026-01');
  });

  it('validates month keys', () => {
    expect(isValidMonth('2026-10')).toBe(true);
    expect(isValidMonth('2026-13')).toBe(false);
    expect(isValidMonth('2026-00')).toBe(false);
    expect(isValidMonth('2026-2')).toBe(false);
    expect(isValidMonth('2026-10-01')).toBe(false);
    expect(isValidMonth('abcd-10')).toBe(false);
  });

  it('computes month ranges', () => {
    expect(monthStart('2026-02')).toBe('2026-02-01');
    expect(monthEnd('2026-02')).toBe('2026-02-28');
    expect(monthEnd('2026-04')).toBe('2026-04-30');
    expect(monthEnd('2026-12')).toBe('2026-12-31');
  });
});

describe('leap years', () => {
  it('detects leap years', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
  });

  it('handles February in leap and common years', () => {
    expect(daysInMonth('2024-02')).toBe(29);
    expect(daysInMonth('2026-02')).toBe(28);
    expect(daysInMonth('1900-02')).toBe(28);
    expect(daysInMonth('2000-02')).toBe(29);
    expect(monthEnd('2024-02')).toBe('2024-02-29');
  });
});

describe('addMonths', () => {
  it('moves forward and backward across year boundaries', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-06', -6)).toBe('2025-12');
    expect(addMonths('2026-06', 6)).toBe('2026-12');
    expect(addMonths('2026-06', 7)).toBe('2027-01');
  });

  it('handles multi-year deltas', () => {
    expect(addMonths('2026-10', -25)).toBe('2024-09');
    expect(addMonths('2026-10', 14)).toBe('2027-12');
  });
});

describe('labels (locale es)', () => {
  it('formats the month label', () => {
    expect(formatMonth('2026-10')).toBe('Octubre 2026');
    expect(formatMonth('2026-01')).toBe('Enero 2026');
  });

  it('formats day labels relative to today', () => {
    expect(formatDayLabel('2026-10-04', '2026-10-04')).toBe('Hoy');
    expect(formatDayLabel('2026-10-03', '2026-10-04')).toBe('Ayer');
    expect(formatDayLabel('2026-10-05', '2026-10-04')).toBe('Lunes 5 de octubre');
  });

  it('formats the long date for the header', () => {
    expect(formatLongDate('2026-10-04')).toBe('Domingo 4 de octubre de 2026');
    expect(formatLongDate('2026-01-01')).toBe('Jueves 1 de enero de 2026');
  });
});
