import { LayoutDashboard, Settings, Tags, Wallet, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Exact match for the root path (`/` would otherwise match every route). */
  end?: boolean;
}

/** Single source of truth for the desktop nav and the mobile tab bar. */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Movimientos', icon: Wallet },
  { to: '/categories', label: 'Categorías', icon: Tags },
  { to: '/settings', label: 'Ajustes', icon: Settings }
];
