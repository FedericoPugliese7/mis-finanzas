import { useLiveQuery } from 'dexie-react-hooks';
import { recurringRepo } from '@/shared/db/repos/recurring.repo';
import type { RecurringTemplate } from '@/shared/lib/types';

const NO_TEMPLATES: RecurringTemplate[] = [];

/** All recurring templates, live-refreshed from Dexie. */
export function useRecurringTemplates(): RecurringTemplate[] | undefined {
  return useLiveQuery(() => recurringRepo.getAll(), [], NO_TEMPLATES) ?? undefined;
}
