import { formatMonth } from '@/shared/lib/dates';
import { formatMoney } from '@/shared/lib/money';
import type { MonthlyBars } from '@/shared/lib/aggregations';
import type { Currency } from '@/shared/lib/types';
import type { DonutSlice } from './dashboard.helpers';

interface DonutTableProps {
  slices: readonly DonutSlice[];
  currency: Currency;
}

/** Accessible data table alternative for the expense donut (SPEC 7.9). */
export function DonutTable({ slices, currency }: DonutTableProps) {
  const total = slices.reduce((sum, slice) => sum + slice.total, 0);
  return (
    <details className="mt-1">
      <summary className="cursor-pointer text-xs text-content-muted transition-colors hover:text-content">
        Ver tabla de gastos
      </summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs">
          <caption className="sr-only">Gastos por categoría del mes</caption>
          <thead>
            <tr className="border-b border-border text-left text-content-muted">
              <th scope="col" className="py-1 font-medium">
                Categoría
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Monto
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {slices.map((slice) => (
              <tr
                key={slice.categoryId}
                className="border-b border-border last:border-b-0"
              >
                <th scope="row" className="py-1 text-left font-normal text-content">
                  {slice.name}
                </th>
                <td className="py-1 text-right tabular-nums text-content">
                  {formatMoney(slice.total, currency)}
                </td>
                <td className="py-1 text-right tabular-nums text-content-secondary">
                  {slice.percent} %
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border text-content">
              <th scope="row" className="py-1 text-left font-medium">
                Total
              </th>
              <td className="py-1 text-right font-medium tabular-nums">
                {formatMoney(total, currency)}
              </td>
              <td className="py-1 text-right font-medium tabular-nums">100 %</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </details>
  );
}

interface BarsTableProps {
  bars: readonly MonthlyBars[];
  currency: Currency;
}

/** Accessible data table alternative for the 6-month bars (SPEC 7.9). */
export function BarsTable({ bars, currency }: BarsTableProps) {
  return (
    <details className="mt-1">
      <summary className="cursor-pointer text-xs text-content-muted transition-colors hover:text-content">
        Ver tabla de los últimos 6 meses
      </summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs">
          <caption className="sr-only">Ingresos y gastos de los últimos 6 meses</caption>
          <thead>
            <tr className="border-b border-border text-left text-content-muted">
              <th scope="col" className="py-1 font-medium">
                Mes
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Ingresos
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Gastos
              </th>
            </tr>
          </thead>
          <tbody>
            {bars.map((bar) => (
              <tr key={bar.month} className="border-b border-border last:border-b-0">
                <th scope="row" className="py-1 text-left font-normal text-content">
                  {formatMonth(bar.month)}
                </th>
                <td className="py-1 text-right tabular-nums text-income-content">
                  {formatMoney(bar.income, currency)}
                </td>
                <td className="py-1 text-right tabular-nums text-expense-content">
                  {formatMoney(bar.expense, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
