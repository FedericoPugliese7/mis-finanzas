import type { ReactNode, ComponentType } from 'react';
import { m } from 'motion/react';
import { fadeVariants } from '@/shared/motion';
import { cn } from './utils';

interface SectionHeaderProps {
  /** Lucide icon component */
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean; className?: string }>;
  /** Main section title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional action element (button, segmented control, etc.) */
  action?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Consistent section header across all pages:
 * - Accent bar on the left
 * - Icon + title + optional subtitle
 * - Optional action slot on the right
 * - Staggered entrance animation
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
        'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="relative shrink-0 grid h-10 w-10 place-items-center rounded-lg bg-accent-soft"
        >
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-accent rounded-r-full" />
          <Icon size={20} className="text-accent" aria-hidden />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-content">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-content-secondary">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <m.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.05 }}
          className="shrink-0"
        >
          {action}
        </m.div>
      )}
    </m.div>
  );
}
