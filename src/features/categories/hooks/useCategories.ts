import { useLiveQuery } from 'dexie-react-hooks';
import { categoriesRepo } from '@/shared/db/repos/categories.repo';
import type { Category } from '@/shared/lib/types';

const NO_CATEGORIES: Category[] = [];

/** All categories (active + archived), live-refreshed from Dexie. */
export function useCategories(): Category[] | undefined {
  return useLiveQuery(() => categoriesRepo.getAll(), [], NO_CATEGORIES) ?? undefined;
}
