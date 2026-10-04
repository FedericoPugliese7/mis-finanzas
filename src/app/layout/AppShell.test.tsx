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

  it('shows the brand and the four section links', () => {
    renderShell();
    expect(screen.getAllByText('Mis Finanzas').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /movimientos/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /categorías/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /ajustes/i })).toBeDefined();
  });
});
