import { describe, expect, it } from 'vitest';
import { formatMoney, parseMoney } from './money';

describe('parseMoney (es-AR)', () => {
  it('parses "1.234,56" into 123456 minor units', () => {
    expect(parseMoney('1.234,56')).toBe(123456);
  });

  it('parses "1.234" as thousands grouping', () => {
    expect(parseMoney('1.234')).toBe(123400);
  });

  it('parses decimals with comma', () => {
    expect(parseMoney('0,05')).toBe(5);
    expect(parseMoney('12,5')).toBe(1250);
  });

  it('parses plain integers', () => {
    expect(parseMoney('12')).toBe(1200);
    expect(parseMoney('0')).toBe(0);
  });

  it('ignores spaces (including non-breaking) and currency symbols', () => {
    expect(parseMoney('  1.234,56  ')).toBe(123456);
    expect(parseMoney('1 234,56')).toBe(123456);
    expect(parseMoney('$ 1.234,56')).toBe(123456);
    expect(parseMoney('US$10')).toBe(1000);
    expect(parseMoney('ARS 10')).toBe(1000);
  });

  it('handles thousand separators in both positions', () => {
    expect(parseMoney('1.234.567,89')).toBe(123456789);
    expect(parseMoney('1,234,567.89')).toBe(123456789);
  });

  it('handles negatives', () => {
    expect(parseMoney('-1.000,50')).toBe(-100050);
    expect(parseMoney('-12')).toBe(-1200);
  });

  it('rounds extra decimals half-up to the closest centavo', () => {
    expect(parseMoney('0,005')).toBe(1);
    expect(parseMoney('12,345')).toBe(1235);
    expect(parseMoney('12,344')).toBe(1234);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('   ')).toBeNull();
    expect(parseMoney('-')).toBeNull();
    expect(parseMoney('abc')).toBeNull();
    expect(parseMoney('1.2.3')).toBeNull();
    expect(parseMoney('1,2,3')).toBeNull();
  });

  it('accumulates in integers, never floats', () => {
    const a = parseMoney('0,1');
    const b = parseMoney('0,2');
    const c = parseMoney('0,3');
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(c).not.toBeNull();
    expect((a ?? 0) + (b ?? 0)).toBe(c);
  });
});

describe('formatMoney', () => {
  it('formats 123456 as "1.234,56"', () => {
    expect(formatMoney(123456, 'ARS', { symbol: false })).toBe('1.234,56');
  });

  it('includes currency symbols ($ and US$)', () => {
    expect(formatMoney(123456, 'ARS')).toBe('$ 1.234,56');
    expect(formatMoney(10000, 'USD')).toBe('US$ 100,00');
  });

  it('formats negative amounts with a leading sign', () => {
    expect(formatMoney(-123456, 'ARS')).toBe('-$ 1.234,56');
    expect(formatMoney(-123456, 'ARS', { symbol: false })).toBe('-1.234,56');
  });

  it('formats large amounts with es-AR grouping', () => {
    expect(formatMoney(123456789012, 'ARS', { symbol: false })).toBe('1.234.567.890,12');
  });

  it('formats zero', () => {
    expect(formatMoney(0, 'ARS')).toBe('$ 0,00');
    expect(formatMoney(0, 'USD', { symbol: false })).toBe('0,00');
  });

  it('rounds to whole units when decimals are disabled', () => {
    expect(formatMoney(1249, 'ARS', { symbol: false, decimals: false })).toBe('12');
    expect(formatMoney(1250, 'ARS', { symbol: false, decimals: false })).toBe('13');
    expect(formatMoney(-1250, 'ARS', { symbol: false, decimals: false })).toBe('-13');
  });

  it('round-trips with parseMoney', () => {
    expect(parseMoney(formatMoney(123456, 'ARS', { symbol: false }))).toBe(123456);
    expect(parseMoney(formatMoney(5, 'USD', { symbol: false }))).toBe(5);
  });
});
