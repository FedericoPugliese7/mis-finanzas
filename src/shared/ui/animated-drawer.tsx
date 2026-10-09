import type { ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Content, Drawer, Overlay, Portal, Root } from 'vaul';
import { dialogOverlayVariants } from '@/shared/motion';
import { cn } from './utils';

interface AnimatedDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/**
 * Vaul drawer wrapped with `AnimatePresence` so the overlay can animate in/out
 * with Motion tokens while Vaul keeps its native drag-to-close and rubber-band
 * behavior on the content.
 */
export function AnimatedDrawer({ open, onOpenChange, children }: AnimatedDrawerProps) {
  return (
    <AnimatePresence>
      {open ? (
        <Root open={open} onOpenChange={onOpenChange} key="drawer">
          <Portal>
            <Overlay asChild>
              <m.div
                className="fixed inset-0 z-50 bg-overlay"
                variants={dialogOverlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            </Overlay>
            {children}
          </Portal>
        </Root>
      ) : null}
    </AnimatePresence>
  );
}

interface AnimatedDrawerContentProps {
  children: ReactNode;
  className?: string;
}

/** Content surface: Vaul handles the drag/spring; we only style it. */
export function AnimatedDrawerContent({ children, className }: AnimatedDrawerContentProps) {
  return (
    <Content
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col overflow-y-auto rounded-t-card border border-border bg-surface p-6 safe-bottom',
        className
      )}
    >
      {children}
    </Content>
  );
}

export const AnimatedDrawerTitle = Drawer.Title;
export const AnimatedDrawerDescription = Drawer.Description;
export const AnimatedDrawerClose = Drawer.Close;
