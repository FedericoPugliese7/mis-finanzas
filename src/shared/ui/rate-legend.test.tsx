import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RateLegend } from './rate-legend';
import { useRateStore } from '@/shared/stores/rate.store';

const RATE = {
  compra: 1490,
  venta: 1540,
  fechaActualizacion: '2026-10-02T18:55:00.000Z'
};

beforeEach(() => {
  useRateStore.setState({ status: 'idle', rate: null, lastFetched: null, error: null });
});

describe('RateLegend', () => {
  it('shows the ARS equivalent of a USD amount', () => {
    useRateStore.setState({ status: 'success', rate: RATE, lastFetched: Date.now() });
    render(<RateLegend usdMinor={1000} />);
    // USD 10 a 1540 ARS/USD = ARS 15.400,00
    expect(screen.getByText('≈ $ 15.400,00 en pesos')).toBeDefined();
  });

  it('shows the unit rate when no amount is given', () => {
    useRateStore.setState({ status: 'success', rate: RATE, lastFetched: Date.now() });
    render(<RateLegend />);
    expect(screen.getByText('1 USD ≈ $ 1.540')).toBeDefined();
  });

  it('shows a quiet loading state while there is no rate', () => {
    useRateStore.setState({ status: 'loading' });
    render(<RateLegend />);
    expect(screen.getByText('Cargando cotización…')).toBeDefined();
  });

  it('renders nothing on error without a cached rate', () => {
    useRateStore.setState({ status: 'error', error: 'boom' });
    const { container } = render(<RateLegend />);
    expect(container.textContent).toBe('');
  });

  it('keeps showing the cached rate when a refresh fails', () => {
    useRateStore.setState({ status: 'error', rate: RATE, lastFetched: 1, error: 'boom' });
    render(<RateLegend usdMinor={1000} />);
    expect(screen.getByText('≈ $ 15.400,00 en pesos')).toBeDefined();
  });
});
