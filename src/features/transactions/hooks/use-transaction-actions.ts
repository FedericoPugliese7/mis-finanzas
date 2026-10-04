import { useMemo } from 'react';
import {
  transactionsRepo,
  type NewTransaction
} from '@/shared/db/repos/transactions.repo';
import { useToast } from '@/shared/hooks/useToast';
import type { Transaction } from '@/shared/lib/types';

export interface TransactionActions {
  create: (input: NewTransaction) => Promise<string>;
  update: (id: string, patch: Partial<NewTransaction>) => Promise<void>;
  /** Deletes and offers undo: the toast restores the original record as-is. */
  remove: (transaction: Transaction) => Promise<void>;
}

/** Movement CRUD cases of use with undoable delete (SPEC 4.2). */
export function useTransactionActions(): TransactionActions {
  const { show } = useToast();

  return useMemo<TransactionActions>(
    () => ({
      async create(input) {
        const id = await transactionsRepo.create(input);
        show({ message: 'Movimiento cargado' });
        return id;
      },

      async update(id, patch) {
        await transactionsRepo.update(id, patch);
        show({ message: 'Movimiento actualizado' });
      },

      async remove(transaction) {
        await transactionsRepo.remove(transaction.id);
        show({
          message: 'Movimiento eliminado',
          action: {
            label: 'Deshacer',
            onAction: () => {
              void transactionsRepo.restore(transaction);
            }
          }
        });
      }
    }),
    [show]
  );
}
