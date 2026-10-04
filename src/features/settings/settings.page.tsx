import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useSettings } from '@/shared/hooks/useSettings';
import { useSettingsActions } from './hooks/use-settings-actions';
import { AppearanceSection } from './appearance-section';
import { RateSection } from './rate-section';
import { BackupSection } from '@/features/backup/backup-section';
import { SectionHeader } from '@/shared/ui/section-header';

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
      <SectionHeader
        icon={Settings}
        title="Ajustes"
        subtitle="Tema, moneda de visualización, cotización de referencia y backup de datos"
      />

      <div className="flex flex-col gap-5">
        <AppearanceSection onUpdate={handleUpdate} />
        <RateSection settings={settings} onUpdate={handleUpdate} />
        <BackupSection settings={settings} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
