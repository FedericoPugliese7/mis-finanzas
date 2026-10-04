import type { Currency, Transaction } from './types';

/** Exchange rate expressed as ARS per 1 USD. */
export type Rate = number;

/** Resolves the ARS/USD rate to use for a transaction (own rate or reference). */
export function resolveRate(tx: Transaction, referenceRate: Rate): Rate {
  return tx.exchangeRate ?? referenceRate;
}

/**
 * Converts an integer amount in minor units between currencies.
 * When the rate is not a positive finite number the amount is returned
 * unchanged (never blocks, never fabricates a conversion).
 */
export function convert(
  amountMinor: number,
  from: Currency,
  to: Currency,
  rate: Rate
): number {
  if (from === to) return amountMinor;
  if (!Number.isFinite(rate) || rate <= 0) return amountMinor;
  return from === 'USD' ? Math.round(amountMinor * rate) : Math.round(amountMinor / rate);
}

/** Converts a transaction amount to the target currency using its own rate when present. */
export function convertTransaction(
  tx: Transaction,
  to: Currency,
  referenceRate: Rate
): number {
  return convert(tx.amountMinor, tx.currency, to, resolveRate(tx, referenceRate));
}
