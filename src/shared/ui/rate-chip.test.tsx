import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RateChip } from './rate-chip';
import { useRateStore } from '@/shared/stores/rate.store';

const RATE = {
  compra: 1490,
  venta: 1540,
  fechaActualizacion: '2026-10-02T18:55:00.000Z'
};

beforeEach(() => {
  useRateStore.setState({ status: 'idle', rate: null, lastFetched: null, error: null });
});

describe('RateChip', () => {
  it('shows the current official rate without decimals', () => {
    useRateStore.setState({ status: 'success', rate: RATE, lastFetched: Date.now() });
    render(<RateChip />);
    expect(screen.getByText('Dólar actual:')).toBeDefined();
    expect(screen.getByText('$ 1.540')).toBeDefined();
  });

  it('renders nothing while loading without a cached rate', () => {
    useRateStore.setState({ status: 'loading' });
    const { container } = render(<RateChip />);
    expect(container.textContent).toBe('');
  });

  it('renders nothing on error without a cached rate', () => {
    useRateStore.setState({ status: 'error', error: 'boom' });
    const { container } = render(<RateChip />);
    expect(container.textContent).toBe('');
  });

  it('keeps showing the cached rate when a refresh fails', () => {
    useRateStore.setState({ status: 'error', rate: RATE, lastFetched: 1, error: 'boom' });
    render(<RateChip />);
    expect(screen.getByText('$ 1.540')).toBeDefined();
  });
});
