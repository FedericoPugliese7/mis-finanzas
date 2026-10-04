import { useLiveQuery } from 'dexie-react-hooks';
import { transactionsRepo } from '@/shared/db/repos/transactions.repo';
import type { Transaction } from '@/shared/lib/types';

/** All movements, live-refreshed from Dexie (filtering happens in memory). */
export function useTransactions(): Transaction[] | undefined {
  return useLiveQuery(() => transactionsRepo.getAll(), []);
}
