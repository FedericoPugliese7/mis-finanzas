import {
  db,
  defaultSettings,
  SETTINGS_ID,
  type SettingsRecord
} from '@/shared/db/database';
import { toValidSettings } from '@/shared/lib/guards';
import type { Settings } from '@/shared/lib/types';

/**
 * Repo boundary: whatever Dexie holds is validated before reaching the app.
 * A corrupt/legacy row falls back to the defaults instead of leaking invalid
 * values into money conversions (mirror of `SettingsSchema`, zod-free by design:
 * this runs at boot and must not pull zod into the entry bundle).
 */
function toSettings(record: SettingsRecord | undefined): Settings {
  if (record === undefined) return defaultSettings;
  const { id: _id, ...settings } = record;
  return toValidSettings({ ...defaultSettings, ...settings }, defaultSettings);
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
