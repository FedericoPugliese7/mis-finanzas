import { useEffect, useState } from 'react';
import { useSettings } from '@/shared/hooks/useSettings';
import { useSettingsActions } from './hooks/use-settings-actions';
import { AppearanceSection } from './appearance-section';
import { RateSection } from './rate-section';
import { BackupSection } from '@/features/backup/backup-section';

export default function SettingsPage() {
  const settings = useSettings();
  const { updateSettings } = useSettingsActions();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || settings === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
        <div
          className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"
          aria-label="Cargando ajustes"
        />
        <p className="mt-3 text-sm text-content-secondary">Cargando ajustes…</p>
      </div>
    );
  }

  const handleUpdate = async (patch: Partial<typeof settings>) => {
    const updated = await updateSettings(patch);
    if (updated) {
      // Settings updated successfully; UI reacts via stores
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-content">Ajustes</h2>
          <p className="mt-0.5 text-sm text-content-secondary">
            Tema, moneda de visualización, cotización de referencia y backup de datos.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-5">
        <AppearanceSection onUpdate={handleUpdate} />
        <RateSection settings={settings} onUpdate={handleUpdate} />
        <BackupSection settings={settings} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
