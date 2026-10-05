import { Suspense, lazy, useMemo, useState } from 'react';
import { m } from 'motion/react';
import { LayoutDashboard } from 'lucide-react';
import { Wallet } from 'lucide-react';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import {
  lastSixMonths,
  topCategories,
  totalsByCategory,
  totalsForDisplay
} from '@/shared/lib/aggregations';
import { formatMonth, monthOf, todayISO } from '@/shared/lib/dates';
import { fadeVariants, staggerContainerVariants } from '@/shared/motion';
import { useSettings } from '@/shared/hooks/useSettings';
import { usePreferencesStore } from '@/shared/stores/preferences.store';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { MonthSelector } from '@/shared/ui/month-selector';
import { SectionHeader } from '@/shared/ui/section-header';
import { Spinner } from '@/shared/ui/spinner';
import { BarsTable, DonutTable } from './chart-tables';
import { chartCurrency, donutSlices, latestTransactions } from './dashboard.helpers';
import { LatestMovements } from './latest-movements';
import { SummaryCards } from './summary-cards';
import { TopCategories } from './top-categories';

const CategoryDonut = lazy(() => import('./category-donut'));
const MonthlyBarsChart = lazy(() => import('./monthly-bars'));

const LATEST_LIMIT = 5;
const TOP_CATEGORIES_LIMIT = 5;

export default function DashboardPage() {
  const transactions = useTransactions();
  const categories = useCategories();
  const settings = useSettings();
  const display = usePreferencesStore((state) => state.displayCurrency);
  const [month, setMonth] = useState(() => monthOf(todayISO()));

  const categoriesById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category])),
    [categories]
  );

  if (!transactions || !categories || !settings) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Cargando dashboard" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHeader
          icon={LayoutDashboard}
          title="Dashboard"
          subtitle="Resumen del mes actual"
        />
        <EmptyState
          icon={Wallet}
          title="Todavía no hay movimientos"
          description="Registrá tu primer ingreso o gasto para ver el resumen del mes."
        />
      </div>
    );
  }

  const referenceRate = settings.referenceRate;
  const currency = chartCurrency(display);
  const totals = totalsForDisplay(transactions, month, display, referenceRate);
  const expenseTotals = totalsByCategory(
    transactions,
    month,
    categories,
    currency,
    referenceRate,
    'expense'
  );
  const totalExpense = expenseTotals.reduce((sum, item) => sum + item.total, 0);
  const slices = donutSlices(expenseTotals);
  const top = topCategories(expenseTotals, TOP_CATEGORIES_LIMIT);
  const bars = lastSixMonths(transactions, month, currency, referenceRate);
  const latest = latestTransactions(transactions, month, LATEST_LIMIT);

  return (
    <m.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <SectionHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="Resumen del mes actual"
      />

      <Card variant="filled" className="p-2">
        <MonthSelector month={month} onChange={setMonth} className="sm:justify-start" />
      </Card>

      <SummaryCards totals={totals} display={display} />

      <m.div variants={fadeVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-content">Gastos por categoría</h2>
            <span className="text-xs text-content-muted">
              Total gastos · {formatMonth(month)}
            </span>
          </div>
          {slices.length === 0 ? (
            <p className="py-10 text-center text-sm text-content-muted">
              Sin gastos en {formatMonth(month)}.
            </p>
          ) : (
            <>
              <div className="mt-3">
                <Suspense
                  fallback={
                    <div className="flex justify-center py-8">
                      <Spinner label="Cargando gráfico" />
                    </div>
                  }
                >
                  <CategoryDonut slices={slices} currency={currency} />
                </Suspense>
              </div>
              <DonutTable slices={slices} currency={currency} />
            </>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-content">Ingresos vs gastos</h2>
            <div className="flex items-center gap-3 text-xs text-content-muted">
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-income" />
                Ingresos
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-expense" />
                Gastos
              </span>
            </div>
          </div>
          <div className="mt-3">
            <Suspense
              fallback={
                <div className="flex justify-center py-8">
                  <Spinner label="Cargando gráfico" />
                </div>
              }
            >
              <MonthlyBarsChart bars={bars} currency={currency} />
            </Suspense>
          </div>
          <BarsTable bars={bars} currency={currency} />
        </Card>
      </m.div>

      <m.div variants={fadeVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-content">Top categorías de gastos</h2>
          <div className="mt-3">
            <TopCategories
              categories={top}
              currency={currency}
              totalExpense={totalExpense}
            />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-content">Últimos movimientos</h2>
          <div className="mt-3">
            <LatestMovements transactions={latest} categoriesById={categoriesById} />
          </div>
        </Card>
      </m.div>
    </m.div>
  );
}
