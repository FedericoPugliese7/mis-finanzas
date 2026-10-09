/** Plain date string, no timezone: `YYYY-MM-DD`. */
export type DateISO = string;
/** Plain month key, no timezone: `YYYY-MM`. */
export type MonthKey = string;

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
const LOCALE = 'es-AR';

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(month: MonthKey): number {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  if (monthIndex === 1 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[monthIndex] ?? 0;
}

export function isValidMonth(month: string): boolean {
  return MONTH_KEY_PATTERN.test(month);
}

/** Extracts the `YYYY-MM` key from a `YYYY-MM-DD` date. */
export function monthOf(date: DateISO): MonthKey {
  return date.slice(0, 7);
}

export function monthStart(month: MonthKey): DateISO {
  return `${month}-01`;
}

export function monthEnd(month: MonthKey): DateISO {
  return `${month}-${String(daysInMonth(month)).padStart(2, '0')}`;
}

/** Moves a `YYYY-MM` key by a number of months using pure integer math. */
export function addMonths(month: MonthKey, delta: number): MonthKey {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const total = year * 12 + monthIndex + delta;
  const nextYear = Math.floor(total / 12);
  const nextMonth = (((total % 12) + 12) % 12) + 1;
  return `${String(nextYear).padStart(4, '0')}-${String(nextMonth).padStart(2, '0')}`;
}

/** Local today as `YYYY-MM-DD` (used only for relative labels). */
export function todayISO(now: Date = new Date()): DateISO {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Month label for the UI, e.g. `Octubre 2026` (locale `es-AR`). */
export function formatMonth(month: MonthKey): string {
  const parts = partsOf(parseDate(monthStart(month)), { month: 'long', year: 'numeric' });
  return capitalize(`${partText(parts, 'month')} ${partText(parts, 'year')}`);
}

/** Short month label for chart axes, e.g. `oct` (locale `es-AR`). */
export function formatMonthShort(month: MonthKey): string {
  return partText(partsOf(parseDate(monthStart(month)), { month: 'short' }), 'month');
}

/** Day label for grouped lists: `Hoy`, `Ayer` or `Lunes 4 de octubre` (locale `es-AR`). */
export function formatDayLabel(date: DateISO, today: DateISO = todayISO()): string {
  const parsed = parseDate(date);
  const parsedToday = parseDate(today);
  if (isSameDay(parsed, parsedToday)) return 'Hoy';
  if (isSameDay(parsed, previousDay(parsedToday))) return 'Ayer';
  const parts = partsOf(parsed, { weekday: 'long', day: 'numeric', month: 'long' });
  return capitalize(
    `${partText(parts, 'weekday')} ${partText(parts, 'day')} de ${partText(parts, 'month')}`
  );
}

/** Long date for the app header, e.g. `Domingo 4 de octubre de 2026` (locale `es-AR`). */
export function formatLongDate(date: DateISO): string {
  const parts = partsOf(parseDate(date), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return capitalize(
    `${partText(parts, 'weekday')} ${partText(parts, 'day')} de ${partText(
      parts,
      'month'
    )} de ${partText(parts, 'year')}`
  );
}

/** `YYYY-MM-DD` → local midnight (plain string, no timezone shift). */
function parseDate(date: DateISO): Date {
  return new Date(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10))
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function previousDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
}

/** `Intl.DateTimeFormat` instances are expensive to build: cache per options shape. */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function partsOf(
  date: Date,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormatPart[] {
  const key = JSON.stringify(options);
  let formatter = formatterCache.get(key);
  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat(LOCALE, options);
    formatterCache.set(key, formatter);
  }
  return formatter.formatToParts(date);
}

function partText(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): string {
  return parts.find((part) => part.type === type)?.value ?? '';
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
