import { useEffect } from 'react';
import { RATE_TTL_MS } from '@/shared/lib/dolarapi';
import { useRateStore } from '@/shared/stores/rate.store';

/**
 * Keeps the official rate fresh: checks on mount, on every TTL interval and
 * when the browser comes back online. All failures are handled by the store.
 */
export function useExchangeRate(): void {
  const refreshIfStale = useRateStore((state) => state.refreshIfStale);

  useEffect(() => {
    void refreshIfStale();
    const interval = setInterval(() => void refreshIfStale(), RATE_TTL_MS);
    const onOnline = () => void refreshIfStale();
    window.addEventListener('online', onOnline);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', onOnline);
    };
  }, [refreshIfStale]);
}
