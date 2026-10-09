import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { m } from 'motion/react';
import { fadeVariants } from '@/shared/motion';
import { cn } from './utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Generic error state with a subtle fade-in animation (SPEC 7.8).
 */
export function ErrorState({
  title = 'Algo salió mal',
  description = 'No pudimos cargar esta sección. Volvé a intentarlo.',
  action,
  icon: Icon = AlertCircle,
  className
}: ErrorStateProps) {
  return (
    <m.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center',
        className
      )}
    >
      <Icon size={26} className="mb-1 text-expense-content" aria-hidden />
      <h3 className="text-base font-semibold text-content">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-content-secondary">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </m.div>
  );
}
