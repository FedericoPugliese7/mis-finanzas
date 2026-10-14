import { Suspense, lazy, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from 'motion/react';
import { LayoutDashboard, Plus } from 'lucide-react';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useTransactions } from '@/features/transactions/hooks/use-transactions';
import { useTransactionActions } from '@/features/transactions/hooks/use-transaction-actions';
import { TransactionForm } from '@/features/transactions/transaction-form';
import type { TransactionFormValues } from '@/features/transactions/transaction.schema';
import { recurringRepo } from '@/shared/db/repos/recurring.repo';
import type { NewTransaction } from '@/shared/db/repos/transactions.repo';
import {
  lastSixMonths,
  topCategories,
  totalsByCategory,
  totalsForDisplay
} from '@/shared/lib/aggregations';
import { formatMonth, monthOf, todayISO } from '@/shared/lib/dates';
import { useToast } from '@/shared/hooks/useToast';
import {
  dashboardStaggerVariants,
  fadeVariants,
  presses,
  springs
} from '@/shared/motion';
import { useSettings } from '@/shared/hooks/useSettings';
import { usePreferencesStore } from '@/shared/stores/preferences.store';
import { Card } from '@/shared/ui/card';
import { MonthSelector } from '@/shared/ui/month-selector';
import { SectionHeader } from '@/shared/ui/section-header';
import { Spinner } from '@/shared/ui/spinner';
import { BarsTable, DonutTable } from './chart-tables';
import { BudgetSection } from './budget-section';
import { chartCurrency, donutSlices, latestTransactions } from './dashboard.helpers';
import { LatestMovements } from './latest-movements';
import { SummaryCards } from './summary-cards';
import { TopCategories } from './top-categories';

const CategoryDonut = lazy(() => import('./category-donut'));
const MonthlyBarsChart = lazy(() => import('./monthly-bars'));

const LATEST_LIMIT = 5;
const TOP_CATEGORIES_LIMIT = 5;

export default function DashboardPage() {
  const navigate = useNavigate();
  const transactions = useTransactions();
  const categories = useCategories();
  const settings = useSettings();
  const display = usePreferencesStore((state) => state.displayCurrency);
  const { show } = useToast();
  const actions = useTransactionActions();
  const [month, setMonth] = useState(() => monthOf(todayISO()));
  const [formOpen, setFormOpen] = useState(false);

  const categoriesById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category])),
    [categories]
  );

  function openCreate(): void {
    setFormOpen(true);
  }

  function closeForm(open: boolean): void {
    if (!open) {
      setFormOpen(false);
    }
  }

  async function handleSave(values: TransactionFormValues): Promise<void> {
    if (values.amountMinor === null) return;
    try {
      const payload: NewTransaction = {
        type: values.type,
        amountMinor: values.amountMinor,
        currency: values.currency,
        categoryId: values.categoryId,
        date: values.date,
        note: values.note?.trim() || undefined,
        exchangeRate:
          values.currency === 'USD' && values.exchangeRate
            ? values.exchangeRate
            : undefined
      };
      await actions.create(payload);
      if (values.isRecurring) {
        await recurringRepo.createFromTransaction(payload);
        show({ message: 'Movimiento recurrente creado' });
      }
      setFormOpen(false);
    } catch {
      show({ message: 'No se pudo guardar el movimiento' });
    }
  }

  if (!transactions || !categories || !settings) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Cargando dashboard" />
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
  const expenseTotalsARS = totalsByCategory(
    transactions,
    month,
    categories,
    'ARS',
    referenceRate,
    'expense'
  );
  const totalExpense = expenseTotals.reduce((sum, item) => sum + item.total, 0);
  const slices = donutSlices(expenseTotals);
  const top = topCategories(expenseTotals, TOP_CATEGORIES_LIMIT);
  const bars = lastSixMonths(transactions, month, currency, referenceRate);
  const latest = latestTransactions(transactions, month, LATEST_LIMIT);

  return (
    <>
      <div
        className="sticky z-30 -mx-4 px-4 pb-2 pt-1"
        style={{ top: 'var(--app-header-height)' }}
      >
        <div className="glass rounded-control px-2 py-1">
          <MonthSelector
            month={month}
            onChange={setMonth}
            size="sm"
            className="sm:justify-start"
          />
        </div>
      </div>

      <m.div
        variants={dashboardStaggerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        <m.div variants={fadeVariants}>
          <SectionHeader
            icon={LayoutDashboard}
            title="Dashboard"
            subtitle="Resumen del mes actual"
          />
        </m.div>

        <SummaryCards totals={totals} display={display} />

        <m.div variants={fadeVariants}>
          <BudgetSection categories={categories} expenseTotals={expenseTotalsARS} />
        </m.div>

        <m.div variants={fadeVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card variant="glass" className="flex flex-col p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-content">Gastos por categoría</h2>
              <span className="text-xs text-content-muted">
                Total gastos · {formatMonth(month)}
              </span>
            </div>
            {slices.length === 0 ? (
              <div className="mt-3 flex min-h-[260px] flex-1 items-center justify-center">
                <p className="text-center text-sm text-content-muted">
                  Sin gastos en {formatMonth(month)}.
                </p>
              </div>
            ) : (
              <div className="mt-3 min-h-[260px] flex-1">
                <Suspense
                  fallback={
                    <div className="flex justify-center py-8">
                      <Spinner label="Cargando gráfico" />
                    </div>
                  }
                >
                  <CategoryDonut
                    slices={slices}
                    currency={currency}
                    onSelectCategory={(categoryId) =>
                      navigate('/transactions', { state: { categoryId, month } })
                    }
                  />
                </Suspense>
              </div>
            )}
            <div className="mt-auto pt-3">
              <DonutTable slices={slices} currency={currency} />
            </div>
          </Card>

          <Card variant="glass" className="flex flex-col p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-content">Ingresos vs gastos</h2>
              <div className="flex items-center gap-3 text-xs text-content-muted">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-income" />
                  Ingresos
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-expense" />
                  Gastos
                </span>
              </div>
            </div>
            <div className="mt-3 min-h-[260px] flex-1">
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
            <div className="mt-auto pt-3">
              <BarsTable bars={bars} currency={currency} />
            </div>
          </Card>
        </m.div>

        <m.div variants={fadeVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card variant="glass" className="flex flex-col p-5">
            <h2 className="text-sm font-semibold text-content">
              Top categorías de gastos
            </h2>
            <div className="mt-3 min-h-[220px] flex-1">
              <TopCategories
                categories={top}
                currency={currency}
                totalExpense={totalExpense}
              />
            </div>
          </Card>
          <Card variant="glass" className="flex flex-col p-5">
            <h2 className="text-sm font-semibold text-content">Últimos movimientos</h2>
            <div className="mt-3 min-h-[220px] flex-1">
              <LatestMovements transactions={latest} categoriesById={categoriesById} />
            </div>
          </Card>
        </m.div>
      </m.div>

      <m.button
        type="button"
        aria-label={formOpen ? 'Cerrar formulario' : 'Nuevo movimiento'}
        aria-expanded={formOpen}
        onClick={formOpen ? () => closeForm(false) : openCreate}
        whileTap={presses.tap}
        transition={springs.micro}
        className="glow-accent fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full border border-border bg-accent text-accent-content shadow-elevated ring-1 ring-accent/20 lg:bottom-6 lg:right-6"
      >
        <m.span
          aria-hidden
          animate={{ rotate: formOpen ? 45 : 0 }}
          transition={springs.snappy}
          className="grid place-items-center"
        >
          <Plus size={24} />
        </m.span>
      </m.button>

      <TransactionForm
        open={formOpen}
        onOpenChange={closeForm}
        categories={categories}
        transaction={null}
        onSubmit={handleSave}
      />
    </>
  );
}
