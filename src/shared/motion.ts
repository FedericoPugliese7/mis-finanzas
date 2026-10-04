/**
 * Tokens y variantes de animación compartidos de la app.
 *
 * REGLA: ningún componente define números de animación sueltos.
 * Todo spring, duration, easing y variant sale de este módulo
 * (ver `docs/SPEC.md` → sección "Animaciones").
 */
import type { Transition, Variants } from 'motion/react';

/* -------------------------------------------------------------------------- */
/*                                   Easings                                   */
/* -------------------------------------------------------------------------- */

/** Curva tipo iOS: rápida al salir, suave al frenar. La de referencia del proyecto. */
export type BezierCurve = [number, number, number, number];

export const easings = {
  /** Curva estándar de UI iOS (usada en sheets y drawers). */
  ios: [0.32, 0.72, 0, 1] as BezierCurve,
  /** Curva neutra para entradas y salidas cortas. */
  standard: [0.4, 0, 0.2, 1] as BezierCurve,
  /** Salida acelerada (elementos que se van). */
  exit: [0.4, 0, 1, 1] as BezierCurve,
  /** Desaceleración suave, ideal para gráficos. */
  out: [0.16, 1, 0.3, 1] as BezierCurve
} satisfies Record<string, BezierCurve>;

/** Easings listos para CSS (`transition`, `@keyframes`, View Transitions API). */
export const easingsCss = {
  ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0.16, 1, 0.3, 1)'
} satisfies Record<keyof typeof easings, string>;

/* -------------------------------------------------------------------------- */
/*                                   Springs                                   */
/* -------------------------------------------------------------------------- */

/**
 * Springs de UI: stiffness 260-400, damping ~30 (sin rebote notorio).
 * La velocidad de un spring se define con stiffness/damping, no con duration.
 */
export const springs = {
  /** Feedback de presión (botones, tarjetas). Rápido y contenido. */
  micro: { type: 'spring', stiffness: 500, damping: 34, mass: 0.6 },
  /** Transiciones de UI everyday (toasts, inline expands). */
  ui: { type: 'spring', stiffness: 360, damping: 30, mass: 0.9 },
  /** Sheets y drawers: equivalente suave al cubic-bezier iOS (~400 ms). */
  sheet: { type: 'spring', stiffness: 340, damping: 34, mass: 1 },
  /** Entradas grandes (página, modal): algo más pesado y calmado. */
  gentle: { type: 'spring', stiffness: 260, damping: 28, mass: 1 }
} satisfies Record<string, Transition>;

/* -------------------------------------------------------------------------- */
/*                                  Duraciones                                 */
/* -------------------------------------------------------------------------- */

/** Duraciones en segundos (unidad de Motion). */
export const durations = {
  /** Micro-interacciones (hover, foco, toggle): 150-250 ms. */
  micro: 0.18,
  microFast: 0.15,
  /** Entrada de elementos: fade + desplazamiento corto. */
  enter: 0.24,
  /** Salida de elementos. */
  exit: 0.18,
  /** Cambio de ruta. */
  route: 0.2,
  /** Cambio de tema (View Transitions API / CSS). */
  theme: 0.2,
  /** Contadores numéricos del dashboard. */
  count: 0.6,
  /** Gráficos de Recharts (solo primer montaje): 600-800 ms. */
  chart: 0.7,
  /** Stagger entre ítems de lista. */
  stagger: 0.03
} as const;

const MS_PER_SECOND = 1000;

/** Durations in milliseconds, for consumption from CSS. */
export const durationsMs = {
  micro: durations.micro * MS_PER_SECOND,
  microFast: durations.microFast * MS_PER_SECOND,
  enter: durations.enter * MS_PER_SECOND,
  exit: durations.exit * MS_PER_SECOND,
  route: durations.route * MS_PER_SECOND,
  theme: durations.theme * MS_PER_SECOND,
  chart: durations.chart * MS_PER_SECOND
} satisfies Record<string, number>;

/* -------------------------------------------------------------------------- */
/*                                Transitions                                 */
/* -------------------------------------------------------------------------- */

export const transitions = {
  micro: { duration: durations.micro, ease: easings.standard },
  microFast: { duration: durations.microFast, ease: easings.standard },
  enter: { duration: durations.enter, ease: easings.out },
  exit: { duration: durations.exit, ease: easings.exit },
  route: { duration: durations.route, ease: easings.standard },
  /** Contadores: counts cortos y legibles. */
  count: { duration: durations.count, ease: easings.ios },
  /** Gráficos: ease-out, una sola vez. */
  chart: { duration: durations.chart, ease: easings.out },
  /** Stagger de listas. */
  stagger: { staggerChildren: durations.stagger, delayChildren: 0.04 }
} satisfies Record<string, Transition>;

/* -------------------------------------------------------------------------- */
/*                                  Variantes                                  */
/* -------------------------------------------------------------------------- */

/** Entrada/salida genérica (fade + desplazamiento corto, 12 px). */
export const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transitions.enter },
  exit: { opacity: 0, y: -8, transition: transitions.exit }
};

/** Fade simple: usado cuando no hay desplazamiento (ojos de caja, placeholders). */
export const fadeOnlyVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.enter },
  exit: { opacity: 0, transition: transitions.exit }
};

/** Contenedor de listas: orquestador del stagger. */
export const listContainerVariants: Variants = {
  hidden: {},
  visible: { transition: transitions.stagger }
};

/** Ítem de lista: entra con fade + 8 px, sale corto. `layout` para reordenamiento. */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: springs.ui },
  exit: { opacity: 0, y: -8, transition: transitions.exit }
};

/** Transición entre rutas: sutil, sin bloquear la navegación. */
export const routeVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: transitions.route },
  exit: { opacity: 0, y: -8, transition: transitions.exit }
};

/** Dialogs y modales: contenedor y panel. */
export const dialogOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.micro },
  exit: { opacity: 0, transition: transitions.exit }
};

export const dialogContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: springs.ui },
  exit: { opacity: 0, scale: 0.98, y: 8, transition: transitions.exit }
};

/** Bottom sheet de mobile: sube desde abajo con el spring de sheet. */
export const sheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: springs.sheet },
  exit: { y: '100%', transition: { duration: durations.exit, ease: easings.exit } }
};

/** Toasts: entran desde arriba con desplazamiento corto. */
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: springs.ui },
  exit: { opacity: 0, y: -12, transition: transitions.exit }
};

/** Tappable elements press feedback: scale 0.97 with a smooth spring return. */
const pressableTap = { scale: 0.97 } as const;
const pressableWhileHover = { scale: 1.015 } as const;

/** Press feedback for tappable elements (buttons, cards): scale 0.97. */
export const presses = {
  tap: pressableTap,
  hover: pressableWhileHover
} as const;

/** Stagger container for dashboard cards and grouped sections. */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: durations.stagger, delayChildren: 0.05 } }
};
