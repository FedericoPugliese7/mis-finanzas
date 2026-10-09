# MOTION-QA — Checklist de calidad de animaciones

Este documento registra la revisión transversal de animaciones de la Fase 10.
Cada ítem se verificó con `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.

## Tokens compartidos

- [x] `src/shared/motion.ts` es la única fuente de verdad para springs, easings, duraciones y variants.
- [x] Regla `no-restricted-syntax` en `eslint.config.js` rechaza literales de animación fuera de `motion.ts`.
- [x] `MotionProvider` inyecta los valores como variables CSS para transiciones puras (`Switch`, View Transitions).

## Reglas generales

- [x] Solo se animan `transform` y `opacity` (excepción controlada: `strokeDashoffset` de SVG para la dona).
- [x] Ningún componente declara números de animación sueltos.
- [x] `LazyMotion` + `m` se usan en todos los componentes animados.
- [x] `MotionConfig reducedMotion="user"` respeta `prefers-reduced-motion`.
- [x] CSS `@media (prefers-reduced-motion: reduce)` anula transiciones y View Transitions.

## Componentes y secciones revisados

### Navegación

- [x] `AppShell`: `AnimatePresence mode="wait"` alrededor del `<Outlet>` con `routeVariants`.
- [x] `navigation-menu`: indicador activo con `layoutId="desktop-nav-indicator"`.
- [x] `tab-bar`: indicador activo con `layoutId="tab-bar-indicator"`.
- [x] `month-selector`: cambio de mes direccional (`enterFromLeft` / `enterFromRight`).

### Primitivas

- [x] `button`: `whileTap` con `presses.tap`.
- [x] `card`: `whileTap` opcional y transición de sombra vía CSS.
- [x] `switch`: transición con variables CSS `--motion-duration-micro` / `--motion-ease-standard`.
- [x] `segmented`: indicador compartido con `layoutId` y `controlId` para accesibilidad.

### Dashboard

- [x] `SummaryCards`: números animados con `AnimatedNumber` y `transitions.count`.
- [x] `category-donut`: sectores se dibujan con `strokeDashoffset` (solo primer montaje).
- [x] `monthly-bars`: barras crecen desde la base con `barGrowthVariants`.
- [x] `top-categories`: barras de progreso animan su ancho.
- [x] `latest-movements`: stagger con `listContainerVariants` / `listItemVariants`.
- [x] Stagger general corregido con `dashboardStaggerVariants`.

### Listas de movimientos

- [x] `transactions.page`: `AnimatePresence` + `layout` en grupos de día.
- [x] `transaction-row`: `exit` animation y `layout="position"`.
- [x] Toasts de "Deshacer" ya existentes con `toastVariants`.

### Temas

- [x] `use-theme-sync`: aplica `data-theme` y dispara View Transitions al cambiar.
- [x] Sin animación en la carga inicial (controlada por `index.html`).
- [x] Reduced-motion cae a cambio instantáneo.

### Estados de carga, vacío y error

- [x] `Spinner`: fade-in y reduced-motion detiene el giro.
- [x] `EmptyState`: fade-in con `fadeVariants`.
- [x] `ErrorState`: componente genérico animado.
- [x] `FormError`: mensajes de validación con fade-in/out.

## Métricas

- Tests: 119/119 pasan.
- Build: exitosa, 42 entries en precache.
- Lighthouse: pendiente de medición manual en dispositivo real / DevTools.

## Observaciones

- El spinner usa `useReducedMotion` de Motion, que depende de que `LazyMotion` esté montado.
  En la práctica el provider siempre está presente; si se reutilizara fuera del árbol,
  debería caer a `matchMedia` directo.
- El `strokeDashoffset` de la dona es una animación de atributo SVG; no afecta layout y
  respeta `prefers-reduced-motion` a través de `useChartEntrance`.
- Las barras de progreso de `TopCategories` usan `scaleX` (no `width`) para evitar layout
  thrashing.
- El stagger de listas de transacciones se limita al primer montaje mediante
  `useListEntrance`; los cambios de filtros no re-animan todas las filas.
- Los gráficos del dashboard usan stagger controlado por índice.

## Próximos pasos sugeridos

1. Medir Lighthouse Performance en mobile con 500 movimientos de ejemplo.
2. Revisar visualmente en iOS Safari que los sheets de Vaul mantengan 60 fps al arrastrar.
3. Considerar virtualización de la lista de movimientos si el scroll se trabara con > 300 ítems.
