import { Scale, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/shared/ui/animated-number';
import { Card } from '@/shared/ui/card';
import { RateLegend } from '@/shared/ui/rate-legend';
import { formatMoney } from '@/shared/lib/money';
import { cn } from '@/shared/ui/utils';
import type { Currency, DisplayCurrency } from '@/shared/lib/types';
import type { Totals } from '@/shared/lib/aggregations';

interface SummaryCardsProps {
  totals: Partial<Record<Currency, Totals>>;
  display: DisplayCurrency;
}

interface SummaryCardSpec {
  key: keyof Totals;
  label: string;
  icon: LucideIcon;
  tone?: string;
}

const SUMMARY_CARDS: readonly SummaryCardSpec[] = [
  { key: 'income', label: 'Ingresos', icon: TrendingUp, tone: 'text-income-content' },
  { key: 'expense', label: 'Gastos', icon: TrendingDown, tone: 'text-expense-content' },
  { key: 'balance', label: 'Balance', icon: Scale }
];

/** Income/expense/balance cards with smooth counts (SPEC 4.1 and 7.7). */
export function SummaryCards({ totals, display }: SummaryCardsProps) {
  const currencies: Currency[] = display === 'BOTH' ? ['ARS', 'USD'] : [display];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {SUMMARY_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key} className="p-4">
            <div className="flex items-center gap-2 text-content-secondary">
              <Icon size={16} aria-hidden />
              <span className="text-sm font-medium">{card.label}</span>
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {currencies.map((currency) => {
                const value = totals[currency]?.[card.key];
                if (value === undefined) return null;
                const tone =
                  card.tone ??
                  (value >= 0 ? 'text-income-content' : 'text-expense-content');
                return (
                  <div key={currency}>
                    <span className={cn('block text-xl font-semibold', tone)}>
                      <AnimatedNumber
                        value={value}
                        format={(amount) => formatMoney(amount, currency)}
                      />
                    </span>
                    {currency === 'USD' ? (
                      <RateLegend usdMinor={value} className="mt-0.5" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
