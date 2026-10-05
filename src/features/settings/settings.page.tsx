import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useSettings } from '@/shared/hooks/useSettings';
import { useSettingsActions } from './hooks/use-settings-actions';
import { AppearanceSection } from './appearance-section';
import { RateSection } from './rate-section';
import { BackupSection } from '@/features/backup/backup-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { Spinner } from '@/shared/ui/spinner';

export default function SettingsPage() {
  const settings = useSettings();
  const { updateSettings } = useSettingsActions();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || settings === undefined) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Cargando ajustes" />
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
    <div className="flex flex-col gap-6">
      <SectionHeader
        icon={Settings}
        title="Ajustes"
        subtitle="Tema, moneda de visualización, cotización de referencia y backup de datos"
      />

      <div className="flex flex-col gap-4">
        <AppearanceSection onUpdate={handleUpdate} />
        <RateSection settings={settings} onUpdate={handleUpdate} />
        <BackupSection settings={settings} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
