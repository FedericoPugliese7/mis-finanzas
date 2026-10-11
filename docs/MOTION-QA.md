# MOTION-QA — Checklist de calidad de animaciones

Revisión transversal de animaciones (Fase 10 + rediseño "Electric Lime & Dark Premium").
Cada fase cerró con `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` en verde.

## Tokens compartidos

- [x] `src/shared/motion.ts` es la única fuente de verdad: springs (`micro`, `snappy`, `ui`,
      `sheet`, `count`, `gentle`), easings (`ios`, `standard`, `exit`, `out`, `emphasized`),
      duraciones (incl. `popover`), variantes y CSS variables.
- [x] Regla `no-restricted-syntax` en `eslint.config.js` rechaza literales de animación fuera
      de `motion.ts`.
- [x] `chartPhaseDelay`: los gráficos esperan a que el count-up esté terminando.

## Reglas generales

- [x] Solo se animan `transform` y `opacity` (excepciones documentadas: `strokeDashoffset`
      de la dona SVG y `clip-path` del ripple de tema, ambos sin costo de layout).
- [x] `LazyMotion` + `m` en todos los componentes animados; `MotionConfig reducedMotion="user"`.
- [x] CSS `@media (prefers-reduced-motion: reduce)` anila transiciones y View Transitions;
      `prefers-reduced-transparency` degrada `.glass` a opaco.

## Identidad visual (Electric Lime)

- [x] Dark premium: fondo `#0c0c0a`, acento lima `#91FF16`, bordes con tinte lima.
- [x] Light accesible: acento legible `#4a7a00` (AA ≥ 5:1) para texto/bordes; lima puro solo
      en gradientes/glow.
- [x] `--gradient-content` (≈ negro) para íconos sobre gradientes de lima, en ambos temas.
- [x] Gradientes semánticos (`--income-gradient`, `--expense-gradient`) en barras y badges.
- [x] `.glass` en header, tab bar, cards del dashboard, drawer y toasts.
- [x] Glow del acento solo en interacción (focus-visible, hover de barras, FAB).

## Coreografía (un protagonista por vez)

- [x] Estructura (stagger 30 ms) → números (spring `count`) → gráficos (`chartPhaseDelay`).
- [x] `useChartEntrance` / `useListEntrance` con flag de sesión: nunca re-animan tras la
      primera ventana.
- [x] `AnimatePresence mode="wait"` envuelve al `Suspense` en `AppShell` (el exit de la ruta
      anterior nunca lo corta el fallback).

## Delight

- [x] Dona: hover escala el arco + el centro muestra el detalle; tap → deep link a
      Movimientos (`location.state`).
- [x] Ripple de tema desde el último `pointerdown` (clip-path circular, receta Chrome).
- [x] Pulso del badge de balance cuando el signo cambia entre meses.
- [x] FAB: ícono Plus → X (rotación 45° con `snappy`), glow y `aria-expanded`.
- [x] Toasts con barra de progreso pausable (CSS `toast-progress` + clase `toast-paused`).
- [x] Empty states con ícono en círculo y respiración (anulada por reduced-motion).

## Bugs corregidos en esta pasada

- [x] Solapamiento título/leyenda/labels en el gráfico de barras (plot `top-10`, labels
      dentro de barras altas, tick superior clampleado, apilado cuando ambos labels chocan).
- [x] `top-categories` ya no anima `width`: usa `scaleX` con `origin-left`.

## Verificación pendiente (manual)

1. Lighthouse Performance mobile con ~500 movimientos (Fase 8).
2. iOS Safari: drag del drawer de Vaul a 60 fps.
3. Capturas dark/light con datos altos para confirmar el fix de barras.
