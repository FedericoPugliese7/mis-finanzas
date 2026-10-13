import { useEffect, useRef, useState } from 'react';
import { Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { m } from 'motion/react';
import { AnimatedNumber } from '@/shared/ui/animated-number';
import { Card } from '@/shared/ui/card';
import { durationsMs, fadeVariants, pulseScaleVariants } from '@/shared/motion';
import { formatMoney } from '@/shared/lib/money';
import { cn } from '@/shared/ui/utils';
import type { Currency, DisplayCurrency } from '@/shared/lib/types';
import type { Totals } from '@/shared/lib/aggregations';

interface SummaryCardsProps {
  totals: Partial<Record<Currency, Totals>>;
  display: DisplayCurrency;
}

/**
 * Balance as the hero (glass card with a lime edge, biggest number) plus
 * smaller income/expense glass cards with gradient icon badges. Amounts are
 * signed and tabular so the direction of the money never depends on color
 * alone. When the balance flips sign between months, the hero badge pulses.
 */
export function SummaryCards({ totals, display }: SummaryCardsProps) {
  const currencies: Currency[] = display === 'BOTH' ? ['ARS', 'USD'] : [display];
  const both = currencies.length > 1;

  const [pulse, setPulse] = useState<'idle' | 'pulse'>('idle');
  const previousBalances = useRef<Partial<Record<Currency, number>>>({});

  useEffect(() => {
    let signChanged = false;
    for (const currency of Object.keys(totals) as Currency[]) {
      const value = totals[currency]?.balance;
      if (value === undefined) continue;
      const previous = previousBalances.current[currency];
      if (previous !== undefined && Math.sign(previous) !== Math.sign(value)) {
        signChanged = true;
      }
      previousBalances.current[currency] = value;
    }
    if (!signChanged) return;
    setPulse('pulse');
    const timer = window.setTimeout(() => setPulse('idle'), durationsMs.micro * 3);
    return () => window.clearTimeout(timer);
  }, [totals]);

  const amounts = (
    key: keyof Totals,
    signFor: (value: number) => string,
    tone: string,
    size: string
  ) =>
    currencies.map((currency) => {
      const value = totals[currency]?.[key];
      if (value === undefined) return null;
      return (
        <div key={currency}>
          <span className={cn('amount block font-semibold', tone, size)}>
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
      <Card className="glass relative overflow-hidden border-l-4 border-l-accent p-5 sm:col-span-2 lg:col-span-2">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent"
        />
        <div className="relative flex items-center gap-3">
          <m.span
            aria-hidden
            variants={pulseScaleVariants}
            initial="idle"
            animate={pulse}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-gradient-content shadow-md"
            style={{ background: 'linear-gradient(160deg, #b8ff63 0%, #5fab00 100%)' }}
          >
            <Scale size={20} />
          </m.span>
          <div>
            <span className="text-sm font-medium text-content-secondary">Balance</span>
            <div className="mt-1 flex flex-col gap-1">
              {amounts(
                'balance',
                (value) => (value > 0 ? '+' : ''),
                'text-content',
                balanceSize
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="glass p-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-gradient-content shadow-md"
            style={{ background: 'var(--income-gradient)' }}
          >
            <TrendingUp size={18} />
          </span>
          <span className="text-sm font-medium text-content-secondary">Ingresos</span>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          {amounts('income', () => '+', 'text-income-content', incomeSize)}
        </div>
      </Card>

      <Card className="glass p-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-gradient-content shadow-md"
            style={{ background: 'var(--expense-gradient)' }}
          >
            <TrendingDown size={18} />
          </span>
          <span className="text-sm font-medium text-content-secondary">Gastos</span>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          {amounts('expense', () => '\u2212', 'text-expense-content', incomeSize)}
        </div>
      </Card>
    </m.div>
  );
}
