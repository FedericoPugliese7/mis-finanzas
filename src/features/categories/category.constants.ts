import {
  Bus,
  Briefcase,
  Building2,
  CircleHelp,
  Coins,
  Coffee,
  Dumbbell,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  Lightbulb,
  PiggyBank,
  Plane,
  RefreshCw,
  ShoppingCart,
  Smartphone,
  Ticket,
  TrendingUp,
  Utensils,
  Wallet,
  type LucideIcon
} from 'lucide-react';

export interface ColorOption {
  value: string;
  label: string;
}

/** Preset palette covering every color used by the seed (SPEC 4.3). */
export const CATEGORY_COLORS: readonly ColorOption[] = [
  { value: '#6366f1', label: 'Índigo' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#a855f7', label: 'Púrpura' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#f43f5e', label: 'Rojo' },
  { value: '#f59e0b', label: 'Ámbar' },
  { value: '#eab308', label: 'Amarillo' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#10b981', label: 'Esmeralda' },
  { value: '#14b8a6', label: 'Turquesa' },
  { value: '#06b6d4', label: 'Cian' },
  { value: '#0ea5e9', label: 'Celeste' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#64748b', label: 'Gris' },
  { value: '#94a3b8', label: 'Gris claro' }
];

export interface IconOption {
  value: string;
  label: string;
  Icon: LucideIcon;
}

/** Preset icon catalog; `value` matches the strings stored in `Category.icon`. */
export const CATEGORY_ICONS: readonly IconOption[] = [
  { value: 'house', label: 'Casa', Icon: House },
  { value: 'building-2', label: 'Edificio', Icon: Building2 },
  { value: 'shopping-cart', label: 'Carrito', Icon: ShoppingCart },
  { value: 'utensils', label: 'Comida', Icon: Utensils },
  { value: 'bus', label: 'Colectivo', Icon: Bus },
  { value: 'plane', label: 'Viajes', Icon: Plane },
  { value: 'lightbulb', label: 'Luz', Icon: Lightbulb },
  { value: 'landmark', label: 'Banco', Icon: Landmark },
  { value: 'heart-pulse', label: 'Salud', Icon: HeartPulse },
  { value: 'ticket', label: 'Ocio', Icon: Ticket },
  { value: 'film', label: 'Cine', Icon: Film },
  { value: 'refresh-cw', label: 'Suscripción', Icon: RefreshCw },
  { value: 'graduation-cap', label: 'Educación', Icon: GraduationCap },
  { value: 'piggy-bank', label: 'Ahorro', Icon: PiggyBank },
  { value: 'trending-up', label: 'Inversiones', Icon: TrendingUp },
  { value: 'briefcase', label: 'Trabajo', Icon: Briefcase },
  { value: 'laptop', label: 'Notebook', Icon: Laptop },
  { value: 'smartphone', label: 'Celular', Icon: Smartphone },
  { value: 'coffee', label: 'Café', Icon: Coffee },
  { value: 'gift', label: 'Regalos', Icon: Gift },
  { value: 'dumbbell', label: 'Gimnasio', Icon: Dumbbell },
  { value: 'wallet', label: 'Billetera', Icon: Wallet },
  { value: 'coins', label: 'Plata', Icon: Coins },
  { value: 'circle-help', label: 'Otros', Icon: CircleHelp }
];

const ICON_BY_NAME = new Map<string, LucideIcon>(
  CATEGORY_ICONS.map((option) => [option.value, option.Icon])
);

/** Resolves a stored icon name, falling back to a neutral icon. */
export function iconFor(name: string): LucideIcon {
  return ICON_BY_NAME.get(name) ?? CircleHelp;
}
