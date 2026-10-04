import { Wallet } from 'lucide-react';
import { EmptyState } from '@/shared/ui/empty-state';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight text-content">Dashboard</h2>
      <EmptyState
        icon={Wallet}
        title="Todavía no hay movimientos"
        description="Registrá tu primer ingreso o gasto para ver el resumen del mes."
      />
    </div>
  );
}
