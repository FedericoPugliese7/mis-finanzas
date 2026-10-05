import type { ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import { m } from 'motion/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { dialogContentVariants, dialogOverlayVariants } from '@/shared/motion';
import { cn } from './utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

/** Modal dialog: fade overlay + short spring content (shared motion tokens). */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal key="dialog" forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-50 bg-overlay"
                variants={dialogOverlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            </DialogPrimitive.Overlay>
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
              <DialogPrimitive.Content asChild forceMount>
                <m.div
                  className={cn(
                    'pointer-events-auto max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-card border border-border bg-surface p-6 shadow-elevated',
                    className
                  )}
                  variants={dialogContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <DialogPrimitive.Title className="text-lg font-semibold text-content">
                    {title}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-1 text-sm text-content-secondary">
                    {description ?? title}
                  </DialogPrimitive.Description>
                  <div className="mt-4">{children}</div>
                </m.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
