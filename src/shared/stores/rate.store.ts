import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settingsRepo } from '@/shared/db/repos/settings.repo';
import {
  fetchOfficialRate,
  isRateStale,
  RATE_TTL_MS,
  referenceRateFor,
  type OfficialRate
} from '@/shared/lib/dolarapi';

export type RateStatus = 'idle' | 'loading' | 'success' | 'error';

interface RateState {
  status: RateStatus;
  /** Last known good rate (kept even when a later refresh fails). */
  rate: OfficialRate | null;
  lastFetched: number | null;
  error: string | null;
  refresh: () => Promise<void>;
  refreshIfStale: () => Promise<void>;
}

async function syncReferenceRate(rate: OfficialRate): Promise<void> {
  try {
    const settings = await settingsRepo.get();
    const next = referenceRateFor(settings, rate);
    if (next !== null && next !== settings.referenceRate) {
      await settingsRepo.update({ referenceRate: next });
    }
  } catch {
    /* la cotización para display no depende de poder escribir en la DB */
  }
}

/**
 * Exchange-rate state: hourly refresh of the official rate, loading/error
 * handling and optional sync to `Settings.referenceRate`. Never throws and
 * never blocks the UI. The last known rate survives offline/failed refreshes.
 */
export const useRateStore = create<RateState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      rate: null,
      lastFetched: null,
      error: null,

      refresh: async () => {
        if (get().status === 'loading') return;
        set({ status: 'loading' });
        try {
          const rate = await fetchOfficialRate();
          set({ rate, status: 'success', lastFetched: Date.now(), error: null });
          await syncReferenceRate(rate);
        } catch (error) {
          set({
            status: 'error',
            error:
              error instanceof Error ? error.message : 'No se pudo obtener la cotización'
          });
        }
      },

      refreshIfStale: async () => {
        const { lastFetched, status } = get();
        if (status === 'loading') return;
        if (!isRateStale(lastFetched, Date.now(), RATE_TTL_MS)) return;
        await get().refresh();
      }
    }),
    {
      name: 'mis-finanzas-rate',
      partialize: (state) => ({ rate: state.rate, lastFetched: state.lastFetched })
    }
  )
);
