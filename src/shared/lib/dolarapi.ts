import { z } from 'zod';
import type { Settings } from './types';
import { RATE_TTL_MS } from './rate-config';

export const DOLARAPI_OFICIAL_URL = 'https://dolarapi.com/v1/dolares/oficial';

/** Minimum refresh interval: the rate is kept up to date at least hourly. */
export { RATE_TTL_MS };

export const OfficialRateSchema = z.object({
  compra: z.number().positive('Cotización de compra inválida'),
  venta: z.number().positive('Cotización de venta inválida'),
  fechaActualizacion: z.string().min(1, 'Fecha de actualización inválida')
});

/** Official (Banco Nación) rate via DolarApi. `venta`/`compra` are ARS per 1 USD. */
export type OfficialRate = z.infer<typeof OfficialRateSchema>;

export class RateFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateFetchError';
  }
}

/** Fetches and validates the official rate. Rejects on HTTP, network or schema errors. */
export async function fetchOfficialRate(): Promise<OfficialRate> {
  const response = await fetch(DOLARAPI_OFICIAL_URL, {
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) {
    throw new RateFetchError(`DolarApi responded with status ${response.status}`);
  }
  const payload: unknown = await response.json();
  // Frontera de datos externos: nunca confiamos en el JSON (safeParse, no parse).
  const parsed = OfficialRateSchema.safeParse(payload);
  if (!parsed.success) {
    throw new RateFetchError('Respuesta inválida de DolarApi');
  }
  return parsed.data;
}

/**
 * Whether the cached rate must be refreshed.
 * Exact TTL boundary counts as stale (`>=`), `null` is always stale.
 */
export function isRateStale(
  lastFetched: number | null,
  now: number,
  ttlMs: number = RATE_TTL_MS
): boolean {
  if (lastFetched === null) return true;
  return now - lastFetched >= ttlMs;
}

/**
 * Pure decision: when should a fetched rate update `Settings.referenceRate`?
 * Returns the new rate or `null` to keep the current one untouched.
 */
export function referenceRateFor(
  settings: Pick<Settings, 'rateSource'>,
  rate: OfficialRate
): number | null {
  return settings.rateSource === 'dolarapi' ? rate.venta : null;
}
