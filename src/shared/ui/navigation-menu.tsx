import { NavLink } from 'react-router-dom';

import { m } from 'motion/react';
import { springs } from '@/shared/motion';

import { cn } from './utils';
import { NAV_ITEMS } from './nav-items';

/**
 * Desktop top navigation: real links (`aria-current="page"` on the active one)
 * with an accent underline that scales in from the left. Hidden below `lg`,
 * where the {@link TabBar} takes over.
 */
export function DesktopNav() {
  return (
    <nav aria-label="Secciones" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-11 items-center rounded-control px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-accent'
                    : 'text-content-secondary hover:bg-surface-hover hover:text-content'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive ? (
                    <m.span
                      aria-hidden
                      layoutId="desktop-nav-indicator"
                      transition={springs.ui}
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent"
                    />
                  ) : null}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Brand() {
  return (
    <span className="flex items-center gap-2 text-base font-semibold tracking-tight text-content">
      <svg
        aria-hidden
        className="h-8 w-8 shrink-0"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="64" height="64" rx="14" fill="#0c0c0a" />
        <circle cx="32" cy="32" r="26" stroke="#91ff16" strokeWidth="4" />
        <g stroke="#91ff16" strokeWidth="6" strokeLinecap="round">
          <path d="M32 14v36" />
          <path d="M32 22c-12 0-12 12 0 12s12 12 0 12" />
        </g>
      </svg>
      Mis Finanzas
    </span>
  );
}
