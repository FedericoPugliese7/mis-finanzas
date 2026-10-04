import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRateStore } from './rate.store';

const RATE = {
  compra: 1490,
  venta: 1540,
  fechaActualizacion: '2026-10-02T18:55:00.000Z'
};

function stubFetchResponse(payload: unknown, ok = true, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, status, json: async () => payload }))
  );
}

beforeEach(() => {
  useRateStore.setState({ status: 'idle', rate: null, lastFetched: null, error: null });
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('rate store', () => {
  it('stores the rate on a successful refresh', async () => {
    stubFetchResponse(RATE);
    await useRateStore.getState().refresh();
    const state = useRateStore.getState();
    expect(state.status).toBe('success');
    expect(state.rate).toEqual(RATE);
    expect(state.lastFetched).not.toBeNull();
    expect(state.error).toBeNull();
  });

  it('keeps the last known rate and sets an error on failure', async () => {
    useRateStore.setState({ rate: RATE, lastFetched: 1 });
    stubFetchResponse({}, false, 500);
    await useRateStore.getState().refresh();
    const state = useRateStore.getState();
    expect(state.status).toBe('error');
    expect(state.rate).toEqual(RATE);
    expect(state.error).toContain('500');
  });

  it('does not fetch when the cached rate is fresh', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    useRateStore.setState({ status: 'success', rate: RATE, lastFetched: Date.now() });
    await useRateStore.getState().refreshIfStale();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches when the cached rate is stale', async () => {
    stubFetchResponse(RATE);
    useRateStore.setState({
      status: 'success',
      rate: null,
      lastFetched: Date.now() - (60 * 60 * 1000 + 1000)
    });
    await useRateStore.getState().refreshIfStale();
    const state = useRateStore.getState();
    expect(state.status).toBe('success');
    expect(state.rate).toEqual(RATE);
  });

  it('does not run overlapping refreshes', async () => {
    let resolveFetch: (value: unknown) => void = () => undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      )
    );
    const first = useRateStore.getState().refresh();
    const second = useRateStore.getState().refresh();
    expect(useRateStore.getState().status).toBe('loading');
    resolveFetch({ ok: false, status: 500, json: async () => ({}) });
    await Promise.all([first, second]);
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledTimes(1);
  });
});
