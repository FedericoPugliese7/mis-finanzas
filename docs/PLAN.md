# PLAN — Mis Finanzas

Plan de implementación por fases. **Un commit por fase**, con Conventional Commits.
Al cerrar cada fase se corre `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`,
y se arregla lo que falle antes de seguir.

- Especificación funcional y técnica (incluidas las reglas de animación): [`SPEC.md`](./SPEC.md)
- Stack, estructura y convenciones de código: [`AGENTS.md`](../AGENTS.md)

---

## Regla transversal: animaciones

**Las reglas de `SPEC.md` → sección "Animaciones" se aplican a cada componente nuevo, desde ya.**
No se declara ningún número de animación (spring, duración, easing, offset) dentro de un componente:
todo se importa de `src/shared/motion.ts`. Cada componente animada se registra con el componente
`m` de `motion/react-m` dentro del `LazyMotion` de `src/app/providers.tsx`, respeta
`reducedMotion="user"` y anima solo `transform` y `opacity`.

---

## Fase 0 — Bootstrap ✅

- `git init -b main`, `.gitignore`
- `package.json` + instalación de dependencias
- TypeScript strict + `vite.config.ts` (Tailwind, PWA, Vitest)
- ESLint 9 flat + Prettier + `.editorconfig`
- `index.html` con script inline anti-parpadeo de tema
- Tokens de diseño en `src/styles/global.css` (`@theme inline`)
- Íconos PWA placeholder (`scripts/generate-icons.mjs`, sin dependencias)
- `AGENTS.md`

**Commit**: `chore: bootstrap vite, react, typescript, tailwind and tooling`

---

## Fase 1 — Núcleo: DB, dinero, fechas, agregaciones

- `src/shared/db/database.ts` — clase Dexie, tablas e índices (`date`, `categoryId`, `[type+date]`),
  seed de categorías por defecto en la primera apertura
- `src/shared/db/repos/` — `transactions.repo.ts`, `categories.repo.ts`, `settings.repo.ts`
- `src/shared/lib/money.ts` — parseo es-AR y formateo en enteros
- `src/shared/lib/currency.ts` — conversión con `exchangeRate` o cotización de referencia
- `src/shared/lib/dates.ts` — mes `YYYY-MM`, rangos, `date-fns` locale `es`
- `src/shared/lib/aggregations.ts` — totales del mes, por categoría, top, últimos 6 meses, balance
- `src/shared/lib/types.ts` + esquemas zod (`transaction`, `category`, `settings`, `backup`)
- Tests: `money`, `currency`, `dates`, `aggregations`

**Commit**: `feat(core): add dexie schema, repositories and pure money/aggregation logic`

---

## Fase 2 — Shell, router, tema y UI kit

- `src/app/router.tsx` — `HashRouter` + rutas con `React.lazy`
- `src/app/layout/AppShell.tsx` — sidebar ≥ 1024 px, tab bar < 768 px, safe-areas
- `src/shared/ui/` — `button`, `card`, `input`, `money-input`, `select`, `dialog`, `sheet`,
  `toast`, `switch`, `segmented`, `empty-state`, `month-selector`, `spinner`
- `src/shared/stores/` — Zustand (UI transitoria, tema, moneda)
- `src/shared/hooks/` — `useTheme` (`data-theme`, `color-scheme`, `theme-color`),
  `useIsDesktop`, `usePersistentStorage`
- Rutas placeholder de las 4 secciones
- Todas las componentes base se animan con los tokens compartidos

**Commit**: `feat(app): add hash router, responsive shell, theme system and ui kit`

---

## Fase 3 — Categorías

- `src/features/categories/` — page, form (RHF + zod), cards, selector de color e ícono
- `hooks/useCategories.ts` (`useLiveQuery`) y `hooks/use-category-actions.ts`
- Regla: si la categoría tiene movimientos, se **archiva** en vez de borrarse
- Test de la lógica de archivado

**Commit**: `feat(categories): add category management with archive-if-used rule`

---

## Fase 4 — Movimientos

- `src/features/transactions/` — page, form (`inputmode="decimal"`), lista agrupada por día,
  filtros (mes, tipo, categoría, moneda) y búsqueda
- Botón flotante en mobile; bottom sheet (Vaul) en mobile y modal en desktop
- Borrado con **deshacer** vía toast
- Smoke test del formulario

**Commit**: `feat(transactions): add list with filters, form and undoable delete`

---

## Fase 5 — Dashboard

- Selector de mes, tarjetas de resumen con selector ARS / USD / ambas
- Dona de gastos por categoría y barras de ingresos vs gastos de los últimos 6 meses (lazy)
- Top categorías y últimos movimientos
- Tabla/resumen accesible para cada gráfico
- Count suave en los números; gráficos animan solo en el primer montaje

**Commit**: `feat(dashboard): add monthly summary, donut, 6-month bars and top lists`

---

## Fase 6 — Ajustes + Backup

- `src/features/settings/` — tema, moneda de visualización, cotización de referencia
- `src/features/backup/` — export/import JSON (`schemaVersion`, zod, modos `merge` y `replace`),
  export CSV, borrado total con confirmación, carga de datos de ejemplo
- Test de validación de importación de backup

**Commit**: `feat(settings): add settings, json/csv backup and demo data`

---

## Fase 7 — PWA + pulido

- Manifest completo, precache offline, service worker
- Íconos 192/512/maskable definitivos
- Estados vacíos amables en todas las vistas
- Accesibilidad: foco visible, teclado, contraste AA, targets ≥ 44 px
- `navigator.storage.persist()`

**Commit**: `feat(pwa): add manifest, service worker and offline support`

---

## Fase 8 — Repo, docs y CI/CD

- `README.md` (qué es, cómo correrlo, scripts, arquitectura, **Decisiones**, roadmap)
- `LICENSE` MIT
- `.github/workflows/ci.yml` — lint, typecheck, test y build en push y PR
- `.github/workflows/deploy.yml` — build y publicación en GitHub Pages en push a `main`
  (`VITE_BASE=/mis-finanzas/`)
- Crear el repo remoto y pushear

**Commits**: `docs: add readme and license` + `ci: add github actions for lint/test/build and pages deploy`

---

## Fase 9 — Opcional (solo con todo lo anterior verde)

- Presupuestos por categoría con barra de progreso
- Movimientos recurrentes
- Cotización automática desde dolarapi.com (`/v1/dolares/blue`, usar `venta`), tolerante a fallos y
  nunca bloqueante

---

## Fase 10 — Pulido de animaciones ⏳

Revisión transversal de toda la app contra `SPEC.md` → "Animaciones":

- Barrido de componentes animados: confirmar que **ninguno** declara números sueltos y que todo
  sale de `src/shared/motion.ts`
- Confirmar que solo se animan `transform` y `opacity`; eliminar `width`/`height`/`top`/`left`
  animados y `will-change` innecesarios
- Ajustar springs/duraciones que generen jank en dispositivos de gama media (objetivo 60 fps)
- Unificar entrances/exits con `AnimatePresence` y `layout` en listas
- Verificar el fallback de `prefers-reduced-motion` en CSS y en cada componente
- Medir con Lighthouse y revisar Core Web Vitals

**Commit**: `refactor(animation): apply shared motion tokens across the app`
