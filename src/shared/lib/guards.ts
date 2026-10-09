import type { DisplayCurrency, RateSource, Settings, Theme } from './types';

/**
 * Zod-free guards for boot-critical settings (SPEC keeps zod at the external
 * data boundary: backup, forms, DolarApi). Mirrors `SettingsSchema` — keep in
 * sync with `types.ts` if the schema changes.
 */

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isDisplayCurrency(value: unknown): value is DisplayCurrency {
  return value === 'ARS' || value === 'USD' || value === 'BOTH';
}

function isRateSource(value: unknown): value is RateSource {
  return value === 'manual' || value === 'dolarapi';
}

/**
 * Validates the four settings fields; any invalid/missing field falls back to
 * `fallback` for the whole object (same semantics as `SettingsSchema.safeParse`).
 * Unknown extra keys are stripped.
 */
export function toValidSettings(
  raw: Record<string, unknown>,
  fallback: Settings
): Settings {
  const { theme, displayCurrency, referenceRate, rateSource } = raw;
  if (!isTheme(theme)) return fallback;
  if (!isDisplayCurrency(displayCurrency)) return fallback;
  if (
    typeof referenceRate !== 'number' ||
    !Number.isFinite(referenceRate) ||
    referenceRate <= 0
  ) {
    return fallback;
  }
  if (!isRateSource(rateSource)) return fallback;
  return { theme, displayCurrency, referenceRate, rateSource };
}
