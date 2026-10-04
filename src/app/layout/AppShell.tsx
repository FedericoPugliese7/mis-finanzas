import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { m } from 'motion/react';
import { routeVariants } from '@/shared/motion';
import { formatLongDate, todayISO } from '@/shared/lib/dates';
import { useExchangeRate } from '@/shared/hooks/useExchangeRate';
import { useTheme } from '@/shared/hooks/useTheme';
import { Spinner } from '@/shared/ui/spinner';
import { ToastViewport } from '@/shared/ui/toast';
import { NavigationMenu, Brand } from '@/shared/ui/navigation-menu';
import { Segmented, type SegmentedOption } from '@/shared/ui/segmented';
import { usePreferencesStore } from '@/shared/stores/preferences.store';

const SECTION_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Movimientos',
  '/categories': 'Categorías',
  '/settings': 'Ajustes'
};

const DISPLAY_OPTIONS: readonly SegmentedOption<'ARS' | 'USD' | 'BOTH'>[] = [
  { value: 'ARS', label: '$' },
  { value: 'USD', label: 'US$' },
  { value: 'BOTH', label: 'Ambas' }
];

/**
 * Global layout: sticky header with navigation menu (desktop dropdown / mobile sheet).
 * Header always shows section title + today's long date + display currency selector (SPEC 4).
 */
export function AppShell() {
  useTheme();
  useExchangeRate();
  const location = useLocation();
  const sectionTitle = SECTION_TITLES[location.pathname] ?? 'Mis Finanzas';
  const longDate = formatLongDate(todayISO());
  const display = usePreferencesStore((state) => state.displayCurrency);
  const setDisplay = usePreferencesStore((state) => state.setDisplayCurrency);

  useEffect(() => {
    document.title = `${sectionTitle} · Mis Finanzas`;
  }, [sectionTitle]);

  const handleNavigate = (_to: string) => {
    // Navigation is handled by NavLink, this is for the dropdown menu
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-content"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur safe-top">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Brand />
            <NavigationMenu onNavigate={handleNavigate} />
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <label id="display-currency-label" className="sr-only">
                Moneda de visualización
              </label>
              <Segmented
                ariaLabel="Moneda de visualización"
                value={display}
                onChange={setDisplay}
                options={DISPLAY_OPTIONS}
              />
            </div>

            <div className="flex flex-col items-end gap-1 min-w-0 text-right">
              <h1 className="truncate text-sm font-semibold text-content">
                {sectionTitle}
              </h1>
              <p className="truncate text-xs text-content-secondary">{longDate}</p>
            </div>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-28 md:pb-10"
      >
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Spinner label="Cargando sección" />
            </div>
          }
        >
          <m.div
            variants={routeVariants}
            initial="initial"
            animate="animate"
            key={location.pathname}
          >
            <Outlet />
          </m.div>
        </Suspense>
      </main>

      <ToastViewport />
    </div>
  );
}
