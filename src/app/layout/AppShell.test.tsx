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

  it('shows the brand and links to the four sections', () => {
    renderShell();
    expect(screen.getAllByText('Mis Finanzas').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /dashboard/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /movimientos/i }).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByRole('link', { name: /categorías/i }).length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByRole('link', { name: /ajustes/i }).length).toBeGreaterThan(0);
  });

  it('marks the current section as the active page', () => {
    renderShell();
    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
    expect(
      dashboardLinks.every((link) => link.getAttribute('aria-current') === 'page')
    ).toBe(true);
  });
});
