import { useDeferredValue, useMemo, useState } from 'react';
import { m } from 'motion/react';
import { ArrowLeftRight, Plus, Search, Wallet, Download } from 'lucide-react';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { presses, springs, listContainerVariants } from '@/shared/motion';
import { formatDayLabel, formatMonth, monthOf, todayISO } from '@/shared/lib/dates';
import { useToast } from '@/shared/hooks/useToast';
import { useSettings } from '@/shared/hooks/useSettings';
import type { NewTransaction } from '@/shared/db/repos/transactions.repo';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { MonthSelector } from '@/shared/ui/month-selector';
import { SectionHeader } from '@/shared/ui/section-header';
import { Segmented, type SegmentedOption } from '@/shared/ui/segmented';
import { Select } from '@/shared/ui/select';
import { Spinner } from '@/shared/ui/spinner';
import { downloadFile } from '@/shared/lib/download';
import { transactionsToExcel } from '@/shared/lib/excel';
import { TransactionForm } from './transaction-form';
import { TransactionRow } from './transaction-row';
import {
  filterTransactions,
  groupTransactionsByDay,
  type CurrencyFilter,
  type TransactionFilters,
  type TypeFilter
} from './transaction.helpers';
import type { TransactionFormValues } from './transaction.schema';
import { useTransactions } from './hooks/use-transactions';
import { useTransactionActions } from './hooks/use-transaction-actions';
import type { Transaction } from '@/shared/lib/types';

const TYPE_FILTER_OPTIONS: readonly SegmentedOption<TypeFilter>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'income', label: 'Ingresos' }
];

const CURRENCY_FILTER_OPTIONS: readonly SegmentedOption<CurrencyFilter>[] = [
  { value: 'all', label: 'Todas' },
  { value: 'ARS', label: 'ARS' },
  { value: 'USD', label: 'USD' }
];

const EMPTY_CATEGORY_NAMES = new Map<string, string>();

export default function TransactionsPage() {
  const transactions = useTransactions();
  const categories = useCategories();
  const actions = useTransactionActions();
  const { show } = useToast();
  const settings = useSettings();

  const [month, setMonth] = useState(() => monthOf(todayISO()));
  const [type, setType] = useState<TypeFilter>('all');
  const [currency, setCurrency] = useState<CurrencyFilter>('all');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const deferredQuery = useDeferredValue(query);

  const categoryById = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category])),
    [categories]
  );

  const groups = useMemo(() => {
    if (!transactions) return [];
    const filters: TransactionFilters = {
      month,
      type,
      currency,
      categoryId,
      query: deferredQuery
    };
    const categoryNames =
      deferredQuery.trim() === ''
        ? EMPTY_CATEGORY_NAMES
        : new Map((categories ?? []).map((category) => [category.id, category.name]));
    return groupTransactionsByDay(
      filterTransactions(transactions, filters, categoryNames)
    );
  }, [transactions, categories, month, type, currency, categoryId, deferredQuery]);

  if (!transactions || !categories) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Cargando movimientos" />
      </div>
    );
  }

  const activeCategories = categories.filter((category) => !category.archived);
  const hasActiveFilters =
    type !== 'all' || currency !== 'all' || categoryId !== 'all' || query.trim() !== '';

  function openCreate(): void {
    setEditing(null);
    setFormOpen(true);
  }

  function closeForm(open: boolean): void {
    if (!open) {
      setFormOpen(false);
      setEditing(null);
    }
  }

  function clearFilters(): void {
    setType('all');
    setCurrency('all');
    setCategoryId('all');
    setQuery('');
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
      if (editing) {
        await actions.update(editing.id, payload);
      } else {
        await actions.create(payload);
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      show({ message: 'No se pudo guardar el movimiento' });
    }
  }

  async function handleExportExcel(): Promise<void> {
    if (!transactions || !categories || !settings) return;
    try {
      const excel = transactionsToExcel(transactions, categories, settings.referenceRate);
      const filename = `mis-finanzas-movimientos-${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadFile(
        filename,
        excel,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      show({ message: 'Excel exportado correctamente.' });
    } catch {
      show({ message: 'No se pudo generar el Excel.' });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        icon={Wallet}
        title="Movimientos"
        subtitle="Lista de ingresos y gastos con filtros y búsqueda"
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportExcel}
              className="hidden lg:inline-flex"
            >
              <Download size={16} aria-hidden />
              Exportar Excel
            </Button>
            <Button size="sm" className="hidden lg:inline-flex" onClick={openCreate}>
              <Plus size={16} aria-hidden />
              Nuevo movimiento
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-3">
        <MonthSelector month={month} onChange={setMonth} className="sm:justify-start" />
        <div className="flex flex-wrap gap-2">
          <Segmented
            value={type}
            onChange={setType}
            options={TYPE_FILTER_OPTIONS}
            ariaLabel="Filtrar por tipo"
          />
          <Segmented
            value={currency}
            onChange={setCurrency}
            options={CURRENCY_FILTER_OPTIONS}
            ariaLabel="Filtrar por moneda"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Select
            value={categoryId}
            onValueChange={setCategoryId}
            options={[
              { value: 'all', label: 'Todas las categorías' },
              ...activeCategories.map((category) => ({
                value: category.id,
                label: category.name
              }))
            ]}
            aria-label="Categoría"
          />
          <div className="relative">
            <Search
              size={16}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
            />
            <Input
              className="pl-9"
              placeholder="Buscar por nota o categoría"
              aria-label="Buscar movimientos"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="No hay movimientos que coincidan con los filtros."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={ArrowLeftRight}
            title={`Sin movimientos en ${formatMonth(month)}`}
            description="Cargá tu primer movimiento para empezar a ordenar tus finanzas."
            action={
              <Button onClick={openCreate}>
                <Plus size={16} aria-hidden />
                Nuevo movimiento
              </Button>
            }
          />
        )
      ) : (
        groups.map((group) => {
          const dayLabel = formatDayLabel(group.date);
          return (
            <section key={group.date} aria-label={dayLabel}>
              <h3 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-content-muted">
                {dayLabel}
              </h3>
              <m.ul
                variants={listContainerVariants}
                className="rounded-card border border-border bg-surface px-2"
              >
                {group.items.map((transaction, index) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    category={categoryById.get(transaction.categoryId)}
                    onEdit={() => {
                      setEditing(transaction);
                      setFormOpen(true);
                    }}
                    onDelete={() => void actions.remove(transaction)}
                    style={{ transitionDelay: `${index * 30}ms` }}
                  />
                ))}
              </m.ul>
            </section>
          );
        })
      )}

      <m.button
        type="button"
        aria-label="Nuevo movimiento"
        onClick={openCreate}
        whileTap={presses.tap}
        transition={springs.micro}
        className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-content shadow-elevated lg:hidden"
      >
        <Plus size={24} aria-hidden />
      </m.button>

      <TransactionForm
        open={formOpen}
        onOpenChange={closeForm}
        categories={categories}
        transaction={editing}
        onSubmit={handleSave}
      />
    </div>
  );
}
