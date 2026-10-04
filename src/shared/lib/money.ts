import type { Currency } from './types';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  ARS: '$',
  USD: 'US$'
};

const GROUP_FORMATTER = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

const SYMBOL_PATTERN = /(US\$|USD|ARS|\$)/gi;
const THOUSANDS_DOT_PATTERN = /^\d{1,3}(\.\d{3})+$/;
const NUMBER_PATTERN = /^(\d*)(?:\.(\d*))?$/;

/**
 * Parses an es-AR formatted money string into an integer amount in minor units
 * (centavos). Returns `null` when the input cannot be parsed.
 *
 * Rules:
 * - Whitespace (incl. non-breaking) and currency symbols are stripped.
 * - When both `.` and `,` are present, the last one is the decimal separator
 *   (`1.234,56` and `1,234.56` both work).
 * - A lone `,` is always the decimal separator (es-AR): `0,05` → 5, `12,345` → 1235.
 * - A lone `.` is grouping when it matches a thousands pattern (`1.234` → 123400),
 *   otherwise decimal (`12.5` → 1250).
 * - Extra decimals are rounded half-up to the closest centavo.
 */
export function parseMoney(input: string): number | null {
  let s = input.replace(/[\s\u00a0\u202f]/g, '').replace(SYMBOL_PATTERN, '');
  if (s === '') return null;

  let negative = false;
  if (s.startsWith('-')) {
    negative = true;
    s = s.slice(1);
  } else if (s.startsWith('+')) {
    s = s.slice(1);
  }
  if (s === '') return null;

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    s = s.replace(',', '.');
  } else if (hasDot && THOUSANDS_DOT_PATTERN.test(s)) {
    s = s.replace(/\./g, '');
  }

  const match = NUMBER_PATTERN.exec(s);
  if (match === null) return null;
  const units = match[1] === '' ? 0 : Number(match[1]);
  const fraction = (match[2] ?? '').padEnd(3, '0');
  if (!Number.isFinite(units)) return null;
  const cents = units * 100 + Math.round(Number(fraction) / 10);
  if (!Number.isSafeInteger(cents)) return null;
  return negative && cents !== 0 ? -cents : cents;
}

export interface FormatMoneyOptions {
  /** Include the currency symbol (`$` / `US$`). Defaults to `true`. */
  symbol?: boolean;
  /** Render centavos. When `false` the amount rounds to whole units. */
  decimals?: boolean;
}

/**
 * Formats an integer amount in minor units using es-AR conventions
 * (`1.234,56`). Pure integer math: the integer part is grouped with
 * `Intl.NumberFormat('es-AR')` and the fraction is appended as two digits.
 */
export function formatMoney(
  amountMinor: number,
  currency: Currency,
  options: FormatMoneyOptions = {}
): string {
  const { symbol = true, decimals = true } = options;
  const negative = amountMinor < 0;
  const abs = Math.abs(amountMinor);
  let units = Math.trunc(abs / 100);
  let cents = abs % 100;
  if (!decimals && cents >= 50) {
    units += 1;
    cents = 0;
  }
  const grouped = GROUP_FORMATTER.format(units);
  const body = decimals ? `${grouped},${String(cents).padStart(2, '0')}` : grouped;
  const sign = negative ? '-' : '';
  const prefix = symbol ? `${CURRENCY_SYMBOLS[currency]} ` : '';
  return `${sign}${prefix}${body}`;
}
