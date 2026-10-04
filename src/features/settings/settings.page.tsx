import { Settings } from 'lucide-react';
import { EmptyState } from '@/shared/ui/empty-state';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight text-content">Ajustes</h2>
      <EmptyState
        icon={Settings}
        title="Tus preferencias"
        description="Tema, moneda de visualización, cotización de referencia y backup de datos."
      />
    </div>
  );
}
