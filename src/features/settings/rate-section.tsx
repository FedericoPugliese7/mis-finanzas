import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { Settings } from '@/shared/lib/types';
import { useRateStore } from '@/shared/stores/rate.store';
import { useUiStore } from '@/shared/stores/ui.store';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Switch } from '@/shared/ui/switch';

interface RateSectionProps {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => Promise<unknown>;
}

export function RateSection({ settings, onUpdate }: RateSectionProps) {
  const show = useUiStore((state) => state.show);
  const rateState = useRateStore();

  const isAutomatic = settings.rateSource === 'dolarapi';

  const [rawRateInput, setRawRateInput] = useState<string>(
    String(settings.referenceRate)
  );

  const handleSourceToggle = (checked: boolean) => {
    void onUpdate({ rateSource: checked ? 'dolarapi' : 'manual' });
  };

  const handleManualBlur = () => {
    const cleaned = rawRateInput.trim().replace(',', '.');
    const parsed = Number(cleaned);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      show({ message: 'Ingresá un valor numérico mayor a cero para la cotización.' });
      setRawRateInput(String(settings.referenceRate));
      return;
    }

    if (parsed !== settings.referenceRate) {
      void onUpdate({ referenceRate: parsed });
    }
  };

  const handleRefresh = async () => {
    await rateState.refresh();
  };

  const lastFetchedFormatted = rateState.lastFetched
    ? new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(rateState.lastFetched))
    : null;

  const currentRate = rateState.rate ?? settings.referenceRate;

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-content">
        Cotización de Referencia (ARS / USD)
      </h2>
      <p className="mt-1 text-sm text-content-secondary">
        Define la equivalencia para convertir movimientos entre pesos y dólares.
      </p>

      <div className="mt-5 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label id="auto-rate-label" className="text-sm font-medium text-content">
              Actualización automática
            </label>
            <p className="text-xs text-content-muted">
              Obtiene la cotización oficial del dólar desde DolarApi cada hora.
            </p>
          </div>
          <Switch
            aria-label="Actualización automática de cotización"
            checked={isAutomatic}
            onCheckedChange={handleSourceToggle}
          />
        </div>

        {isAutomatic ? (
          <div className="rounded-card border border-border bg-background-subtle p-3 text-xs text-content-secondary">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-content">
                  Valor actual: ${currentRate.toLocaleString('es-AR')} ARS / USD
                </span>
                {lastFetchedFormatted ? (
                  <p className="mt-0.5 text-content-muted">
                    Última actualización: {lastFetchedFormatted}
                  </p>
                ) : null}
                {rateState.error ? (
                  <p className="mt-0.5 font-medium text-danger">
                    Sin conexión ({rateState.error}); usando último valor conocido.
                  </p>
                ) : null}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                disabled={rateState.status === 'loading'}
              >
                <RefreshCw
                  size={14}
                  className={rateState.status === 'loading' ? 'animate-spin' : ''}
                  aria-hidden
                />
                Actualizar ahora
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor="manual-rate-input"
              className="block text-sm font-medium text-content"
            >
              Cotización manual (ARS por 1 USD)
            </label>
            <div className="mt-1.5 flex max-w-xs items-center gap-2">
              <span className="text-sm font-semibold text-content-muted">$</span>
              <Input
                id="manual-rate-input"
                type="text"
                inputMode="decimal"
                value={rawRateInput}
                onChange={(e) => setRawRateInput(e.target.value)}
                onBlur={handleManualBlur}
                placeholder="ej: 1540"
              />
            </div>
            <p className="mt-1 text-xs text-content-muted">
              Presioná fuera del campo para guardar.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
