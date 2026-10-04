import { formatMoney } from './money';
import type { Category, Transaction } from './types';

/**
 * CSV export (SPEC 4.4). Pure string building: es-AR conventions (`;`
 * separator, decimal comma) so the file opens correctly in spreadsheet apps.
 * A BOM is prepended for UTF-8 detection in Excel.
 */
const SEPARATOR = ';';
const BOM = '\uFEFF';

const HEADERS = [
  'fecha',
  'tipo',
  'monto',
  'moneda',
  'categoria',
  'nota',
  'cotizacion'
] as const;

function escapeCell(value: string): string {
  if (value.includes(SEPARATOR) || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function row(cells: readonly string[]): string {
  return cells.map(escapeCell).join(SEPARATOR);
}

/** Serializes transactions to a CSV file body (header + one row per movement). */
export function transactionsToCsv(
  transactions: readonly Transaction[],
  categories: readonly Category[]
): string {
  const names = new Map(categories.map((category) => [category.id, category.name]));
  const lines = transactions.map((tx) =>
    row([
      tx.date,
      tx.type === 'income' ? 'Ingreso' : 'Gasto',
      formatMoney(tx.amountMinor, tx.currency, { symbol: false }),
      tx.currency,
      names.get(tx.categoryId) ?? '',
      tx.note ?? '',
      tx.exchangeRate === undefined ? '' : String(tx.exchangeRate)
    ])
  );
  return `${BOM}${[row(HEADERS), ...lines].join('\r\n')}\r\n`;
}
