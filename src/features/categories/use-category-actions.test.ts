import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { categoriesRepo } from '@/shared/db/repos/categories.repo';
import { useUiStore } from '@/shared/stores/ui.store';
import { useCategoryActions } from './hooks/use-category-actions';
import type { Category } from '@/shared/lib/types';

vi.mock('@/shared/db/repos/categories.repo', () => ({
  categoriesRepo: {
    getAll: vi.fn(),
    getActive: vi.fn(),
    getById: vi.fn(),
    getDefaultsByType: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
    unarchive: vi.fn(),
    remove: vi.fn(),
    hasTransactions: vi.fn()
  }
}));

const CATEGORY: Category = {
  id: 'expense-alquiler',
  name: 'Alquiler',
  type: 'expense',
  color: '#6366f1',
  icon: 'house',
  isDefault: true,
  archived: false
};

beforeEach(() => {
  vi.clearAllMocks();
  useUiStore.setState({ toasts: [] });
});

describe('archive-if-used rule (SPEC 4.3)', () => {
  it('archives instead of deleting when the category has movements', async () => {
    vi.mocked(categoriesRepo.hasTransactions).mockResolvedValue(true);
    const { result } = renderHook(() => useCategoryActions());

    let outcome: 'archived' | 'deleted' | undefined;
    await act(async () => {
      outcome = await result.current.remove(CATEGORY);
    });

    expect(outcome).toBe('archived');
    expect(categoriesRepo.hasTransactions).toHaveBeenCalledWith('expense-alquiler');
    expect(categoriesRepo.archive).toHaveBeenCalledWith('expense-alquiler');
    expect(categoriesRepo.remove).not.toHaveBeenCalled();
    expect(useUiStore.getState().toasts[0]?.message).toContain('movimientos');
  });

  it('deletes permanently when the category has no movements', async () => {
    vi.mocked(categoriesRepo.hasTransactions).mockResolvedValue(false);
    const { result } = renderHook(() => useCategoryActions());

    let outcome: 'archived' | 'deleted' | undefined;
    await act(async () => {
      outcome = await result.current.remove(CATEGORY);
    });

    expect(outcome).toBe('deleted');
    expect(categoriesRepo.remove).toHaveBeenCalledWith('expense-alquiler');
    expect(categoriesRepo.archive).not.toHaveBeenCalled();
    expect(useUiStore.getState().toasts[0]?.message).toContain('eliminada');
  });
});

describe('explicit archive', () => {
  it('archives and offers an undo action that restores the category', async () => {
    const { result } = renderHook(() => useCategoryActions());

    await act(async () => {
      await result.current.archive(CATEGORY);
    });

    expect(categoriesRepo.archive).toHaveBeenCalledWith('expense-alquiler');
    const toast = useUiStore.getState().toasts[0];
    expect(toast?.message).toContain('archivada');
    expect(toast?.action?.label).toBe('Deshacer');

    await act(async () => {
      toast?.action?.onAction();
    });
    expect(categoriesRepo.unarchive).toHaveBeenCalledWith('expense-alquiler');
  });

  it('restores an archived category', async () => {
    const { result } = renderHook(() => useCategoryActions());

    await act(async () => {
      await result.current.unarchive({ ...CATEGORY, archived: true });
    });

    expect(categoriesRepo.unarchive).toHaveBeenCalledWith('expense-alquiler');
    expect(useUiStore.getState().toasts[0]?.message).toContain('restaurada');
  });
});
