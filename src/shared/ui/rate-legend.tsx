import { convert } from '@/shared/lib/currency';
import { formatMoney } from '@/shared/lib/money';
import { useRateStore } from '@/shared/stores/rate.store';
import { cn } from './utils';

interface RateLegendProps {
  /** USD amount (minor units) shown by the parent; converts it to ARS. */
  usdMinor?: number;
  className?: string;
}

/**
 * Short legend under USD amounts: `≈ $ 23.100 en pesos`.
 * Without an amount it shows the unit rate. When there is no rate and the
 * last fetch failed, it renders nothing (never blocks the UI).
 */
export function RateLegend({ usdMinor, className }: RateLegendProps) {
  const status = useRateStore((state) => state.status);
  const rate = useRateStore((state) => state.rate);

  if (rate === null) {
    if (status === 'error') return null;
    return (
      <p className={cn('text-xs text-content-muted', className)} role="status">
        Cargando cotización…
      </p>
    );
  }

  const text =
    usdMinor === undefined
      ? `1 USD ≈ ${formatMoney(rate.venta * 100, 'ARS', { decimals: false })}`
      : `≈ ${formatMoney(convert(usdMinor, 'USD', 'ARS', rate.venta), 'ARS')} en pesos`;

  return <p className={cn('text-xs text-content-muted', className)}>{text}</p>;
}
