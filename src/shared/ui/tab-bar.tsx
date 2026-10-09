import { NavLink } from 'react-router-dom';
import { m } from 'motion/react';
import { springs } from '@/shared/motion';

import { cn } from './utils';
import { NAV_ITEMS } from './nav-items';

/**
 * Mobile bottom tab bar (< `lg`): the primary navigation on small screens.
 * Uses the `.material` chrome (translucent + blur, opaque under
 * `prefers-reduced-transparency`) and respects the iOS safe area.
 */
export function TabBar() {
  return (
    <nav
      aria-label="Secciones"
      className="material fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle safe-bottom lg:hidden"
    >
      <ul className="mx-auto flex w-full max-w-7xl items-stretch">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 pt-1.5 pb-1 text-[11px] font-medium transition-colors',
                  isActive ? 'text-accent' : 'text-content-muted'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <m.span
                      aria-hidden
                      layoutId="tab-bar-indicator"
                      transition={springs.ui}
                      className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-accent"
                    />
                  ) : null}
                  <item.icon size={20} aria-hidden />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
