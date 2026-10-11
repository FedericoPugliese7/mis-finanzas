import { useEffect, useRef } from 'react';
import { recurringRepo } from '@/shared/db/repos/recurring.repo';
import { todayISO } from '@/shared/lib/dates';

/**
 * Generates concrete transactions from recurring templates up to today.
 * Runs only once per app session to avoid interfering with live queries.
 */
export function useRecurringGeneration(): void {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    void (async () => {
      try {
        await recurringRepo.generateUpTo(todayISO());
      } catch {
        // Failures are non-blocking; the user can trigger generation manually
        // from Settings. In test environments without IndexedDB this is expected.
      }
    })();
  }, []);
}
