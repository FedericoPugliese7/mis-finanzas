import { m } from 'motion/react';
import { fadeVariants } from '@/shared/motion';

export default function App() {
  return (
    <m.main
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-dvh items-center justify-center p-4"
    >
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-content">
          Mis Finanzas
        </h1>
        <p className="mt-1 text-sm text-content-secondary">
          Control de ingresos y gastos en ARS y USD
        </p>
      </div>
    </m.main>
  );
}
