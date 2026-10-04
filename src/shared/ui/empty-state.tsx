import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { m } from 'motion/react';
import { fadeVariants } from '@/shared/motion';
import { cn } from './utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <m.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border bg-surface/60 px-6 py-12 text-center',
        className
      )}
    >
      {Icon ? (
        <span
          aria-hidden
          className="mb-1 grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent"
        >
          <Icon size={24} />
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-content">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-content-secondary">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </m.div>
  );
}
