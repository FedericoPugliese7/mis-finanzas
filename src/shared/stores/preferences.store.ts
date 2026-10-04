import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DisplayCurrency } from '@/shared/lib/types';

interface PreferencesState {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (displayCurrency: DisplayCurrency) => void;
}

/** Lightweight UI preferences (localStorage). Dexie settings are the backup source. */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      displayCurrency: 'ARS',
      setDisplayCurrency: (displayCurrency) => set({ displayCurrency })
    }),
    { name: 'mis-finanzas-prefs' }
  )
);
