import { DollarSign, Monitor, Moon, Sun } from 'lucide-react';
import type { DisplayCurrency, Settings, Theme } from '@/shared/lib/types';
import { usePreferencesStore } from '@/shared/stores/preferences.store';
import { useThemeStore } from '@/shared/stores/theme.store';
import { Card } from '@/shared/ui/card';
import { Segmented, type SegmentedOption } from '@/shared/ui/segmented';

interface AppearanceSectionProps {
  onUpdate: (patch: Partial<Settings>) => Promise<unknown>;
}

const THEME_OPTIONS: readonly SegmentedOption<Theme>[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor }
];

const CURRENCY_OPTIONS: readonly SegmentedOption<DisplayCurrency>[] = [
  { value: 'ARS', label: 'Pesos (ARS)' },
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'BOTH', label: 'Ambas (ARS + USD)', icon: DollarSign }
];

export function AppearanceSection({ onUpdate }: AppearanceSectionProps) {
  const theme = useThemeStore((state) => state.theme);
  const displayCurrency = usePreferencesStore((state) => state.displayCurrency);

  const handleThemeChange = (nextTheme: Theme) => {
    void onUpdate({ theme: nextTheme });
  };

  const handleCurrencyChange = (nextCurrency: DisplayCurrency) => {
    void onUpdate({ displayCurrency: nextCurrency });
  };

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-content">Apariencia y Moneda</h2>
      <p className="mt-1 text-sm text-content-secondary">
        Personalizá el tema visual de la aplicación y la moneda predeterminada de lectura.
      </p>

      <div className="mt-5 space-y-6">
        <div>
          <label
            id="theme-selection-label"
            className="block text-sm font-medium text-content"
          >
            Tema visual
          </label>
          <Segmented
            ariaLabel="Seleccionar tema visual"
            value={theme}
            onChange={handleThemeChange}
            options={THEME_OPTIONS}
            className="mt-2 w-full sm:w-auto"
          />
        </div>

        <div className="border-t border-border-subtle pt-5">
          <label
            id="currency-selection-label"
            className="block text-sm font-medium text-content"
          >
            Moneda de visualización
          </label>
          <p className="mt-0.5 text-xs text-content-muted">
            Los resúmenes y gráficos convertirán tus saldos a esta moneda según la
            cotización de referencia.
          </p>
          <Segmented
            controlId="display-currency"
            ariaLabel="Seleccionar moneda de visualización"
            value={displayCurrency}
            onChange={handleCurrencyChange}
            options={CURRENCY_OPTIONS}
            className="mt-2 w-full sm:w-auto"
          />
        </div>
      </div>
    </Card>
  );
}
