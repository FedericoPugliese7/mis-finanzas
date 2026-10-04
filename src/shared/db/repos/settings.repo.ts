import {
  db,
  defaultSettings,
  SETTINGS_ID,
  type SettingsRecord
} from '@/shared/db/database';
import type { Settings } from '@/shared/lib/types';

function toSettings(record: SettingsRecord | undefined): Settings {
  if (record === undefined) return defaultSettings;
  const { id: _id, ...settings } = record;
  return { ...defaultSettings, ...settings };
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
