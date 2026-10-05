import { Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { m } from 'motion/react';
import { AnimatedNumber } from '@/shared/ui/animated-number';
import { Card } from '@/shared/ui/card';
import { fadeVariants } from '@/shared/motion';
import { formatMoney } from '@/shared/lib/money';
import { cn } from '@/shared/ui/utils';
import type { Currency, DisplayCurrency } from '@/shared/lib/types';
import type { Totals } from '@/shared/lib/aggregations';

interface SummaryCardsProps {
  totals: Partial<Record<Currency, Totals>>;
  display: DisplayCurrency;
}

/**
 * Balance as the hero (inverted surface, biggest number) plus smaller
 * income/expense cards to its right. Amounts are signed and tabular so the
 * direction of the money never depends on color alone.
 */
export function SummaryCards({ totals, display }: SummaryCardsProps) {
  const currencies: Currency[] = display === 'BOTH' ? ['ARS', 'USD'] : [display];
  const both = currencies.length > 1;

  const amounts = (
    key: keyof Totals,
    signFor: (value: number) => string,
    toneFor: (value: number) => string,
    size: string
  ) =>
    currencies.map((currency) => {
      const value = totals[currency]?.[key];
      if (value === undefined) return null;
      return (
        <div key={currency}>
          <span className={cn('amount block font-semibold', size, toneFor(value))}>
            {signFor(value)}
            <AnimatedNumber
              value={value}
              format={(amount) => formatMoney(amount, currency)}
            />
          </span>
        </div>
      );
    });

  const incomeSize = both ? 'text-xl' : 'text-2xl';
  const balanceSize = both ? 'text-2xl' : 'text-3xl';

  return (
    <m.div
      variants={fadeVariants}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Card className="border-0 bg-content p-5 text-content-inverse sm:col-span-2 lg:col-span-2">
        <div className="flex items-center gap-2 text-content-inverse/70">
          <Scale size={16} aria-hidden />
          <span className="text-sm font-medium">Balance</span>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {amounts(
            'balance',
            (value) => (value > 0 ? '+' : ''),
            () => 'text-content-inverse',
            balanceSize
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-content-secondary">
          <TrendingUp size={16} aria-hidden />
          <span className="text-sm font-medium">Ingresos</span>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {amounts(
            'income',
            () => '+',
            () => 'text-income-content',
            incomeSize
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-content-secondary">
          <TrendingDown size={16} aria-hidden />
          <span className="text-sm font-medium">Gastos</span>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {amounts(
            'expense',
            () => '\u2212',
            () => 'text-expense-content',
            incomeSize
          )}
        </div>
      </Card>
    </m.div>
  );
}
