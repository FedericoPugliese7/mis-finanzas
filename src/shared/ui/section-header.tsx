import type { ReactNode, ComponentType } from 'react';
import { m } from 'motion/react';
import { fadeVariants } from '@/shared/motion';
import { cn } from './utils';

interface SectionHeaderProps {
  /** Lucide icon component */
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;
  /** Main section title (renders the page's `h1`) */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional action element (button, segmented control, etc.) */
  action?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * The page's single `h1`: plain accent icon + title + optional subtitle,
 * with the action aligned to the right. No decorative badges or bars —
 * hierarchy comes from typography alone.
 */
export function SectionHeader({
  icon,
  title,
  subtitle,
  action,
  className
}: SectionHeaderProps) {
  const Icon = icon;

  return (
    <m.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <Icon size={22} className="shrink-0 text-accent" aria-hidden />
          <h1 className="text-2xl font-semibold tracking-tight text-content">{title}</h1>
        </div>
        {subtitle && <p className="mt-1 text-sm text-content-secondary">{subtitle}</p>}
      </div>
      {action && (
        <m.div variants={fadeVariants} className="shrink-0">
          {action}
        </m.div>
      )}
    </m.div>
  );
}
