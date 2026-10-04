import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchOfficialRate,
  isRateStale,
  RATE_TTL_MS,
  referenceRateFor,
  RateFetchError
} from './dolarapi';

const VALID_PAYLOAD = {
  moneda: 'USD',
  casa: 'oficial',
  nombre: 'Oficial',
  compra: 1490,
  venta: 1540,
  fechaActualizacion: '2026-10-02T18:55:00.000Z'
};

function stubFetch(payload: () => Promise<unknown>): void {
  vi.stubGlobal('fetch', vi.fn(payload));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchOfficialRate', () => {
  it('parses a valid response into the typed rate', async () => {
    stubFetch(async () => ({ ok: true, status: 200, json: async () => VALID_PAYLOAD }));
    await expect(fetchOfficialRate()).resolves.toEqual({
      compra: 1490,
      venta: 1540,
      fechaActualizacion: '2026-10-02T18:55:00.000Z'
    });
  });

  it('rejects when the payload shape is invalid', async () => {
    stubFetch(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ venta: '1540' })
    }));
    await expect(fetchOfficialRate()).rejects.toThrow(RateFetchError);
    await expect(fetchOfficialRate()).rejects.toThrow('Respuesta inválida');
  });

  it('rejects non-positive rates (a zero rate would corrupt conversions)', async () => {
    stubFetch(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ ...VALID_PAYLOAD, venta: 0 })
    }));
    await expect(fetchOfficialRate()).rejects.toThrow(RateFetchError);
  });

  it('rejects with RateFetchError on HTTP errors', async () => {
    stubFetch(async () => ({ ok: false, status: 500, json: async () => ({}) }));
    await expect(fetchOfficialRate()).rejects.toThrow(RateFetchError);
    await expect(fetchOfficialRate()).rejects.toThrow('500');
  });

  it('propagates network failures', async () => {
    stubFetch(async () => {
      throw new TypeError('network down');
    });
    await expect(fetchOfficialRate()).rejects.toThrow('network down');
  });
});

describe('isRateStale (TTL 1 hour)', () => {
  it('is always stale without a previous fetch', () => {
    expect(isRateStale(null, 1_000, RATE_TTL_MS)).toBe(true);
  });

  it('is fresh before the TTL', () => {
    expect(isRateStale(0, RATE_TTL_MS - 1, RATE_TTL_MS)).toBe(false);
  });

  it('counts the exact TTL boundary as stale', () => {
    expect(isRateStale(0, RATE_TTL_MS, RATE_TTL_MS)).toBe(true);
  });

  it('is stale after the TTL', () => {
    expect(isRateStale(0, RATE_TTL_MS + 1, RATE_TTL_MS)).toBe(true);
  });
});

describe('referenceRateFor', () => {
  const rate = { compra: 1490, venta: 1540, fechaActualizacion: '2026-10-02' };

  it('uses venta when rateSource is dolarapi', () => {
    expect(referenceRateFor({ rateSource: 'dolarapi' }, rate)).toBe(1540);
  });

  it('keeps a manual reference rate untouched', () => {
    expect(referenceRateFor({ rateSource: 'manual' }, rate)).toBeNull();
  });
});
