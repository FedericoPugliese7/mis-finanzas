import { useEffect, useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Segmented, type SegmentedOption } from '@/shared/ui/segmented';
import { cn } from '@/shared/ui/utils';
import { CATEGORY_COLORS, CATEGORY_ICONS, iconFor } from './category.constants';
import { categoryFormSchema, type CategoryFormValues } from './category.schema';
import type { Category, TransactionType } from '@/shared/lib/types';

const TYPE_OPTIONS: readonly SegmentedOption<TransactionType>[] = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' }
];

const CREATE_DEFAULTS: CategoryFormValues = {
  name: '',
  type: 'expense',
  color: '#6366f1',
  icon: 'house'
};

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing category to edit; omit (or null) to create a new one. */
  category?: Category | null;
  /** Receives validated values; the page closes the dialog after saving. */
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

/** Create/edit dialog: name, type (create only), color and icon pickers. */
export function CategoryForm({
  open,
  onOpenChange,
  category,
  onSubmit
}: CategoryFormProps) {
  const fieldId = useId();
  const isEdit = category != null;
  const defaults = useMemo<CategoryFormValues>(
    () =>
      category
        ? {
            name: category.name,
            type: category.type,
            color: category.color,
            icon: category.icon
          }
        : CREATE_DEFAULTS,
    [category]
  );
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaults
  });

  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  const type = watch('type');
  const color = watch('color');
  const icon = watch('icon');
  const PreviewIcon = iconFor(icon);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Editar categoría' : 'Nueva categoría'}
      description={
        isEdit
          ? 'Cambiá el nombre, el color o el ícono.'
          : 'Dale un nombre, un color y un ícono para reconocerla al instante.'
      }
    >
      <form
        noValidate
        className="space-y-5"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <div className="space-y-1.5">
          <label htmlFor={`${fieldId}-name`} className="text-sm font-medium text-content">
            Nombre
          </label>
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-control"
              style={{ backgroundColor: `${color}26`, color }}
            >
              <PreviewIcon size={20} />
            </span>
            <Input
              id={`${fieldId}-name`}
              placeholder="Ej: Supermercado"
              autoComplete="off"
              invalid={Boolean(errors.name)}
              {...register('name')}
            />
          </div>
          {errors.name ? (
            <p role="alert" className="text-xs text-expense">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-content">Tipo</span>
          {isEdit ? (
            <div>
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                  type === 'expense'
                    ? 'bg-expense-soft text-expense-content'
                    : 'bg-income-soft text-income-content'
                )}
              >
                {type === 'expense' ? 'Gasto' : 'Ingreso'}
              </span>
            </div>
          ) : (
            <Segmented
              value={type}
              onChange={(value) => setValue('type', value, { shouldValidate: true })}
              options={TYPE_OPTIONS}
              ariaLabel="Tipo de categoría"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-content">Color</span>
          <div role="radiogroup" aria-label="Color" className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((option) => {
              const selected = color === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.label}
                  onClick={() =>
                    setValue('color', option.value, { shouldValidate: true })
                  }
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-full transition-transform',
                    selected
                      ? 'outline-2 outline-offset-2 outline-content'
                      : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: option.value }}
                >
                  {selected ? (
                    <Check size={14} className="text-white" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-content">Ícono</span>
          <div
            role="radiogroup"
            aria-label="Ícono"
            className="grid grid-cols-8 gap-2 sm:grid-cols-12"
          >
            {CATEGORY_ICONS.map((option) => {
              const selected = icon === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.label}
                  onClick={() => setValue('icon', option.value, { shouldValidate: true })}
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-control border transition-colors',
                    selected
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-border bg-surface text-content-secondary hover:text-content'
                  )}
                >
                  <option.Icon size={16} aria-hidden />
                </button>
              );
            })}
          </div>
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
    </Dialog>
  );
}
