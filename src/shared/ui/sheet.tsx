import type { ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { dialogOverlayVariants, sheetVariants } from '@/shared/motion';
import { Button } from './button';
import { cn } from './utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Bottom sheet (mobile-first form surface): rises with the shared sheet spring
 * and safe-area padding. Drag-to-close (Vaul) lands in Fase 4.
 */
export function Sheet({ open, onOpenChange, title, children, className }: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal key="sheet" forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-50 bg-content/40"
                variants={dialogOverlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            </DialogPrimitive.Overlay>
            <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-end">
              <DialogPrimitive.Content asChild forceMount>
                <m.div
                  className={cn(
                    'pointer-events-auto max-h-[85dvh] w-full overflow-y-auto rounded-t-card border-t border-border bg-surface px-4 pb-4 pt-3 safe-bottom shadow-elevated',
                    className
                  )}
                  variants={sheetVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <DialogPrimitive.Title className="text-base font-semibold text-content">
                      {title}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Close asChild>
                      <Button variant="ghost" size="icon" aria-label="Cerrar">
                        <X size={18} aria-hidden />
                      </Button>
                    </DialogPrimitive.Close>
                  </div>
                  <DialogPrimitive.Description className="sr-only">
                    {title}
                  </DialogPrimitive.Description>
                  {children}
                </m.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
