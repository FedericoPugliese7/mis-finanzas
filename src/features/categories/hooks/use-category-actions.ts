import { useMemo } from 'react';
import { categoriesRepo, type NewCategory } from '@/shared/db/repos/categories.repo';
import { useToast } from '@/shared/hooks/useToast';
import type { Category } from '@/shared/lib/types';

export interface CategoryActions {
  create: (input: NewCategory) => Promise<string>;
  update: (id: string, patch: Partial<NewCategory>) => Promise<void>;
  archive: (category: Category) => Promise<void>;
  unarchive: (category: Category) => Promise<void>;
  /** Returns `'archived'` when the archive-if-used rule applied, else `'deleted'`. */
  remove: (category: Category) => Promise<'archived' | 'deleted'>;
}

/**
 * Category CRUD cases of use (SPEC 4.3). Applies the archive-if-used rule:
 * a category with movements is archived instead of deleted, so history is
 * never orphaned.
 */
export function useCategoryActions(): CategoryActions {
  const { show } = useToast();

  return useMemo<CategoryActions>(
    () => ({
      async create(input) {
        const id = await categoriesRepo.create(input);
        show({ message: 'Categoría creada' });
        return id;
      },

      async update(id, patch) {
        await categoriesRepo.update(id, patch);
        show({ message: 'Categoría actualizada' });
      },

      async archive(category) {
        await categoriesRepo.archive(category.id);
        show({
          message: `«${category.name}» archivada`,
          action: {
            label: 'Deshacer',
            onAction: () => {
              void categoriesRepo.unarchive(category.id);
            }
          }
        });
      },

      async unarchive(category) {
        await categoriesRepo.unarchive(category.id);
        show({ message: `«${category.name}» restaurada` });
      },

      async remove(category) {
        const hasTransactions = await categoriesRepo.hasTransactions(category.id);
        if (hasTransactions) {
          await categoriesRepo.archive(category.id);
          show({
            message: `«${category.name}» tiene movimientos: se archivó en vez de borrarla`
          });
          return 'archived';
        }
        await categoriesRepo.remove(category.id);
        show({ message: `«${category.name}» eliminada` });
        return 'deleted';
      }
    }),
    [show]
  );
}
