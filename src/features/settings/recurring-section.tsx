import { useState } from 'react';
import { m } from 'motion/react';
import { Repeat, Trash2 } from 'lucide-react';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useRecurringTemplates } from './hooks/use-recurring-templates';
import { recurringRepo } from '@/shared/db/repos/recurring.repo';
import { todayISO } from '@/shared/lib/dates';
import { formatMoney } from '@/shared/lib/money';
import { useToast } from '@/shared/hooks/useToast';
import { listContainerVariants, listItemVariants } from '@/shared/motion';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Dialog } from '@/shared/ui/dialog';
import { Spinner } from '@/shared/ui/spinner';
import { iconFor } from '@/features/categories/category.constants';

const ICON_BUTTON =
  'grid h-9 w-9 place-items-center rounded-control text-content-secondary transition-colors hover:bg-surface-hover hover:text-content';

export function RecurringSection() {
  const templates = useRecurringTemplates();
  const categories = useCategories();
  const { show } = useToast();
  const [generating, setGenerating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  if (templates === undefined || categories === undefined) {
    return (
      <Card className="p-5">
        <Spinner label="Cargando recurrentes" />
      </Card>
    );
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));

  async function handleGenerate(): Promise<void> {
    setGenerating(true);
    try {
      const created = await recurringRepo.generateUpTo(todayISO());
      show({
        message:
          created > 0
            ? `${created} movimiento${created === 1 ? '' : 's'} recurrente${created === 1 ? '' : 's'} generado${created === 1 ? '' : 's'}`
            : 'No había movimientos recurrentes pendientes'
      });
    } catch {
      show({ message: 'No se pudieron generar los movimientos recurrentes' });
    } finally {
      setGenerating(false);
    }
  }

  async function handleRemove(id: string): Promise<void> {
    try {
      await recurringRepo.remove(id);
      show({ message: 'Plantilla recurrente eliminada' });
    } catch {
      show({ message: 'No se pudo eliminar la plantilla' });
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-content">
            Movimientos recurrentes
          </h2>
          <p className="mt-1 text-sm text-content-secondary">
            Marcá un movimiento como "repetir mensualmente" al cargarlo y la app generará
            automáticamente las próximas ocurrencias.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={generating || templates.length === 0}
          onClick={() => void handleGenerate()}
        >
          <Repeat size={16} aria-hidden />
          {generating ? 'Generando…' : 'Generar hasta hoy'}
        </Button>
      </div>

      {templates.length === 0 ? (
        <p className="mt-5 text-center text-sm text-content-muted">
          No tenés movimientos recurrentes guardados.
        </p>
      ) : (
        <m.ul
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          className="mt-5 flex flex-col gap-2"
        >
          {templates.map((template) => {
            const category = categoryById.get(template.categoryId);
            const Icon = iconFor(category?.icon ?? 'circle-help');
            return (
              <m.li
                key={template.id}
                variants={listItemVariants}
                layout="position"
                className="flex items-center gap-3 rounded-control border border-border-subtle bg-surface p-3"
              >
                <span
                  aria-hidden
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-control"
                  style={{
                    backgroundColor: category?.color ? `${category.color}26` : undefined,
                    color: category?.color
                  }}
                >
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-content">
                    {category?.name ?? 'Categoría desconocida'} ·{' '}
                    {formatMoney(template.amountMinor, template.currency)}
                  </p>
                  <p className="text-xs text-content-muted">
                    Mensual · desde {template.startDate} · último generado{' '}
                    {template.lastGeneratedDate}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Eliminar plantilla recurrente"
                  onClick={() => setPendingDelete(template.id)}
                  className={ICON_BUTTON}
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </m.li>
            );
          })}
        </m.ul>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="¿Eliminar plantilla recurrente?"
        description="Los movimientos ya generados no se borran; solo deja de crear nuevas ocurrencias."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => pendingDelete && void handleRemove(pendingDelete)}
          >
            Eliminar
          </Button>
        </div>
      </Dialog>
    </Card>
  );
}
