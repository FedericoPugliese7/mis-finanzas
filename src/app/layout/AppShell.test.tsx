import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { formatLongDate, todayISO } from '@/shared/lib/dates';

function renderShell() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AppShell />
    </MemoryRouter>
  );
}

describe('AppShell', () => {
  it('shows the current long date in the header', () => {
    renderShell();
    expect(screen.getByText(formatLongDate(todayISO()))).toBeDefined();
  });

  it('shows the brand and the four section navigation buttons', () => {
    renderShell();
    expect(screen.getAllByText('Mis Finanzas').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /dashboard/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /movimientos/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /categorías/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /ajustes/i })).toBeDefined();
  });
});
