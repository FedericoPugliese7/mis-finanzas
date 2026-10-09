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
  /**
   * Curva estándar de UI iOS (usada en sheets y drawers).
   * Para acelerar el inicio sin perder suavidad de llegada, subir el primer
   * valor (0.32 → 0.4). Para más suavidad al final, subir el segundo (0.72).
   */
  ios: [0.32, 0.72, 0, 1] as BezierCurve,
  /**
   * Curva neutra para entradas y salidas cortas.
   * Buen punto medio: salida rápida, llegada sin rebote.
   */
  standard: [0.4, 0, 0.2, 1] as BezierCurve,
  /**
   * Salida acelerada (elementos que se van).
   * Rápida de inicio a fin: el usuario no espera a que desaparezca algo.
   */
  exit: [0.4, 0, 1, 1] as BezierCurve,
  /**
   * Desaceleración suave, ideal para gráficos y contadores.
   * Para hacerla más relajada, acercar el segundo punto a (0.2, 1).
   */
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
 * Springs de UI: damping ratio alto (sin rebote notorio).
 * La velocidad de un spring se define con stiffness/damping, no con duration.
 *
 * Cómo ajustar la sensación:
 * - Más rápido: subir `stiffness` o bajar `mass`.
 * - Más lento: bajar `stiffness` o subir `mass`.
 * - Más suave (menos rebote): subir `damping`. Menos suave: bajar `damping`.
 */
export const springs = {
  /**
   * Feedback de presión (botones, tarjetas, FAB).
   * Rápido y contenido: la respuesta al toque debe sentirse en el primer frame.
   */
  micro: { type: 'spring', stiffness: 500, damping: 34, mass: 0.6 },
  /**
   * Transiciones de UI everyday (toasts, inline expands, indicadores).
   * Equilibrio entre rapidez y suavidad.
   */
  ui: { type: 'spring', stiffness: 360, damping: 30, mass: 0.9 },
  /**
   * Sheets y drawers: equivalente suave al cubic-bezier iOS (~400 ms).
   * Se usa para capas que se deslizan y que pueden ser interrumpidas.
   */
  sheet: { type: 'spring', stiffness: 340, damping: 34, mass: 1 },
  /**
   * Entradas grandes (página, modal) y valores numéricos (count-up).
   * Más pesado y calmado; no compite con el protagonista de la pantalla.
   */
  gentle: { type: 'spring', stiffness: 260, damping: 28, mass: 1 }
} satisfies Record<string, Transition>;

/* -------------------------------------------------------------------------- */
/*                                  Duraciones                                 */
/* -------------------------------------------------------------------------- */

/** Duraciones en segundos (unidad de Motion). */
export const durations = {
  /** Micro-interacciones (hover, foco, toggle): 150-250 ms. */
  micro: 0.18,
  /** Micro-interacciones muy cortas (indicadores, toggles). */
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
  /** Gráficos (solo primer montaje): 600-800 ms. */
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
  chart: durations.chart * MS_PER_SECOND,
  stagger: durations.stagger * MS_PER_SECOND
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

/**
 * Stagger acotado: usa el delayChildren justo para que los primeros ítems
 * visibles entren rápido sin superar ~300-400 ms en total.
 * Ajustar `staggerChildren` para listas grandes.
 */
export const tightStagger: Transition = {
  staggerChildren: durations.stagger,
  delayChildren: 0.02
};

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

/** Gráficos: fade puro en el primer montaje (SPEC 7.7), duración chart. */
export const chartVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.chart },
  exit: { opacity: 0, transition: transitions.exit }
};

/** Contenedor de listas: orquestador del stagger. */
export const listContainerVariants: Variants = {
  hidden: {},
  visible: { transition: transitions.stagger }
};

/**
 * Contenedor de listas acotado: para listas largas donde el stagger total
 * no debe superar ~300-400 ms.
 */
export const tightListContainerVariants: Variants = {
  hidden: {},
  visible: { transition: tightStagger }
};

/** Ítem de lista: entra con fade + 8 px, sale corto. Usar con prop `layout` en el consumidor. */
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

/** Toasts: entran desde arriba con desplazamiento corto. */
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: springs.ui },
  exit: { opacity: 0, y: -12, transition: transitions.exit }
};

/**
 * Barras de gráficos: crecen desde la base.
 * Acepta un `custom` number para escalonar el delay (índice * durations.stagger).
 * Aplicar a un `m.div` con `style={{ transformOrigin: 'bottom' }}`.
 */
export const barGrowthVariants: Variants = {
  hidden: { opacity: 0, scaleY: 0 },
  visible: (index = 0) => ({
    opacity: 1,
    scaleY: 1,
    transition: {
      duration: durations.chart,
      ease: easings.out,
      delay: index * durations.stagger
    }
  }),
  exit: { opacity: 0, scaleY: 0, transition: transitions.exit }
};

/**
 * Dona / path SVG: se dibuja con barrido.
 * Aplicar a un `m.path` o `m.circle` (vía `pathLength` o `strokeDashoffset`).
 */
export const pathSweepVariants: Variants = {
  hidden: { opacity: 0, pathLength: 0 },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: durations.chart, ease: easings.out }
  },
  exit: { opacity: 0, pathLength: 0, transition: transitions.exit }
};

/**
 * Cambio direccional del selector de mes.
 * Usar con `AnimatePresence mode="wait"`:
 * - Avanzar (mes nuevo > mes viejo): `initial="enterFromRight"`, `animate="settle"`, `exit="exitLeft"`.
 * - Retroceder (mes nuevo < mes viejo): `initial="enterFromLeft"`, `animate="settle"`, `exit="exitRight"`.
 */
export const monthChangeVariants: Variants = {
  enterFromLeft: { opacity: 0, x: -16 },
  enterFromRight: { opacity: 0, x: 16 },
  settle: { opacity: 1, x: 0, transition: transitions.microFast },
  exitLeft: { opacity: 0, x: -16, transition: transitions.microFast },
  exitRight: { opacity: 0, x: 16, transition: transitions.microFast }
};

/** Slide suave para indicadores de navegación (tab bar, sidebar). */
export const indicatorVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: springs.ui },
  exit: { opacity: 0, transition: transitions.exit }
};

/**
 * Press feedback para elementos tocables (botones, cards, FAB).
 * `tap` es el default. `hover` está reservado para casos aislados;
 * por regla del proyecto no se aplica a botones/cards por defecto.
 */
export const presses = {
  tap: { scale: 0.97 } as const,
  hover: { scale: 1.015 } as const
} as const;

/** Variantes pre-armadas para elementos pressables (tap + hover opcional). */
export const pressableVariants: Variants = {
  tap: presses.tap,
  hover: presses.hover
};

/** Stagger container for dashboard cards and grouped sections. */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: durations.stagger, delayChildren: 0.05 } }
};

/**
 * Stagger acotado para dashboards: entra más rápido para no competir con el
 * protagonista principal (count-up o gráfico).
 */
export const dashboardStaggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: durations.stagger, delayChildren: 0.02 } }
};

/* -------------------------------------------------------------------------- */
/*                           Tokens como CSS variables                         */
/* -------------------------------------------------------------------------- */

/**
 * Nombres de variables CSS que `MotionProvider` inyecta en `:root`.
 * Los componentes que usan transiciones CSS puras (Switch, View Transitions)
 * consumen estas variables para compartir la misma fuente de verdad.
 */
export const motionCssVarNames = {
  durationTheme: '--motion-duration-theme',
  durationEnter: '--motion-duration-enter',
  durationMicro: '--motion-duration-micro',
  durationStagger: '--motion-duration-stagger',
  easeIos: '--motion-ease-ios',
  easeStandard: '--motion-ease-standard'
} as const;

/**
 * Devuelve el set de propiedades CSS listo para inyectar con
 * `root.style.setProperty(...)` en `MotionProvider`.
 */
export function motionCssVars(): Record<string, string> {
  return {
    [motionCssVarNames.durationTheme]: `${durationsMs.theme}ms`,
    [motionCssVarNames.durationEnter]: `${durationsMs.enter}ms`,
    [motionCssVarNames.durationMicro]: `${durationsMs.micro}ms`,
    [motionCssVarNames.durationStagger]: `${durationsMs.stagger}ms`,
    [motionCssVarNames.easeIos]: easingsCss.ios,
    [motionCssVarNames.easeStandard]: easingsCss.standard
  };
}
