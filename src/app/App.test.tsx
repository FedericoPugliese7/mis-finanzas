import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// El dashboard real usa Dexie (IndexedDB), que no existe en jsdom y no se
// instala fake-indexeddb a propósito (decisión de la Fase 1). Este test cubre
// el shell de la app, no la página.
vi.mock('@/features/dashboard/dashboard.page', () => ({
  default: () => <div>Dashboard</div>
}));

describe('App Bootstrap', () => {
  it('renders the initial heading', () => {
    render(<App />);
    expect(screen.getByText('Mis Finanzas')).toBeDefined();
  });
});
