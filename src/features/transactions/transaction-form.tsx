import { useEffect, useId, useRef } from 'react';
import { useController, Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AnimatedDrawer,
  AnimatedDrawerContent,
  AnimatedDrawerDescription,
  AnimatedDrawerTitle
} from '@/shared/ui/animated-drawer';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';
import { parseMoney } from '@/shared/lib/money';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { MoneyInput } from '@/shared/ui/money-input';
import { Segmented, type SegmentedOption } from '@/shared/ui/segmented';
import { Select } from '@/shared/ui/select';
import {
  categoryOptionsFor,
  editTransactionDefaults,
  newTransactionDefaults
} from './transaction.helpers';
import { transactionFormSchema, type TransactionFormValues } from './transaction.schema';
import type {
  Category,
  Currency,
  Transaction,
  TransactionType
} from '@/shared/lib/types';

const TYPE_OPTIONS: readonly SegmentedOption<TransactionType>[] = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' }
];

const CURRENCY_OPTIONS: readonly SegmentedOption<Currency>[] = [
  { value: 'ARS', label: 'ARS' },
  { value: 'USD', label: 'USD' }
];

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** All categories (archived ones are kept so existing movements stay valid). */
  categories: readonly Category[];
  /** Existing movement to edit; omit (or null) to create a new one. */
  transaction?: Transaction | null;
  /** Receives validated values; the page closes the dialog after saving. */
  onSubmit: (values: TransactionFormValues) => Promise<void>;
}

/**
 * Create/edit movement form. Desktop renders a modal dialog, mobile renders a
 * Vaul bottom sheet with drag-to-close (SPEC 7.4).
 */
export function TransactionForm({
  open,
  onOpenChange,
  categories,
  transaction,
  onSubmit
}: TransactionFormProps) {
  const isDesktop = useIsDesktop();
  const fieldId = useId();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: newTransactionDefaults(categories)
  });

  // Re-initialize only on the closed → open transition: a live-query refresh
  // while the form is open must never wipe what the user is typing.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      reset(
        transaction
          ? editTransactionDefaults(transaction)
          : newTransactionDefaults(categories)
      );
    }
    wasOpenRef.current = open;
  }, [open, transaction, categories, reset]);

  const type = watch('type');
  const currency = watch('currency');
  const categoryField = useController({ control, name: 'categoryId' });
  const categoryId = categoryField.field.value;
  const options = categoryOptionsFor(categories, type, categoryId);

  function handleTypeChange(value: TransactionType): void {
    setValue('type', value, { shouldValidate: true });
    const current = categories.find((category) => category.id === categoryId);
    if (!current || current.type !== value) {
      const first = categories.find(
        (category) => category.type === value && !category.archived
      );
      categoryField.field.onChange(first?.id ?? '');
    }
  }

  /** Error message id for a field, used by `aria-describedby`. */
  function errorId(name: keyof TransactionFormValues): string | undefined {
    return errors[name] ? `${fieldId}-${name}-error` : undefined;
  }

  const title = transaction ? 'Editar movimiento' : 'Nuevo movimiento';
  const description = transaction
    ? 'Actualizá los datos del movimiento.'
    : 'Cargá el monto, la categoría y la fecha.';

  const fields = (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="space-y-1.5">
        <span className="text-sm font-medium text-content">Tipo</span>
        <Segmented
          value={type}
          onChange={handleTypeChange}
          options={TYPE_OPTIONS}
          ariaLabel="Tipo de movimiento"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${fieldId}-amount`} className="text-sm font-medium text-content">
          Monto
        </label>
        <Controller
          control={control}
          name="amountMinor"
          render={({ field }) => (
            <MoneyInput
              id={`${fieldId}-amount`}
              ref={field.ref}
              onBlur={field.onBlur}
              currency={currency}
              value={field.value ?? null}
              onValueChange={field.onChange}
              invalid={Boolean(errors.amountMinor)}
              aria-describedby={errorId('amountMinor')}
              placeholder="0,00"
            />
          )}
        />
        {errors.amountMinor ? (
          <p
            id={`${fieldId}-amountMinor-error`}
            role="alert"
            className="text-xs text-expense-content"
          >
            {errors.amountMinor.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-medium text-content">Moneda</span>
        <Segmented
          value={currency}
          onChange={(value) => setValue('currency', value, { shouldValidate: true })}
          options={CURRENCY_OPTIONS}
          ariaLabel="Moneda"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-medium text-content">Categoría</span>
        <Select
          ref={categoryField.field.ref}
          value={categoryId}
          onValueChange={categoryField.field.onChange}
          onBlur={categoryField.field.onBlur}
          options={options.map((category) => ({
            value: category.id,
            label: category.archived ? `${category.name} (archivada)` : category.name
          }))}
          placeholder="Elegí una categoría"
          aria-label="Categoría"
          aria-describedby={errorId('categoryId')}
          invalid={Boolean(errors.categoryId)}
        />
        {errors.categoryId ? (
          <p
            id={`${fieldId}-categoryId-error`}
            role="alert"
            className="text-xs text-expense-content"
          >
            {errors.categoryId.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${fieldId}-date`} className="text-sm font-medium text-content">
          Fecha
        </label>
        <Input
          id={`${fieldId}-date`}
          type="date"
          invalid={Boolean(errors.date)}
          aria-describedby={errorId('date')}
          {...register('date')}
        />
        {errors.date ? (
          <p
            id={`${fieldId}-date-error`}
            role="alert"
            className="text-xs text-expense-content"
          >
            {errors.date.message}
          </p>
        ) : null}
      </div>

      {currency === 'USD' ? (
        <div className="space-y-1.5">
          <label htmlFor={`${fieldId}-rate`} className="text-sm font-medium text-content">
            Cotización (ARS por 1 USD)
          </label>
          <Input
            id={`${fieldId}-rate`}
            inputMode="decimal"
            placeholder="Opcional"
            invalid={Boolean(errors.exchangeRate)}
            aria-describedby={errorId('exchangeRate')}
            {...register('exchangeRate', {
              setValueAs: (value) =>
                typeof value === 'string' ? parseMoney(value) : value
            })}
          />
          {errors.exchangeRate ? (
            <p
              id={`${fieldId}-exchangeRate-error`}
              role="alert"
              className="text-xs text-expense-content"
            >
              {errors.exchangeRate.message}
            </p>
          ) : null}
          <p className="text-xs text-content-muted">
            Si lo dejás vacío se usa la cotización de referencia.
          </p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor={`${fieldId}-note`} className="text-sm font-medium text-content">
          Nota <span className="font-normal text-content-muted">(opcional)</span>
        </label>
        <Input
          id={`${fieldId}-note`}
          maxLength={140}
          placeholder="Ej: Cuenta del mes"
          invalid={Boolean(errors.note)}
          aria-describedby={errorId('note')}
          {...register('note')}
        />
        {errors.note ? (
          <p
            id={`${fieldId}-note-error`}
            role="alert"
            className="text-xs text-expense-content"
          >
            {errors.note.message}
          </p>
        ) : null}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
      >
        {fields}
      </Dialog>
    );
  }

  return (
    <AnimatedDrawer open={open} onOpenChange={onOpenChange}>
      <AnimatedDrawerContent>
        <div
          aria-hidden
          className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-border"
        />
        <AnimatedDrawerTitle className="text-lg font-semibold text-content">
          {title}
        </AnimatedDrawerTitle>
        <AnimatedDrawerDescription className="mt-1 text-sm text-content-secondary">
          {description}
        </AnimatedDrawerDescription>
        <div className="mt-4">{fields}</div>
      </AnimatedDrawerContent>
    </AnimatedDrawer>
  );
}
