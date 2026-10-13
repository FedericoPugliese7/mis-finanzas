import { useMemo } from 'react';
import { m } from 'motion/react';
import { PiggyBank } from 'lucide-react';
import { iconFor } from '@/features/categories/category.constants';
import { clampPercent, computeBudgetStatuses } from '@/shared/lib/budgets';
import type { CategoryTotal } from '@/shared/lib/aggregations';
import { formatMoney } from '@/shared/lib/money';
import {
  chartPhaseDelay,
  durations,
  listContainerVariants,
  listItemVariants,
  transitions
} from '@/shared/motion';
import { Card } from '@/shared/ui/card';
import type { Category } from '@/shared/lib/types';
import { useChartEntrance } from './hooks/use-chart-entrance';

interface BudgetSectionProps {
  categories: readonly Category[];
  expenseTotals: readonly CategoryTotal[];
}

const SIZE = 56;
const RADIUS = 24;
const STROKE = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const NEAR_THRESHOLD = 75;

type BudgetState = 'ok' | 'near' | 'over';

function budgetState(item: { percent: number; overBudget: boolean }): BudgetState {
  if (item.overBudget) return 'over';
  if (item.percent >= NEAR_THRESHOLD) return 'near';
  return 'ok';
}

function ringColor(item: { color: string; state: BudgetState }): string {
  if (item.state === 'over') return 'var(--expense)';
  if (item.state === 'near') return 'var(--warning)';
  return item.color;
}

function statusText(item: {
  state: BudgetState;
  remainingMinor: number;
  overspentMinor: number;
}): string {
  if (item.state === 'over') {
    return `excedido por ${formatMoney(item.overspentMinor, 'ARS', {
      symbol: false,
      decimals: false
    })}`;
  }
  return `quedan ${formatMoney(item.remainingMinor, 'ARS', {
    symbol: false,
    decimals: false
  })}`;
}

function statusTextClass(state: BudgetState): string {
  if (state === 'over') return 'text-expense-content';
  if (state === 'near') return 'text-warning';
  return 'text-content-secondary';
}

export function BudgetSection({ categories, expenseTotals }: BudgetSectionProps) {
  const animateOnMount = useChartEntrance();
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
          <p className="text-sm font-medium text-content">
            Sin presupuestos configurados
          </p>
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

      <m.ul
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {statuses.map((item, index) => {
          const Icon = iconFor(item.icon);
          const state = budgetState(item);
          const progress = clampPercent(item.percent);
          const offset = CIRCUMFERENCE * (1 - progress / 100);
          const ringStroke = ringColor({ color: item.color, state });
          const statusClass = statusTextClass(state);
          return (
            <m.li
              key={item.categoryId}
              variants={listItemVariants}
              layout="position"
              className="flex flex-col items-center gap-2 rounded-control border border-border-subtle bg-surface p-3 transition-colors hover:bg-surface-hover"
            >
              <div className="flex w-full items-center gap-2">
                <span
                  aria-hidden
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-control"
                  style={{
                    backgroundColor: `${item.color}26`,
                    color: item.color
                  }}
                >
                  <Icon size={14} />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-content">
                  {item.name}
                </span>
              </div>

              <div className="relative h-14 w-14">
                <svg
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  className="h-full w-full"
                  aria-hidden
                >
                  <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke="var(--border-subtle)"
                    strokeWidth={STROKE}
                  />
                  <m.circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={ringStroke}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                    initial={animateOnMount ? { strokeDashoffset: CIRCUMFERENCE } : false}
                    animate={{ strokeDashoffset: offset }}
                    transition={{
                      ...transitions.chart,
                      delay: chartPhaseDelay + index * durations.stagger
                    }}
                  />
                </svg>
                <span className="amount absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-content">
                  {item.percent > 999 ? '999+' : item.percent} %
                </span>
              </div>

              <span
                className={`amount text-center text-[11px] font-medium ${statusClass}`}
              >
                {statusText({
                  state,
                  remainingMinor: item.remainingMinor,
                  overspentMinor: item.overspentMinor
                })}
              </span>
            </m.li>
          );
        })}
      </m.ul>
    </Card>
  );
}
