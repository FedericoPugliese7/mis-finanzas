import * as XLSX from 'xlsx';
import { formatMoney } from './money';
import type { Category, Transaction } from './types';

/**
 * Generates an Excel workbook with transactions organized by category.
 * Sheets:
 * - "Resumen": Totals by category (income/expense separated)
 * - "Detalle": All transactions with full details
 * - "Config": Export metadata
 */
export function transactionsToExcel(
  transactions: readonly Transaction[],
  categories: readonly Category[],
  referenceRate: number
): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Sheet 1: Resumen por categoría
  const summaryData = buildSummarySheet(transactions, categoryMap, referenceRate);
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  setColumnWidths(wsSummary, [25, 15, 15, 15, 15, 15]);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

  // Sheet 2: Detalle de todos los movimientos
  const detailData = buildDetailSheet(transactions, categoryMap, referenceRate);
  const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
  setColumnWidths(wsDetail, [14, 10, 25, 18, 18, 18, 18, 14, 40]);
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalle');

  // Sheet 3: Configuración / Metadatos
  const configData = buildConfigSheet(referenceRate, transactions.length);
  const wsConfig = XLSX.utils.aoa_to_sheet(configData);
  setColumnWidths(wsConfig, [30, 40]);
  XLSX.utils.book_append_sheet(wb, wsConfig, 'Config');

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

function buildSummarySheet(
  transactions: readonly Transaction[],
  categoryMap: Map<string, Category>,
  referenceRate: number
): (string | number)[][] {
  const incomeCategories = new Map<
    string,
    { name: string; total: number; count: number; color: string }
  >();
  const expenseCategories = new Map<
    string,
    { name: string; total: number; count: number; color: string }
  >();

  for (const tx of transactions) {
    const category = categoryMap.get(tx.categoryId);
    const catName = category?.name ?? 'Sin categoría';
    const catColor = category?.color ?? '#94a3b8';
    const key = `${tx.type}:${catName}`;
    const map = tx.type === 'income' ? incomeCategories : expenseCategories;

    const existing = map.get(key) ?? {
      name: catName,
      total: 0,
      count: 0,
      color: catColor
    };
    existing.total += tx.amountMinor;
    existing.count += 1;
    map.set(key, existing);
  }

  const rows: (string | number)[][] = [];

  // Header
  rows.push([
    'Categoría',
    'Tipo',
    'Total (ARS)',
    'Total (USD)',
    'Cantidad',
    'Porcentaje del total'
  ]);

  // Ingresos
  let incomeTotal = 0;
  for (const [, cat] of incomeCategories) {
    incomeTotal += cat.total;
  }

  for (const [, cat] of incomeCategories) {
    const usd =
      cat.total > 0 && referenceRate > 0 ? Math.round(cat.total / referenceRate) : 0;
    const pct =
      incomeTotal > 0 ? ((cat.total / incomeTotal) * 100).toFixed(1) + '%' : '0%';
    rows.push([cat.name, 'Ingreso', cat.total, usd, cat.count, pct]);
  }

  if (incomeTotal > 0) {
    const usd = referenceRate > 0 ? Math.round(incomeTotal / referenceRate) : 0;
    rows.push(['TOTAL INGRESOS', '', incomeTotal, usd, '', '100%']);
  }

  // Separator row
  rows.push([]);

  // Gastos
  let expenseTotal = 0;
  for (const [, cat] of expenseCategories) {
    expenseTotal += cat.total;
  }

  for (const [, cat] of expenseCategories) {
    const usd =
      cat.total > 0 && referenceRate > 0 ? Math.round(cat.total / referenceRate) : 0;
    const pct =
      expenseTotal > 0 ? ((cat.total / expenseTotal) * 100).toFixed(1) + '%' : '0%';
    rows.push([cat.name, 'Gasto', cat.total, usd, cat.count, pct]);
  }

  if (expenseTotal > 0) {
    const usd = referenceRate > 0 ? Math.round(expenseTotal / referenceRate) : 0;
    rows.push(['TOTAL GASTOS', '', expenseTotal, usd, '', '100%']);
  }

  // Balance
  const balance = incomeTotal - expenseTotal;
  const balanceUsd = referenceRate > 0 ? Math.round(balance / referenceRate) : 0;
  rows.push(['BALANCE (Ingresos - Gastos)', '', balance, balanceUsd, '', '']);

  return rows;
}

function buildDetailSheet(
  transactions: readonly Transaction[],
  categoryMap: Map<string, Category>,
  referenceRate: number
): (string | number)[][] {
  const rows: (string | number)[][] = [];

  // Header
  rows.push([
    'Fecha',
    'Tipo',
    'Categoría',
    'Monto (ARS)',
    'Monto (USD)',
    'Moneda original',
    'Cotización usada',
    'Monto original',
    'Nota'
  ]);

  // Sort by date desc, then createdAt desc
  const sorted = [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
  );

  for (const tx of sorted) {
    const category = categoryMap.get(tx.categoryId);
    const catName = category?.name ?? 'Sin categoría';
    const isIncome = tx.type === 'income';

    // Convert to ARS using exchange rate
    const rate = tx.exchangeRate ?? referenceRate;
    const arsMinor =
      tx.currency === 'USD' && rate > 0
        ? Math.round(tx.amountMinor * rate)
        : tx.currency === 'ARS'
          ? tx.amountMinor
          : 0;

    const usdMinor =
      tx.currency === 'ARS' && rate > 0
        ? Math.round(tx.amountMinor / rate)
        : tx.currency === 'USD'
          ? tx.amountMinor
          : 0;

    const originalAmount = formatMoney(tx.amountMinor, tx.currency);
    const arsAmount = formatMoney(arsMinor, 'ARS');
    const usdAmount = formatMoney(usdMinor, 'USD');
    const rateStr = rate > 0 ? rate.toFixed(2) : 'N/A';

    rows.push([
      tx.date,
      isIncome ? 'Ingreso' : 'Gasto',
      catName,
      arsAmount,
      usdAmount,
      tx.currency,
      rateStr,
      originalAmount,
      tx.note ?? ''
    ]);
  }

  return rows;
}

function buildConfigSheet(
  referenceRate: number,
  transactionCount: number
): (string | number)[][] {
  const now = new Date();
  return [
    ['Campo', 'Valor'],
    ['Fecha de exportación', now.toLocaleString('es-AR')],
    ['Cotización de referencia (ARS/USD)', referenceRate],
    ['Total de movimientos', transactionCount],
    ['Generado por', 'Mis Finanzas - PWA local-first'],
    ['Versión de esquema', '1.0']
  ];
}

function setColumnWidths(ws: XLSX.WorkSheet, widths: number[]): void {
  ws['!cols'] = widths.map((w) => ({ wch: w }));
}
