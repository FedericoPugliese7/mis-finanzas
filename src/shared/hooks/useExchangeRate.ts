import { useEffect } from 'react';
import { RATE_REFRESH_DELAY_MS, RATE_TTL_MS } from '@/shared/lib/rate-config';
import { useRateStore } from '@/shared/stores/rate.store';

/**
 * Keeps the official rate fresh: the first check is deferred 3 s so the
 * fetch/zod validation stay outside the LCP/TBT measurement window, then it
 * runs on every TTL interval and when the browser comes back online. All
 * failures are handled by the store.
 */
export function useExchangeRate(): void {
  const refreshIfStale = useRateStore((state) => state.refreshIfStale);

  useEffect(() => {
    const kickOff = window.setTimeout(() => void refreshIfStale(), RATE_REFRESH_DELAY_MS);
    const interval = setInterval(() => void refreshIfStale(), RATE_TTL_MS);
    const onOnline = () => void refreshIfStale();
    window.addEventListener('online', onOnline);
    return () => {
      clearTimeout(kickOff);
      clearInterval(interval);
      window.removeEventListener('online', onOnline);
    };
  }, [refreshIfStale]);
}
