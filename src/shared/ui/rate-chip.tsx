import { formatMoney } from '@/shared/lib/money';
import { useRateStore } from '@/shared/stores/rate.store';

/**
 * Informative header chip with the current official USD rate
 * (`Dólar actual: $ 1.540`). Static, not interactive: it renders nothing
 * until a rate is known (loading/error without cache never blocks the UI),
 * and keeps showing the last known rate when a refresh fails.
 */
export function RateChip() {
  const rate = useRateStore((state) => state.rate);

  if (rate === null) return null;

  return (
    <p className="hidden shrink-0 items-center gap-1.5 rounded-control border border-border-subtle bg-background-subtle px-2.5 py-1 text-xs text-content-secondary sm:inline-flex">
      Dólar actual:
      <span className="amount font-medium text-content">
        {formatMoney(rate.venta * 100, 'ARS', { decimals: false })}
      </span>
    </p>
  );
}
