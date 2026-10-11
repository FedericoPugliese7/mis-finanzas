import { useMemo } from 'react';
import { m } from 'motion/react';
import { PiggyBank } from 'lucide-react';
import { iconFor } from '@/features/categories/category.constants';
import { computeBudgetStatuses } from '@/shared/lib/budgets';
import type { CategoryTotal } from '@/shared/lib/aggregations';
import { formatMoney } from '@/shared/lib/money';
import { transitions } from '@/shared/motion';
import { Card } from '@/shared/ui/card';
import type { Category } from '@/shared/lib/types';

interface BudgetSectionProps {
  categories: readonly Category[];
  expenseTotals: readonly CategoryTotal[];
}

export function BudgetSection({ categories, expenseTotals }: BudgetSectionProps) {
  const statuses = useMemo(
    () => computeBudgetStatuses(categories, expenseTotals),
    [categories, expenseTotals]
  );

  if (statuses.length === 0) {
    return (
      <Card variant="glass" className="p-5">
        <h2 className="text-sm font-semibold text-content">Presupuestos del mes</h2>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center">
          <PiggyBank size={24} className="text-content-muted" aria-hidden />
          <p className="text-sm font-medium text-content">Sin presupuestos configurados</p>
          <p className="max-w-xs text-xs text-content-secondary">
            Agregá un presupuesto mensual en cada categoría para controlar tus gastos.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-content">Presupuestos del mes</h2>
        <span className="text-xs text-content-muted">En ARS</span>
      </div>
      <ul className="mt-4 flex flex-col gap-4">
        {statuses.map((item) => {
          const Icon = iconFor(item.icon);
          const clamped = Math.min(item.percent, 100);
          return (
            <li key={item.categoryId} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-control"
                  style={{ backgroundColor: `${item.color}26`, color: item.color }}
                >
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-content">
                  {item.name}
                </span>
                <span
                  className={`shrink-0 text-xs font-medium ${
                    item.overBudget ? 'text-expense' : 'text-content-muted'
                  }`}
                >
                  {item.percent} %
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  aria-hidden
                  className="h-2 flex-1 overflow-hidden rounded-full bg-accent-soft"
                >
                  <m.div
                    className={`h-full origin-left rounded-full ${
                      item.overBudget ? 'bg-expense' : ''
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: clamped / 100 }}
                    transition={transitions.chart}
                    style={item.overBudget ? undefined : { backgroundColor: item.color }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right text-xs text-content-muted">
                  {formatMoney(item.spentMinor, 'ARS', { symbol: false })} /{' '}
                  {formatMoney(item.budgetMinor, 'ARS', { symbol: false })}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
