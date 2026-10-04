import { settingsRepo } from '@/shared/db/repos/settings.repo';
import type { Settings } from '@/shared/lib/types';
import { usePreferencesStore } from '@/shared/stores/preferences.store';
import { useThemeStore } from '@/shared/stores/theme.store';
import { useUiStore } from '@/shared/stores/ui.store';

export function useSettingsActions() {
  const show = useUiStore((state) => state.show);

  async function updateSettings(patch: Partial<Settings>): Promise<Settings | null> {
    try {
      const updated = await settingsRepo.update(patch);
      if (patch.theme !== undefined) {
        useThemeStore.getState().setTheme(updated.theme);
      }
      if (patch.displayCurrency !== undefined) {
        usePreferencesStore.getState().setDisplayCurrency(updated.displayCurrency);
      }
      return updated;
    } catch {
      show({ message: 'No se pudieron guardar los ajustes' });
      return null;
    }
  }

  return { updateSettings };
}
