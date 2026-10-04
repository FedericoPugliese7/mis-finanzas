import { useState } from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown, LayoutDashboard, Settings, Tags, Wallet } from 'lucide-react';

import { cn } from './utils';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  end?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Movimientos', icon: Wallet },
  { to: '/categories', label: 'Categorías', icon: Tags },
  { to: '/settings', label: 'Ajustes', icon: Settings }
];

function NavLinkItem({
  item,
  isActive,
  onSelect,
  isDesktop
}: {
  item: NavItem;
  isActive: boolean;
  onSelect: (to: string) => void;
  isDesktop: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Item>
      <NavigationMenuPrimitive.Trigger
        onClick={() => onSelect(item.to)}
        className={cn(
          'relative flex items-center gap-2 rounded-control font-medium transition-colors',
          isDesktop ? 'px-3 py-2 text-sm' : 'w-full justify-start px-3 py-2.5 text-base',
          isActive
            ? 'bg-accent-soft text-accent'
            : 'text-content-secondary hover:bg-surface-hover hover:text-content'
        )}
      >
        <item.icon size={isDesktop ? 18 : 20} aria-hidden />
        <span>{item.label}</span>
        {isDesktop && !item.end && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent transition-all duration-200" />
        )}
      </NavigationMenuPrimitive.Trigger>
    </NavigationMenuPrimitive.Item>
  );
}

function NavContent({ onClose, isDesktop }: { onClose: () => void; isDesktop: boolean }) {
  if (isDesktop) return null;

  return (
    <NavigationMenuPrimitive.Content className="fixed inset-0 z-50" forceMount>
      <NavigationMenuPrimitive.Viewport className="h-full">
        <div className="flex h-full flex-col bg-surface">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
            {NAV_ITEMS.map((item) => (
              <NavLinkItem
                key={item.to}
                item={item}
                isActive={false}
                onSelect={() => {
                  onClose();
                }}
                isDesktop={false}
              />
            ))}
          </div>
        </div>
      </NavigationMenuPrimitive.Viewport>
    </NavigationMenuPrimitive.Content>
  );
}

export function NavigationMenu({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const isDesktop = useIsDesktop();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (to: string) => {
    onNavigate?.(to);
    setIsOpen(false);
  };

  return (
    <NavigationMenuPrimitive.Root>
      <NavigationMenuPrimitive.List
        className={cn('flex items-center gap-1', isDesktop ? 'bg-transparent' : 'hidden')}
      >
        {NAV_ITEMS.map((item) => (
          <NavLinkItem
            key={item.to}
            item={item}
            isActive={false}
            onSelect={handleSelect}
            isDesktop={true}
          />
        ))}
      </NavigationMenuPrimitive.List>

      {!isDesktop && (
        <>
          <button
            type="button"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
            aria-controls="nav-menu"
            onClick={() => setIsOpen(!isOpen)}
            className="grid h-10 w-10 place-items-center rounded-control text-content-secondary transition-colors hover:bg-surface-hover hover:text-content lg:hidden"
          >
            {isOpen ? (
              <ChevronDown size={24} className="rotate-180" aria-hidden />
            ) : (
              <ChevronDown size={24} aria-hidden />
            )}
          </button>
          <NavContent onClose={() => setIsOpen(false)} isDesktop={false} />
        </>
      )}
    </NavigationMenuPrimitive.Root>
  );
}

export function Brand() {
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
