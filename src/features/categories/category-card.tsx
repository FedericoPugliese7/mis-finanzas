import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/utils';
import { iconFor } from './category.constants';
import type { Category } from '@/shared/lib/types';

const ICON_BUTTON =
  'grid h-10 w-10 place-items-center rounded-lg text-content-secondary transition-colors hover:bg-surface-hover hover:text-content';

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
}

export function CategoryCard({
  category,
  onEdit,
  onToggleArchive,
  onDelete
}: CategoryCardProps) {
  const Icon = iconFor(category.icon);
  const isExpense = category.type === 'expense';

  return (
    <Card className="flex items-center gap-3 p-4">
      <span
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-control"
        style={{ backgroundColor: `${category.color}26`, color: category.color }}
      >
        <Icon size={20} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-content">{category.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
              isExpense
                ? 'bg-expense-soft text-expense-content'
                : 'bg-income-soft text-income-content'
            )}
          >
            {isExpense ? 'Gasto' : 'Ingreso'}
          </span>
          {category.archived ? (
            <span className="inline-flex rounded-full bg-background-subtle px-2 py-0.5 text-[11px] font-medium text-content-muted">
              Archivada
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <button
          type="button"
          aria-label={`Editar ${category.name}`}
          onClick={onEdit}
          className={ICON_BUTTON}
        >
          <Pencil size={16} aria-hidden />
        </button>
        <button
          type="button"
          aria-label={
            category.archived ? `Restaurar ${category.name}` : `Archivar ${category.name}`
          }
          onClick={onToggleArchive}
          className={ICON_BUTTON}
        >
          {category.archived ? (
            <ArchiveRestore size={16} aria-hidden />
          ) : (
            <Archive size={16} aria-hidden />
          )}
        </button>
        <button
          type="button"
          aria-label={`Eliminar ${category.name}`}
          onClick={onDelete}
          className={cn(ICON_BUTTON, 'hover:text-expense')}
        >
          <Trash2 size={16} aria-hidden />
        </button>
      </div>
    </Card>
  );
}
