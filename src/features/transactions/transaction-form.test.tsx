import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TransactionForm } from './transaction-form';
import type { Category } from '@/shared/lib/types';

const CATEGORIES: Category[] = [
  {
    id: 'expense-food',
    name: 'Comida',
    type: 'expense',
    color: '#f59e0b',
    icon: 'utensils',
    isDefault: false,
    archived: false
  },
  {
    id: 'income-salary',
    name: 'Sueldo',
    type: 'income',
    color: '#10b981',
    icon: 'briefcase',
    isDefault: false,
    archived: false
  }
];

describe('transaction form (smoke, SPEC 8)', () => {
  it('submits a valid new movement with the parsed es-AR amount', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TransactionForm
        open
        onOpenChange={vi.fn()}
        categories={CATEGORIES}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText('Nuevo movimiento')).toBeDefined();

    fireEvent.input(screen.getByLabelText('Monto'), { target: { value: '1.234,56' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'expense',
        amountMinor: 123456,
        currency: 'ARS',
        categoryId: 'expense-food'
      })
    );
  });

  it('shows an error and skips submit when the amount is empty', async () => {
    const onSubmit = vi.fn();
    render(
      <TransactionForm
        open
        onOpenChange={vi.fn()}
        categories={CATEGORIES}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Ingresá un monto');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the optional exchange-rate field only for USD', () => {
    render(
      <TransactionForm
        open
        onOpenChange={vi.fn()}
        categories={CATEGORIES}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.queryByLabelText(/Cotización/)).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: 'USD' }));
    expect(screen.getByLabelText(/Cotización/)).toBeDefined();
  });
});
