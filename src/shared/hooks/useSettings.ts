import { useLiveQuery } from 'dexie-react-hooks';
import { settingsRepo } from '@/shared/db/repos/settings.repo';
import type { Settings } from '@/shared/lib/types';

/** Live settings (theme, display currency, reference rate) from Dexie. */
export function useSettings(): Settings | undefined {
  return useLiveQuery(() => settingsRepo.get(), []);
}
