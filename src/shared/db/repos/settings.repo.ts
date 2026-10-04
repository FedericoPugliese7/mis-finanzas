import {
  db,
  defaultSettings,
  SETTINGS_ID,
  type SettingsRecord
} from '@/shared/db/database';
import { SettingsSchema, type Settings } from '@/shared/lib/types';

/**
 * Repo boundary: whatever Dexie holds is validated with the zod schema before
 * reaching the app. A corrupt/legacy row falls back to the defaults instead of
 * leaking invalid values into money conversions.
 */
function toSettings(record: SettingsRecord | undefined): Settings {
  if (record === undefined) return defaultSettings;
  const { id: _id, ...settings } = record;
  const parsed = SettingsSchema.safeParse({ ...defaultSettings, ...settings });
  return parsed.success ? parsed.data : defaultSettings;
}

export const settingsRepo = {
  async get(): Promise<Settings> {
    const record = await db.settings.get(SETTINGS_ID);
    return toSettings(record);
  },

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await settingsRepo.get();
    const next: SettingsRecord = { id: SETTINGS_ID, ...current, ...patch };
    await db.settings.put(next);
    return toSettings(next);
  },

  async reset(): Promise<Settings> {
    const next: SettingsRecord = { id: SETTINGS_ID, ...defaultSettings };
    await db.settings.put(next);
    return defaultSettings;
  }
};
