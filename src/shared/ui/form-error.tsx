import { m } from 'motion/react';
import { fadeOnlyVariants } from '@/shared/motion';

interface FormErrorProps {
  id?: string;
  children: React.ReactNode;
}

/**
 * Inline validation error that fades in and out (SPEC 7.8).
 * Used below form fields.
 */
export function FormError({ id, children }: FormErrorProps) {
  return (
    <m.p
      id={id}
      role="alert"
      variants={fadeOnlyVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-xs text-expense-content"
    >
      {children}
    </m.p>
  );
}
