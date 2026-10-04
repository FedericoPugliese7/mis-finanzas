import { useState } from 'react';
import { Plus, Tags } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { EmptyState } from '@/shared/ui/empty-state';
import { SectionHeader } from '@/shared/ui/section-header';
import { Spinner } from '@/shared/ui/spinner';
import { CategoryCard } from './category-card';
import { CategoryForm } from './category-form';
import type { CategoryFormValues } from './category.schema';
import { useCategories } from './hooks/useCategories';
import { useCategoryActions } from './hooks/use-category-actions';
import type { Category } from '@/shared/lib/types';

export default function CategoriesPage() {
  const categories = useCategories();
  const actions = useCategoryActions();
  const { show } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  if (!categories) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Cargando categorías" />
      </div>
    );
  }

  const active = categories.filter((category) => !category.archived);
  const archived = categories.filter((category) => category.archived);

  async function handleSave(values: CategoryFormValues): Promise<void> {
    try {
      if (editing) {
        // Type is immutable: transactions reference the category's type.
        await actions.update(editing.id, {
          name: values.name,
          color: values.color,
          icon: values.icon
        });
      } else {
        await actions.create({
          name: values.name,
          type: values.type,
          color: values.color,
          icon: values.icon,
          isDefault: false,
          archived: false
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      show({ message: 'No se pudo guardar la categoría' });
    }
  }

  function closeForm(): void {
    setFormOpen(false);
    setEditing(null);
  }

  function confirmDelete(): void {
    const category = pendingDelete;
    setPendingDelete(null);
    if (category) void actions.remove(category);
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        icon={Tags}
        title="Categorías"
        subtitle="Organizá tus ingresos y gastos por categorías personalizadas"
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} aria-hidden />
            Nueva categoría
          </Button>
        }
      />

      {active.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No tenés categorías activas"
          description="Creá una categoría con color e ícono para organizar tus movimientos."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus size={16} aria-hidden />
              Nueva categoría
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {active.map((category) => (
            <li key={category.id}>
              <CategoryCard
                category={category}
                onEdit={() => {
                  setEditing(category);
                  setFormOpen(true);
                }}
                onToggleArchive={() => void actions.archive(category)}
                onDelete={() => setPendingDelete(category)}
              />
            </li>
          ))}
        </ul>
      )}

      {archived.length > 0 ? (
        <section className="flex flex-col gap-3" aria-labelledby="archived-heading">
          <h3
            id="archived-heading"
            className="text-sm font-semibold text-content-secondary"
          >
            Archivadas
          </h3>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {archived.map((category) => (
              <li key={category.id}>
                <CategoryCard
                  category={category}
                  onEdit={() => {
                    setEditing(category);
                    setFormOpen(true);
                  }}
                  onToggleArchive={() => void actions.unarchive(category)}
                  onDelete={() => setPendingDelete(category)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CategoryForm
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        category={editing}
        onSubmit={handleSave}
      />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={`¿Eliminar «${pendingDelete?.name ?? ''}»?`}
        description="Si la categoría tiene movimientos se archiva en vez de borrarse. Si no tiene, se elimina permanentemente."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
