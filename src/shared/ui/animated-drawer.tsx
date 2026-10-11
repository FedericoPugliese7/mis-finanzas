import type { ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Content, Drawer, Overlay, Portal, Root } from 'vaul';
import { dialogOverlayVariants, drawerContentVariants } from '@/shared/motion';
import { cn } from './utils';

interface AnimatedDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/**
 * Vaul drawer wrapped with `AnimatePresence` so the overlay can animate in/out
 * with Motion tokens while Vaul keeps its native drag-to-close and rubber-band
 * behavior on the content. The surface is glass (premium dark) and the inner
 * content is "presented" with a short fade after the panel starts sliding.
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

/** Content surface: Vaul handles the drag/spring; we style it as glass. */
export function AnimatedDrawerContent({ children, className }: AnimatedDrawerContentProps) {
  return (
    <Content
      className={cn(
        'glass fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col overflow-y-auto rounded-t-card p-6 safe-bottom',
        className
      )}
    >
      <m.div
        variants={drawerContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex min-h-0 flex-col"
      >
        {children}
      </m.div>
    </Content>
  );
}

export const AnimatedDrawerTitle = Drawer.Title;
export const AnimatedDrawerDescription = Drawer.Description;
export const AnimatedDrawerClose = Drawer.Close;
