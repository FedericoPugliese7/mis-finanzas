import { format, isSameDay, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

/** Plain date string, no timezone: `YYYY-MM-DD`. */
export type DateISO = string;
/** Plain month key, no timezone: `YYYY-MM`. */
export type MonthKey = string;

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

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

/** Month label for the UI, e.g. `Octubre 2026` (locale `es`). */
export function formatMonth(month: MonthKey): string {
  const label = format(parseISO(monthStart(month)), 'MMMM yyyy', { locale: es });
  return capitalize(label);
}

/** Short month label for chart axes, e.g. `oct` (locale `es`). */
export function formatMonthShort(month: MonthKey): string {
  return format(parseISO(monthStart(month)), 'MMM', { locale: es });
}

/** Day label for grouped lists: `Hoy`, `Ayer` or `Lunes 4 de octubre` (locale `es`). */
export function formatDayLabel(date: DateISO, today: DateISO = todayISO()): string {
  const parsed = parseISO(date);
  const parsedToday = parseISO(today);
  if (isSameDay(parsed, parsedToday)) return 'Hoy';
  if (isSameDay(parsed, subDays(parsedToday, 1))) return 'Ayer';
  return capitalize(format(parsed, "EEEE d 'de' MMMM", { locale: es }));
}

/** Long date for the app header, e.g. `Domingo 4 de octubre de 2026` (locale `es`). */
export function formatLongDate(date: DateISO): string {
  return capitalize(format(parseISO(date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es }));
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
