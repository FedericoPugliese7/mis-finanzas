# MOTION-AUDIT — Auditoría de animaciones

> Paso 1 del plan de refinamiento de motion (Fase 8 / Fase 10).
> Este documento NO modifica código; sirve como mapa antes de la implementación.
>
> Fuentes: `docs/SPEC.md` → "Animaciones", `src/shared/motion.ts`,
> `src/app/providers.tsx`, revisión con `@designer`, `@apple-design` y
> `@review-animations`.

---

## Leyenda

- **Prioridad**
  - **Crítica**: sin esto el plan no se siente nativo iOS o rompe una regla del SPEC.
  - **Alta**: impacta directo en la sensación de fluidez.
  - **Media**: inconsistencia visual o accesibilidad que conviene cerrar.
  - **Baja**: nice-to-have o ya cumple.
- **Números sueltos**: valores literales de `stiffness`, `damping`, `duration`,
  `delay`, `mass`, `easing` o curvas `cubic-bezier` declarados fuera de
  `src/shared/motion.ts`.

---

## Tabla de auditoría

| Componente / Escena | Estado actual | Qué falta | Prioridad | Números sueltos |
| --- | --- | --- | --- | --- |
| `Button` (`src/shared/ui/button.tsx`) | `whileTap={presses.tap}` (scale 0.97) + `transition={springs.micro}`. Feedback instantáneo en `pointerdown`. | Confirmar que no se agregue `whileHover` por defecto. El foco visible ya lo da `:focus-visible` en `global.css`. | Baja | Ninguno |
| `Card` interactive (`src/shared/ui/card.tsx`) | `whileTap={presses.tap}` + `springs.micro` solo cuando `interactive=true`. | Sin hover-scale. Variantes de card no animan. | — | Ninguno |
| `Switch` (`src/shared/ui/switch.tsx`) | Thumb animado con CSS variables `--motion-duration-micro` / `--motion-ease-standard`. | — | — | Variables CSS del `motion.ts` |
| `Segmented` (`src/shared/ui/segmented.tsx`) | Indicador deslizante con `layoutId` + `springs.ui`. | Aceptar `controlId` opcional para compartir indicador entre instancias (header ↔ Ajustes). | Media | Ninguno |
| `Dialog` (`src/shared/ui/dialog.tsx`) | `AnimatePresence` + `dialogOverlayVariants` + `dialogContentVariants` (scale 0.98 + y 8 px). | — | — | Ninguno |
| `Sheet` (`src/shared/ui/sheet.tsx`) | Componente Radix Dialog + `sheetVariants`. | **No se usa en ninguna página.** Borrar tras unificar drawer. | Alta | Ninguno |
| `transaction-form.tsx` mobile (Vaul) | `Drawer.Root` directo, sin `AnimatePresence`; overlay estático. | Migrar a `AnimatedDrawer` con overlay animado. Mantener drag-to-close y rubber-band de Vaul. | Alta | Ninguno |
| `Toast` (`src/shared/ui/toast.tsx`) | `toastVariants` + `AnimatePresence initial={false}`. Pausa en hover/focus. | Opcional: barra de progreso para undo (nice-to-have). | Baja | Ninguno |
| `SectionHeader` (`src/shared/ui/section-header.tsx`) | `fadeVariants` en entrada. | — | — | Ninguno |
| `EmptyState` (`src/shared/ui/empty-state.tsx`) | `fadeVariants` al aparecer. | Envolver con `AnimatePresence mode="wait"` al alternar con listas (vacío ↔ datos). | Media | Ninguno |
| `MonthSelector` (`src/shared/ui/month-selector.tsx`) | Sin animación del label de mes. | Transición direccional: avanzar desliza derecha→izquierda, retroceder al revés. | Alta | Ninguno |
| `DesktopNav` (`src/shared/ui/navigation-menu.tsx`) | Subrayado activo con `transition-transform` CSS (`scale-x 0↔1`). | Migrar a `<m.span layoutId="desktop-nav-indicator">` para que el indicador se deslice con spring. | Alta | Ninguno |
| `TabBar` (`src/shared/ui/tab-bar.tsx`) | Color activo + `transition-colors`. | Indicador deslizante con `layoutId` por ruta. | Alta | Ninguno |
| `AppShell` rutas (`src/app/layout/AppShell.tsx`) | `routeVariants` aplicados a `<m.div key={pathname}>`. | **Falta `<AnimatePresence>` alrededor del `<Outlet>`**: el `exit` de la ruta anterior nunca corre. | **Crítica** | Ninguno |
| `AnimatedNumber` (`src/shared/ui/animated-number.tsx`) | Spring `transitions.count` + `sr-only` con valor final exacto. Respeta `prefers-reduced-motion`. | — | — | Ninguno |
| `SummaryCards` (`src/features/dashboard/summary-cards.tsx`) | `fadeVariants` + `AnimatedNumber`. | Al cambiar de mes el contenedor no debe re-disparar el stagger; re-animar solo los números. | Media | Ninguno |
| `category-donut.tsx` | `chartVariants` (fade del contenedor). Sin animación por slice. | Barrido de la dona con `pathLength: 0→1` escalonado por slice (atributo SVG exceptuado). | Alta | Ninguno |
| `monthly-bars.tsx` | `chartVariants` (fade del contenedor). Barras estáticas (`height: %`). | Crecimiento desde la base con `scaleY: 0→1` + `transform-origin: bottom`, escalonado. | Alta | Ninguno |
| `dashboard.page.tsx` entrada | `staggerContainerVariants` + charts con fade largo + count-up. | **Tres protagonistas solapados**. En el primer mount: count-up protagonista, charts fade corto, stagger recortado. Al cambiar de mes: solo re-count. | **Crítica** | Ninguno |
| `LatestMovements` (`src/features/dashboard/latest-movements.tsx`) | Sin variants. | Agregar al stagger/segunda ola del dashboard. | Media | Ninguno |
| `TopCategories` (`src/features/dashboard/top-categories.tsx`) | Sin variants. | Agregar al stagger/segunda ola del dashboard. | Media | Ninguno |
| `transactions.page.tsx` lista | `<m.ul variants={listContainerVariants}>` por grupo. `layout="position"` en filas. | Stagger se re-dispara en cada cambio de filtro/mes. Limitar a primer mount de cada grupo. Recortar stagger total a 300–400 ms. | **Crítica** | Ninguno |
| `transaction-row.tsx` | `layout="position"`. | Probar `layout` (sin `position`) para reflow vertical; volver atrás si pesa con 500 movimientos. | Media | Ninguno |
| `categories.page.tsx` lista | `listContainerVariants` + `listItemVariants` + `layout="position"`. | Stagger correcto; no se re-dispara por reordenamiento. | — | Ninguno |
| `SettingsPage` (`src/features/settings/settings.page.tsx`) | Sin animación de entrada propia. | Stagger suave en las tres cards para consistencia con Dashboard/Transacciones. | Baja | Ninguno |
| `FAB` (`src/features/transactions/transactions.page.tsx`) | `whileTap={presses.tap}` + cambio de `shadow-card`. | Sombra estática; usar scale 0.97 + opacity 0.92 si hace falta más feedback. No dos protagonistas. | Baja | Ninguno |
| `Spinner` (`src/shared/ui/spinner.tsx`) | `animate-spin` de Tailwind (keyframes globales). | OK para estados de carga. | — | Ninguno |
| `rate-section.tsx` loading icon | `animate-spin` de Tailwind. | OK. | — | Ninguno |
| Tema claro/oscuro (`useTheme.ts` + `global.css`) | View Transitions API con `initialApplyDone`; fallback CSS. No dispara en carga inicial. | Auditar foco durante View Transition y `prefers-reduced-motion`. | Media | Ninguno |
| Estados de carga (Dashboard/Transacciones/Categorías/Settings) | `Spinner` centrado. | Reservar espacio para evitar saltos de layout cuando los datos llegan. | Media | Ninguno |

---

## Hallazgos críticos que el plan debe resolver

1. **`AppShell.tsx` no envuelve `<Outlet>` con `AnimatePresence`**
   El `exit` de `routeVariants` nunca se ejecuta. Solo se ve la entrada de la
   nueva ruta; la anterior desaparece sin transición.

2. **Dashboard monta tres protagonistas a la vez**
   `staggerContainerVariants` (~200–300 ms), `chartVariants` en dos gráficos
   (700 ms) y `AnimatedNumber` (600 ms) corren simultáneos. El plan debe
   elegir un protagonista (count-up) y reducir el resto a acompañantes.

3. **Cambio de mes en Dashboard re-dispara el stagger**
   El contenedor con `initial="hidden" animate="visible"` no cambia de `key`,
   pero React re-renderiza el árbol y el stagger vuelve a correr. Se necesita
   un flag de primer monte igual que `useChartEntrance`.

4. **Cambio de filtro en Transacciones re-dispara el stagger completo**
   Cada grupo `<m.ul>` se re-monta al cambiar filtros. Con 30 items × 30 ms
   el stagger supera los 900 ms (límite del plan: 300–400 ms).

5. **Barras y dona no animan su construcción**
   A pesar de que `SPEC 7.7` pide "barras que crecen desde la base y dona que
   se dibuja con barrido", solo el contenedor hace fade. La animación de
   construcción es el mayor diferenciador nativo y todavía no está.

6. **Indicadores de navegación no usan `layoutId`**
   Tanto `DesktopNav` como `TabBar` usan transiciones CSS. El plan exige
   indicador deslizante compartido (`layoutId`).

7. **Hoy coexisten dos sistemas de sheet**
   `shared/ui/sheet.tsx` (Radix + Motion) y Vaul directo en el form. Debe
   quedar un solo componente (`AnimatedDrawer`) que combine `AnimatePresence`
   (overlay) con el spring/drag de Vaul (content).

---

## Componentes que ya cumplen (no requieren cambios)

- `Button` press feedback.
- `Card` interactive press feedback.
- `Switch` thumb transition con tokens CSS.
- `Segmented` indicador `layoutId` local.
- `Dialog` enter/exit con `AnimatePresence`.
- `Toast` enter/exit y pausa accesible.
- `AnimatedNumber` count-up con valor final exacto y reduced-motion.
- `EmptyState` fade de entrada.
- Tema: View Transitions sin carga inicial.
- `categories.page.tsx` stagger + layout.

---

## Archivos que NO declaran números sueltos de animación

Después de barrer `src/**/*.tsx` y `src/**/*.ts`, **no se encontraron**
literales de `stiffness`, `damping`, `duration`, `stagger` ni curvas
`cubic-bezier` fuera de `src/shared/motion.ts`. Los únicos valores literales
relacionados son:

- `switch.tsx` usa CSS variables `--motion-duration-micro` y
  `--motion-ease-standard`, que vienen de `motion.ts` vía `MotionProvider`.
- `spinner.tsx` y `rate-section.tsx` usan `animate-spin` de Tailwind (keyframes
  globales, no un valor de tiempo suelto en el componente).
- `category-donut.tsx` y `monthly-bars.tsx` usan `chartVariants` y
  `useChartEntrance` (ambos de `motion.ts`).

> Nota: `src/shared/motion.ts` tiene un cambio sin commitear que añade
> `chartVariants` y actualiza un comentario. Se incluirá en el Paso 2.

---

## Recomendaciones de orden de implementación

1. Lote A — Primitivas: confirmar `Button`/`Card` sin hover, `Segmented` con
   `controlId` opcional.
2. Lote B — `AnimatedDrawer`: unificar Vaul + `AnimatePresence`, borrar
   `shared/ui/sheet.tsx` legacy.
3. Lote C — Navegación: `AnimatePresence` en rutas, `layoutId` en `DesktopNav`
   y `TabBar`, `MonthSelector` direccional.
4. Lote D — Dashboard: resolver protagonistas, animar gráficos, incluir
   `LatestMovements`/`TopCategories` en el stagger.
5. Lote E — Listas de movimientos: stagger primer-mount-only + límite de
   duración.
6. Lote F — Tema: auditar reduced-motion y foco.
7. Lote G — Estados de carga/vacío/error: `AnimatePresence mode="wait"` y
   reserva de espacio.

---

*Documento generado el 2026-10-08. Próximo paso: aprobación del usuario antes*
*de editar `src/shared/motion.ts` (Paso 2).*
