import { Tags } from 'lucide-react';
import { EmptyState } from '@/shared/ui/empty-state';

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight text-content">Categorías</h2>
      <EmptyState
        icon={Tags}
        title="Organizá tus gastos"
        description="Creá categorías con color e ícono para saber en qué se te va la plata."
      />
    </div>
  );
}
