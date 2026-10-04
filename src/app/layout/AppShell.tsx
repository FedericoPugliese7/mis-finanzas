import { Suspense, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowLeftRight,
  LayoutDashboard,
  Settings,
  Tags,
  Wallet,
  type LucideIcon
} from 'lucide-react';
import { m } from 'motion/react';
import { routeVariants } from '@/shared/motion';
import { formatLongDate, todayISO } from '@/shared/lib/dates';
import { useExchangeRate } from '@/shared/hooks/useExchangeRate';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';
import { useTheme } from '@/shared/hooks/useTheme';
import { Spinner } from '@/shared/ui/spinner';
import { ToastViewport } from '@/shared/ui/toast';
import { cn } from '@/shared/ui/utils';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Movimientos', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categorías', icon: Tags },
  { to: '/settings', label: 'Ajustes', icon: Settings }
];

const SECTION_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Movimientos',
  '/categories': 'Categorías',
  '/settings': 'Ajustes'
};

function Brand() {
  return (
    <span className="flex items-center gap-2 text-base font-semibold tracking-tight text-content">
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-content"
      >
        <Wallet size={18} />
      </span>
      Mis Finanzas
    </span>
  );
}

function navLinkClasses(isActive: boolean, isDesktop: boolean): string {
  return cn(
    'flex items-center gap-3 rounded-control font-medium transition-colors',
    isDesktop
      ? 'px-3 py-2.5 text-sm'
      : 'flex-col justify-center gap-0.5 px-1 py-2 text-[11px]',
    isActive
      ? isDesktop
        ? 'bg-accent-soft text-accent'
        : 'font-semibold text-accent'
      : isDesktop
        ? 'text-content-secondary hover:bg-surface-hover hover:text-content'
        : 'text-content-secondary'
  );
}

/**
 * Global layout: fixed sidebar on desktop (≥ 1024 px), tab bar below it.
 * The header always shows the section title plus today's long date (SPEC 4).
 */
export function AppShell() {
  useTheme();
  useExchangeRate();
  const isDesktop = useIsDesktop();
  const location = useLocation();
  const sectionTitle = SECTION_TITLES[location.pathname] ?? 'Mis Finanzas';
  const longDate = formatLongDate(todayISO());

  // Título del documento por ruta (WCAG 2.4.2): en una SPA no se recarga index.html.
  useEffect(() => {
    document.title = `${sectionTitle} · Mis Finanzas`;
  }, [sectionTitle]);

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-content"
      >
        Saltar al contenido
      </a>
      {isDesktop ? (
        <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface">
          <div className="px-4 py-5">
            <Brand />
          </div>
          <nav aria-label="Secciones" className="flex-1 space-y-1 px-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => navLinkClasses(isActive, true)}
              >
                <item.icon size={18} aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
      ) : null}

      <div className={cn('flex min-h-dvh flex-1 flex-col', isDesktop && 'ml-64')}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur safe-top">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3">
            {isDesktop ? null : <Brand />}
            <div
              className={cn('min-w-0', isDesktop ? 'ml-auto text-right' : 'text-right')}
            >
              <h1 className="truncate text-sm font-semibold text-content">
                {sectionTitle}
              </h1>
              <p className="truncate text-xs text-content-secondary">{longDate}</p>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28 md:pb-10"
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

        {isDesktop ? null : (
          <nav
            aria-label="Secciones"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur safe-bottom"
          >
            <ul className="mx-auto flex w-full max-w-md">
              {NAV_ITEMS.map((item) => (
                <li key={item.to} className="flex-1">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => navLinkClasses(isActive, false)}
                  >
                    <item.icon size={20} aria-hidden />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <ToastViewport />
      </div>
    </div>
  );
}
