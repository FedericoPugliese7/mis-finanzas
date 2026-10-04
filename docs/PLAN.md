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
todo se importa de `src/shared/motion.ts`. Cada componente animado se registra con el componente
`m` de `motion/react` dentro del `LazyMotion` de `src/app/providers.tsx`, respeta
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

## Fase 1 — Núcleo: DB, dinero, fechas, agregaciones ✅

- `src/shared/db/database.ts` — clase Dexie, tablas e índices (`date`, `categoryId`, `[type+date]`),
  seed de categorías por defecto en la primera apertura
- `src/shared/db/repos/` — `transactions.repo.ts`, `categories.repo.ts`, `settings.repo.ts`
- `src/shared/lib/money.ts` — parseo es-AR y formateo en enteros
- `src/shared/lib/currency.ts` — conversión con `exchangeRate` o cotización de referencia
- `src/shared/lib/dates.ts` — mes `YYYY-MM`, rangos, `date-fns` locale `es`
- `src/shared/lib/aggregations.ts` — totales del mes, por categoría, top, últimos 6 meses, balance
- `src/shared/lib/types.ts` + esquemas zod (`transaction`, `category`, `settings`, `backup`)

**Casos de test de la fase (todos obligatorios)**

| #   | Caso                                                       | Ejemplo / criterio                                                                                         |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | **Parseo de montos es-AR**                                 | `"1.234,56"` → `123456` centavos. Cubrir también `"1.234"`, `"0,05"`, `"12"`, espacios y miles con punto   |
| 2   | **Formateo de montos**                                     | `123456` → `"1.234,56"`; importes negativos, valores grandes y ambos símbolos (`$`, `US$`)                 |
| 3   | **Conversión USD → ARS con `exchangeRate` del movimiento** | USD 10 con `exchangeRate: 1500` → ARS `1500000` centavos (usa la tasa del movimiento, no la de referencia) |
| 4   | **Conversión con fallback a la cotización de referencia**  | USD 10 sin `exchangeRate` → usa `Settings.referenceRate`                                                   |
| 5   | **Conversión ARS → USD**                                   | ARS 1500000 centavos con tasa 1500 → USD `1000` centavos (ver decisión 3)                                  |
| 6   | **Totales por mes**                                        | Suma de ingresos, gastos y balance de un mes `YYYY-MM`, ignorando movimientos de otros meses               |
| 7   | **Totales por categoría**                                  | Agrupación por `categoryId` con su nombre, color y total; orden descendente y categorías sin uso           |
| 8   | **Balance con monedas mezcladas**                          | Ingresos y gastos en ARS y USD juntos, normalizados a una sola moneda de visualización (ARS, USD o ambas)  |

Además: `dates` (mes `YYYY-MM`, cambio de mes, años bisiestos) y `money` (redondeo entero, sin
acumulación en floats).

**Verificación**: `npm run lint`, `npm run typecheck`, `npm run format`, `npm run test`
(6 archivos, 51 tests) y `npm run build` en verde.

**Decisiones de la fase**

1. **Parseo es-AR**: coma sola = siempre separador decimal (`0,05` → 5, `12,345` → 1235);
   punto solo = agrupador de miles si matchea `^\d{1,3}(\.\d{3})+$` (`1.234` → `123400`),
   si no decimal (`12,5` → 1250); con ambos separadores, el último es el decimal
   (`1.234,56` y `1,234.56` se aceptan). Espacios (incl. NBSP) y símbolos se ignoran.
   Decimales extra se redondean half-up al centavo; si no parsea → `null`.
2. **Formateo**: matemática entera; la parte entera se agrupa con
   `Intl.NumberFormat('es-AR')` y la fracción de 2 dígitos se anexa (evita artefactos de
   float en montos grandes). Signo antes del símbolo: `-$ 1.234,56`.
3. **Corrección del ejemplo de la tabla (fila 5)**: ARS `1500000` centavos ÷ 1500 =
   `1000` centavos USD (10 USD), no `10000`. El valor original tenía un error aritmético;
   el código y el test usan `1000`.
4. **Conversión**: la tasa siempre es ARS por 1 USD. Si la tasa no es finita y positiva,
   `convert` devuelve el monto sin convertir (nunca fabrica una conversión ni bloquea).
5. **Agregaciones**: `totalsByCategory` incluye categorías sin uso con `total: 0`, ordena
   por total descendente y empata por nombre (locale `es`); filtra por tipo
   (`'expense'` por defecto, para la dona de gastos). `totalsForDisplay` devuelve solo las
   monedas pedidas (`BOTH` → `{ ARS, USD }`).
6. **Seed de la DB**: categorías y settings se cargan en `db.on('populate')` (solo en la
   primera creación del IndexedDB). Los ids de las categorías default son strings
   estables (`expense-alquiler`, `income-sueldo`, …) para que el seed sea idempotente y
   los imports se puedan deduplicar por id.
7. **Índices**: `archived` (boolean) **no** se indexa — IndexedDB no acepta booleans como
   claves. Se filtra en memoria en `categoriesRepo.getActive()` (la tabla es chica).
8. **Settings**: fila única con id `'general'` en la tabla `settings`. Defaults:
   `theme: 'system'`, `displayCurrency: 'ARS'`, `referenceRate: 1000`,
   `rateSource: 'manual'`.
9. **Tests**: solo funciones puras en esta fase (los 8 casos obligatorios + `dates` +
   `money`). Los repositorios no se testean todavía porque requieren `fake-indexeddb`
   (dependencia nueva, sin justificación en `README.md`); se evalúa en la fase de tests
   de integración si hace falta.

**Commit**: `feat(core): add dexie schema, repositories and pure money/aggregation logic`

---

## Fase 2 — Shell, router, tema y UI kit ✅

- `src/app/router.tsx` — `HashRouter` + rutas con `React.lazy`
- `src/app/layout/AppShell.tsx` — sidebar ≥ 1024 px, tab bar < 1024 px, safe-areas
- `src/shared/ui/` — `button`, `card`, `input`, `money-input`, `select`, `dialog`, `sheet`,
  `toast`, `switch`, `segmented`, `empty-state`, `month-selector`, `spinner`
- `src/shared/stores/` — Zustand (UI transitoria, tema, moneda)
- `src/shared/hooks/` — `useTheme` (`data-theme`, `color-scheme`, `theme-color`),
  `useIsDesktop`, `usePersistentStorage`
- **Fecha actual visible en el header** (sidebar desktop / header mobile) con el helper
  `formatLongDate` (`"Domingo 4 de octubre de 2026"`, locale `es`) agregado a `dates.ts`
- Rutas placeholder de las 4 secciones
- Todos los componentes base se animan con los tokens compartidos

**Verificación**: `npm run lint`, `npm run typecheck`, `npm run format`, `npm run test`
(7 archivos, 54 tests) y `npm run build` en verde (4 chunks lazy por ruta).

**Decisiones de la fase**

1. **Breakpoint**: la tab bar se muestra hasta `< 1024 px` (no `< 768 px`): cubre el hueco
   768-1023 px del spec, donde todavía no hay sidebar. `useIsDesktop` = `min-width: 1024px`.
2. **Tema**: clave `mis-finanzas-theme` con formato JSON plano, idéntica al script inline de
   `index.html` (no el formato `persist` de Zustand) para no romper el anti-parpadeo.
   `applyTheme` es no-op si el tema ya está aplicado → nunca dispara View Transitions en la
   carga inicial, tampoco bajo `StrictMode`.
3. **Moneda de visualización**: Zustand `persist` en `mis-finanzas-prefs` (localStorage).
   La fila de Dexie settings sigue siendo la fuente que viaja en el backup; se alinean en
   la Fase 6.
4. **Switch**: accesible (`role="switch"`) y construido a mano — `@radix-ui/react-switch`
   no está instalado y AGENTS.md prohíbe dependencias sin justificación. El thumb se mueve
   con transición CSS alimentada por las variables de Motion.
5. **Sheet**: Radix Dialog + spring compartido por ahora; el drag-to-close con **Vaul**
   queda para la Fase 4 (decisión prevista en SPEC 7.4).
6. **Tipos**: los eventos DOM de React (drag/animation) chocan con los homónimos de Motion;
   `Button` y `Card` los `Omit` en sus props nativas.
7. **Tests**: `src/test/setup.ts` agrega un polyfill de `matchMedia` para jsdom
   (queries `min-width` se resuelven contra `window.innerWidth`, que arranca en 1024 px →
   el shell de desktop renderiza en tests).
8. **Toasts**: store Zustand + `ToastViewport` montado en el shell; `useToast()` queda
   lista para el deshacer de la Fase 4.

**Commit**: `feat(app): add hash router, responsive shell, theme system and ui kit`

---

## Fase 2b — CI ✅

El repo remoto ya existe (`FedericoPugliese7/mis-finanzas`): **no volver a crearlo**.

- `.github/workflows/ci.yml` — `lint`, `typecheck`, `test` y `build` en cada push y en cada PR
- Node 24 en el runner, cache de `npm` y `npm ci`
- El pipeline queda en verde **antes** de seguir con la Fase 3, para no arrastrar errores

**Verificación**: `npm run format` y `npm run lint` en verde con el workflow agregado;
localmente los mismos 4 comandos del pipeline (`lint`, `typecheck`, `test`, `build`)
en verde.

**Decisiones de la fase**

1. Un solo runner (`ubuntu-latest`), pasos secuenciales en el orden del gate;
   `build` ya ejecuta `typecheck` internamente (se repite ~10 s a cambio de mantener
   los 4 comandos explícitos del plan).
2. `node-version: 24` (misma major que en local) y `cache: npm` sobre `package-lock.json`.
3. **Pipeline verificado**: push de `main` y run #1 del workflow en verde
   (`conclusion: success`; Checkout → Setup Node → npm ci → Lint → Typecheck →
   Test → Build, todos `success`) antes de arrancar la Fase 3.

**Commit**: `ci: add github actions workflow for lint, typecheck, test and build`

---

## Fase 3 — Categorías ✅

- `src/features/categories/` — page, form (RHF + zod), cards, selector de color e ícono
- `hooks/useCategories.ts` (`useLiveQuery`) y `hooks/use-category-actions.ts`
- Regla: si la categoría tiene movimientos, se **archiva** en vez de borrarse
- Test de la lógica de archivado

**Verificación**: `npm run lint`, `npm run typecheck`, `npm run format`, `npm run test`
(11 archivos, 78 tests) y `npm run build` en verde.

**Decisiones de la fase**

1. **Regla de archivado**: `remove(category)` consulta `hasTransactions` — con movimientos
   archiva y avisa `«X» tiene movimientos: se archivó en vez de borrarla` (retorna
   `'archived'`); sin movimientos borra y avisa `'deleted'`. La UI siempre muestra un
   diálogo de confirmación previo que explica ambas salidas.
2. **Tipo inmutable al editar**: `type` solo se elige al crear (las transacciones guardan
   su propio `type`; cambiarlo después rompería la coherencia categoría ↔ movimiento). El
   form muestra un badge estático en modo edición.
3. **Archivar manual con Deshacer**: `archive()` aprovecha `ToastAction` de la Fase 2
   (`Deshacer` → `unarchive`); `remove()` con la regla **no** ofrece deshacer (fue un
   intento de borrado). `unarchive` → toast «restaurada».
4. **Selectores**: paleta de 15 colores fijos (cubre los 14 del seed) y catálogo de 24
   íconos lucide; `Category.icon` guarda el string kebab-case del seed y `iconFor()`
   cae en `circle-help` si el nombre no existe. Ambos como `radiogroup` accesible
   (`role="radio"`, `aria-checked`, label en español).
5. **Form**: `category.schema.ts` (zod: nombre 1-40 trim, color `#rrggbb`, ícono) fuera
   del `.tsx` para no chocar con `react-refresh/only-export-components`; RHF + resolver,
   preview del ícono/color junto al nombre, reset al abrir el diálogo.
6. **Listado**: `useCategories()` (`useLiveQuery`) distingue cargando (`undefined` →
   Spinner) de vacío (EmptyState con acción); activas en grilla + sección «Archivadas»
   con restaurar / editar / eliminar.
7. **Tests**: se mockea `categoriesRepo` con `vi.mock` (sin `fake-indexeddb`) → 4 tests:
   archivar-si-tiene-movimientos, borrar-si-no-tiene, deshacer del archivado manual y
   restaurar. La página no tiene smoke test todavía (pendiente de integración con IDB).

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

## Fase 5b — Cotización del dólar (DolarApi oficial) + leyenda ✅

Spec: `SPEC.md` → 4.5.

- `src/shared/lib/dolarapi.ts` — tipos + esquema zod de
  `{ compra, venta, fechaActualizacion }`, `fetchOfficialRate()`
  (`https://dolarapi.com/v1/dolares/oficial`) y lógica pura `isRateStale(lastFetched, now, ttlMs)`
- `src/shared/stores/rate.store.ts` — Zustand con `status: 'idle' | 'loading' | 'error' | 'success'`,
  última cotización conocida y `refreshIfStale()` (TTL 60 min); caché en `localStorage`
- `src/shared/hooks/useExchangeRate.ts` — dispara `refreshIfStale()` al montar, cada hora y
  al recuperar conexión (`online`); nunca bloquea la UI
- `src/shared/ui/rate-legend.tsx` — leyenda corta `≈ $ X.XXX en pesos` bajo montos USD:
  loading sin caché → texto tenue; error sin caché → no se renderiza; con caché → usa la
  última tasa
- Integración: leyenda en las **tarjetas USD del dashboard** y en los **montos USD de la
  lista de movimientos**; si `settings.rateSource === 'dolarapi'`, cada fetch exitoso hace
  `settingsRepo.update({ referenceRate: venta })`
- `defaultSettings.rateSource` pasa de `'manual'` a `'dolarapi'` (tasa fresca por defecto;
  Ajustes permite volver a manual)

**Casos de test de la fase (todos obligatorios)**

| #   | Caso                             | Ejemplo / criterio                                                                |
| --- | -------------------------------- | --------------------------------------------------------------------------------- |
| 1   | **Parseo de respuesta DolarApi** | JSON válido → `{ compra, venta, fechaActualizacion }`; JSON inválido → error      |
| 2   | **Fetch con error / HTTP no-OK** | Rechaza con estado `'error'`, sin tirar excepción fuera del store                 |
| 3   | **Staleness (TTL 1 h)**          | fresca (< 60 min), vencida (> 60 min), límite exacto (60 min = vencida)           |
| 4   | **Mapeo a `referenceRate`**      | `rateSource: 'dolarapi'` + fetch OK → `referenceRate = venta`; `'manual'` intacto |
| 5   | **Leyenda**                      | Renderiza `≈ $ … en pesos` con tasa; sin tasa y en error no renderiza             |

**Verificación**: `npm run lint`, `npm run typecheck`, `npm run format`, `npm run test`
(10 archivos, 74 tests, 3 corridas seguidas en verde) y `npm run build` en verde.

**Decisiones de la fase**

1. **Tipos de error**: HTTP no-OK → `RateFetchError` (con el status); payload inválido →
   `ZodError` del esquema `{ compra, venta, fechaActualizacion }`; fallo de red → se propaga.
   El store los captura todos: nunca lanza fuera de `refresh()` y siempre queda
   `status: 'error'` conservando el último rate conocido.
2. **Staleness**: `isRateStale(lastFetched, now, ttlMs = 60 min)` — `null` siempre vencido y
   el límite exacto cuenta como vencido (`>=`). `refreshIfStale()` además evita refreshes
   superpuestos (`status === 'loading'` → corta).
3. **Persistencia**: `persist` en `mis-finanzas-rate` guarda solo `{ rate, lastFetched }`;
   `status`/`error` son transitorios y arrancan en `idle` al rehidratar (decide
   `refreshIfStale`).
4. **Mapeo a `referenceRate` (test 4)**: decisión pura `referenceRateFor(settings, rate)`
   (`'dolarapi'` → `venta`, `'manual'` → `null`) aplicada por el store vía
   `settingsRepo.update`. Se testea la función pura porque los repos siguen sin
   `fake-indexeddb` (misma decisión 9 de la Fase 1). La escritura es best-effort en
   `try/catch`: un fallo de la DB nunca bloquea la cotización para display.
5. **Default**: `defaultSettings.rateSource` pasa a `'dolarapi'` (tasa fresca desde el
   primer arranque; Ajustes podrá volver a manual en la Fase 6).
6. **Punto único de montaje**: `useExchangeRate()` se engancha una vez en `AppShell`
   (check inicial, intervalo cada 60 min y evento `online`); el store es el que serializa.
7. **Leyenda**: con monto → `≈ $ 15.400,00 en pesos` (convierte con la tasa vigente);
   sin monto → `1 USD ≈ $ 1.540`; sin tasa y cargando → texto con `role="status"`;
   sin tasa y en error → no renderiza; con tasa en caché → la usa aunque el refresh falle.
   El **wiring en las tarjetas USD del dashboard y la lista de movimientos queda pendiente**
   (Fases 4 y 5 todavía no existen); el componente, su test y la sincronización global de
   `referenceRate` ya están entregados.
8. **Fix de test flaky (previo)**: `providers.test.tsx` ahora asegura en `afterEach` que el
   import asíncrono de `motion-features` (que `LazyMotion` setea con `setState`) resuelva
   **dentro** del entorno; antes podía resolver después del teardown de jsdom y producir
   unhandled rejections intermitentes (`window is not defined`).

**Commit**: `feat(rate): add dolarapi official rate service with hourly refresh and ars legend`

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
- **Verificación de rendimiento con 500 movimientos**: cargar los datos de ejemplo hasta tener ~500
  movimientos y medir
  - Fluidez de la lista de movimientos (scroll sin jank, sin _long tasks_)
  - Cambio de mes y de filtros en el dashboard
  - Tiempos de render con Lighthouse mobile (Performance y PWA > 90)
  - Si algo se traba, se optimiza (memoización, `useLiveQuery` bienupdate filtrado, virtualización
    de la lista si hace falta) antes de cerrar la fase

**Commit**: `feat(pwa): add manifest, service worker and offline support`

---

## Fase 8 — Docs y deploy

- `README.md` (qué es, cómo correrlo, scripts, arquitectura, **Decisiones**, roadmap)
- `LICENSE` MIT
- `.github/workflows/deploy.yml` — build y publicación en GitHub Pages en push a `main`
  (`VITE_BASE=/mis-finanzas/`)
- **El repo remoto ya existe: no recrearlo.** Verificar con `git remote -v` que el nombre del remote
  coincide con el `VITE_BASE` del deploy (repo `mis-finanzas` ⇒ `VITE_BASE=/mis-finanzas/`), y
  habilitar _Settings → Pages → Source: GitHub Actions_
- Verificar la app desplegada: instalable como PWA y funcionando offline

**Commits**: `docs: add readme and license` + `ci: add github pages deploy workflow`

---

## Fase 9 — Opcional (solo con todo lo anterior verde)

- Presupuestos por categoría con barra de progreso
- Movimientos recurrentes
- Otras casas de cambio (blue, MEP…) además del oficial — la del oficial ya está en la
  Fase 5b, tolerante a fallos y nunca bloqueante

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
