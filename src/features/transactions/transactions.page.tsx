import { ArrowLeftRight } from 'lucide-react';
import { EmptyState } from '@/shared/ui/empty-state';

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight text-content">Movimientos</h2>
      <EmptyState
        icon={ArrowLeftRight}
        title="Sin movimientos todavía"
        description="Acá vas a ver tus ingresos y gastos agrupados por día, con filtros y búsqueda."
      />
    </div>
  );
}
