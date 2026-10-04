# SPEC — Mis Finanzas

Especificación funcional y técnica de la app. Es la fuente de verdad de **qué** tiene que
cumplir el producto; el **cómo** (stack, estructura, comandos) vive en [`AGENTS.md`](../AGENTS.md)
y el estado de avance en [`PLAN.md`](./PLAN.md).

---

## 1. Objetivo

PWA **local-first** para registrar ingresos y gastos mensuales en pesos argentinos (ARS) y
dólares estadounidenses (USD), organizados por categorías, con un dashboard claro.

- Un solo usuario, **sin backend, sin login, sin telemetría**.
- Los datos viven **solo en el dispositivo** (IndexedDB).
- UI en **español rioplatense (`es-AR`)**; código, nombres y commits en **inglés**.

---

## 2. Stack (obligatorio)

| Área              | Tecnología                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Build             | Vite 6, `@vitejs/plugin-react`                                                                     |
| Frontend          | React 19, TypeScript strict (sin `any`, `noUncheckedIndexedAccess`), React Router 7 (`HashRouter`) |
| Estilos           | Tailwind CSS v4 con tokens CSS (`@theme`), Radix UI, `lucide-react`, `@fontsource-variable/inter`  |
| Persistencia      | Dexie 4 + `dexie-react-hooks` (`useLiveQuery`)                                                     |
| Estado de UI      | Zustand (solo UI transitoria y preferencias)                                                       |
| Formularios       | `react-hook-form` + `@hookform/resolvers` + `zod`                                                  |
| Gráficos / fechas | `recharts` (lazy), `date-fns` (locale `es`)                                                        |
| Animación         | `motion` (`motion/react`, `LazyMotion` + `m`), tokens en `src/shared/motion.ts`                    |
| PWA               | `vite-plugin-pwa` (manifest + service worker + precache)                                           |
| Calidad           | Vitest + React Testing Library, ESLint 9 flat, Prettier                                            |

---

## 3. Modelo de datos

**Transaction**

| Campo                     | Tipo                    | Notas                                     |
| ------------------------- | ----------------------- | ----------------------------------------- |
| `id`                      | `string` (uuid)         |                                           |
| `type`                    | `'income' \| 'expense'` |                                           |
| `amountMinor`             | `number`                | **Entero** en centavos / unidades menores |
| `currency`                | `'ARS' \| 'USD'`        |                                           |
| `categoryId`              | `string`                |                                           |
| `date`                    | `string`                | `YYYY-MM-DD` plano (sin zona horaria)     |
| `note`                    | `string?`               |                                           |
| `exchangeRate`            | `number?`               | ARS por 1 USD al momento de cargar        |
| `createdAt` / `updatedAt` | `number`                | epoch ms                                  |

**Category**: `id`, `name`, `type`, `color`, `icon`, `isDefault`, `archived`.

**Settings**: `theme` (`'light' | 'dark' | 'system'`), `displayCurrency` (`'ARS' | 'USD' | 'BOTH'`),
`referenceRate`, `rateSource` (`'manual' | 'dolarapi'`).

Índices Dexie: `date`, `categoryId`, `[type+date]`.

**Reglas de dinero y fechas**

- El dinero se **siempre** en enteros. Parseo es-AR (`"1.234,56"` → `123456`) y formateo con
  `Intl.NumberFormat('es-AR')`. Prohibido acumular en floats.
- Fechas en `YYYY-MM-DD` como string plano.
- Conversión: se usa `tx.exchangeRate` si existe; si no, la cotización de referencia de Settings.
- Flujo: `UI → hooks/casos de uso → repositorios (Dexie)`. La UI **nunca** toca Dexie.
- Toda lógica de dinero, conversión y agregación son **funciones puras** con tests.

---

## 4. Funcionalidades (MVP)

Cabecera global: el header de la app (sidebar desktop / header mobile) muestra siempre la
**fecha actual** en formato largo (`Domingo 4 de octubre de 2026`, locale `es`) junto al
título de la sección.

### 4.1 Dashboard mensual

- Selector de mes (anterior / siguiente).
- Tarjetas de ingresos, gastos y balance, con selector ARS / USD / ambas.
- Gráfico de dona con gastos por categoría.
- Barras de ingresos vs gastos de los últimos 6 meses.
- Top categorías y últimos movimientos.

### 4.2 Movimientos

- Alta rápida: botón flotante en mobile, drawer/modal en desktop.
- Edición y borrado con **deshacer** (toast).
- Lista agrupada por día, con filtros (mes, tipo, categoría, moneda) y búsqueda por texto.

### 4.3 Categorías

- CRUD con color e ícono. Si una categoría tiene movimientos, **se archiva** en vez de borrarse.
- Defaults de gastos: Alquiler, Expensas, Supermercado, Transporte, Servicios, Impuestos, Salud,
  Ocio, Suscripciones, Educación, Ahorro/Inversión, Otros.
- Defaults de ingresos: Sueldo, Freelance, Otros.

### 4.4 Ajustes

- Tema, moneda de visualización, cotización de referencia.
- Exportar / importar JSON (con `schemaVersion` y validación zod; modos `merge` y `replace`) y
  exportar CSV.
- Borrar todos los datos, con confirmación.

### 4.5 Cotización del dólar (DolarApi oficial)

- Servicio TypeScript que consume la API pública de DolarApi
  (`https://dolarapi.com/v1/dolares/oficial`) y tipa la respuesta como
  `{ compra: number, venta: number, fechaActualizacion: string }` (validación zod).
- Se actualiza **como mínimo cada hora** (TTL de 60 min), con estados de carga y error
  explícitos. Nunca bloquea la UI.
- Bajo los montos en USD (tarjetas del dashboard y lista de movimientos) se muestra una
  **leyenda corta** `≈ $ X.XXX en pesos` con la venta vigente.
- Cuando `Settings.rateSource = 'dolarapi'`, cada cotización exitosa actualiza
  `Settings.referenceRate` con `venta`, de modo que las conversiones ARS ↔ USD usan la
  tasa fresca. Con `rateSource = 'manual'` la tasa la define el usuario en Ajustes.
- Fallos: si hay caché se usa la última tasa conocida; sin caché la leyenda no se
  renderiza y las conversiones siguen con el último `referenceRate`.

### 4.6 Estados vacíos

Estados vacíos amables en todas las vistas + botón para cargar **datos de ejemplo**.

### 4.7 Opcional (solo si el MVP está verde)

Presupuestos por categoría con barra de progreso, movimientos recurrentes, otras casas de
cambio (blue, MEP…) además del oficial. Siempre opcional, tolerante a fallos y nunca
bloqueante.

---

## 5. Diseño

- Estética calma y aireada: mucho espacio en blanco, radios de 16 px, sombras muy suaves,
  bordes finos de bajo contraste.
- Paleta con tokens: claro = fondo off-white cálido, superficies blancas, texto slate;
  oscuro = fondo slate profundo (no negro puro), superficies un tono más claras.
- Acento índigo. Ingresos verde suave. Gastos coral/rosa suave (nada de rojo agresivo).
- Sin neones ni gradientes fuertes. Sin banners ni notificaciones intrusivas.
  Modales solo cuando son imprescindibles.
- Mobile-first: < 768 px tab bar inferior + botón flotante; ≥ 1024 px sidebar fija y contenido
  con ancho máximo.
- Áreas táctiles ≥ 44 px, safe-area insets, `inputmode="decimal"` en los montos.

---

## 6. Tema claro/oscuro

- Selector de tres opciones: Claro / Oscuro / Sistema.
- Se persiste en `localStorage` y se aplica con un **script inline en `index.html`**, antes de que
  cargue React, para evitar el parpadeo.
- Actualizar `color-scheme` y `<meta name="theme-color">`.

---

## 7. Animaciones

Estilo **iOS: suave, corto, nunca invasivo**. Los tokens de esta sección viven **únicamente** en
[`src/shared/motion.ts`](../src/shared/motion.ts) (springs, duraciones, easings, variantes). **Prohibido**
declarar números de animación sueltos en los componentes: se importan de ese módulo.

### 7.1 Springs y easings

- Movimiento con **springs**: spring estándar de UI (`stiffness` ~300-400, `damping` ~30,
  **sin rebote notorio**).
- **Sheets y drawers**: easing `cubic-bezier(0.32, 0.72, 0, 1)` o spring equivalente de 350-500 ms.

### 7.2 Micro-interacciones

- Hover, foco y toggles: **150-250 ms**.
- Botones y tarjetas tocables: **feedback de presión** (`scale` ~0.97) con retorno suave.

### 7.3 Entrada y salida de elementos

- Items de lista, toasts y modales: **fade + desplazamiento corto (8-16 px)** con `AnimatePresence`.
- En listas, el **reordenamiento se anima con layout animations** (`layout`).

### 7.4 Formularios en mobile

- Altas y ediciones en mobile van en **bottom sheet** que sube desde abajo, con **arrastre para
  cerrar**. Se usa **Vaul** (compatible con React 19; depende solo de `@radix-ui/react-dialog`, no
  agrega un segundo runtime de animación) y sus variables CSS se alimentan desde los tokens de
  `src/shared/motion.ts`. Si Vaul resultara incompatible, el fallback es `drag` + `AnimatePresence`
  de `motion`.

### 7.5 Cambio de ruta

- Transición sutil de opacidad y desplazamiento, **sin bloquear la navegación**.

### 7.6 Cambio de tema

- Transición suave de colores con la **View Transitions API** si el navegador la soporta; si no,
  una transición CSS corta.
- **NUNCA en la carga inicial**, para no romper el script anti-parpadeo: el primer render no
  dispara transición.

### 7.7 Dashboard

- Los **números de las tarjetas se animan al cambiar de valor** (count suave y breve).
- Los **gráficos de Recharts animan solo en el primer montaje** (600-800 ms, ease-out) y **no** al
  cambiar de filtros.

### 7.8 Performance

- Animar **solo `transform` y `opacity`**. Nada de `width`, `height`, `top` ni `left`.
  `will-change` solo donde haga falta.
- Objetivo **60 fps en un celular de gama media**. Si una animación genera jank, se simplifica.

### 7.9 Accesibilidad

- Con `prefers-reduced-motion` activo: reducir a fades simples o desactivar.
- Se usa `MotionConfig reducedMotion="user"` y se respeta también en CSS.
- Objetivo de contraste **AA** y resumen en texto o tabla alternativa para cada gráfico.

---

## 8. Calidad

**Tests (Vitest)**

- Parseo de montos en formato es-AR: `"1.234,56"` → `123456` centavos (y variantes: `"1.234"`,
  `"0,05"`, `"12"`, espacios).
- Formateo de montos: centavos → `"1.234,56"`, importes negativos, importes grandes, símbolos `$` y
  `US$`.
- Conversión USD → ARS usando el `exchangeRate` del propio movimiento.
- Conversión con fallback a la cotización de referencia de Settings cuando el movimiento no trae
  `exchangeRate`.
- Conversión ARS → USD.
- Agregación de totales por mes.
- Agregación de totales por categoría.
- Balance con monedas mezcladas (ARS + USD) normalizado a la moneda de visualización elegida.
- Validación de importación de backup.
- Smoke test del formulario de movimientos.
- Parseo/validación de la respuesta de DolarApi (con `fetch` mockeado) y mapeo de `venta` a
  `Settings.referenceRate`.
- Decisión de staleness de la cotización (TTL de 1 hora: fresca, vencida y límite exacto).

**Accesibilidad**: labels, foco visible, navegación por teclado, contraste AA, resumen textual o
tabla alternativa para los gráficos.

**Rendimiento**

- Carga diferida de rutas y gráficos.
- **Verificación obligatoria con 500 movimientos** (generados a partir de los datos de ejemplo):
  scroll de la lista sin jank ni _long tasks_, cambio de mes y de filtros fluido, y
  Lighthouse mobile > 90 en Performance y PWA.

**Privacidad**: cero telemetría y cero requests externos (salvo la cotización opcional).

---

## 9. Entregables

- `AGENTS.md` en la raíz con stack, estructura, comandos y convenciones.
- `docs/SPEC.md` (este documento) y `docs/PLAN.md` con el detalle de fases.
- CI (lint, typecheck, test, build) en verde en cada push y PR.
- Checklist final:
  - Instalable en Android/iOS como PWA y funciona offline.
  - El tema persiste sin parpadeo.
  - Exportar e importar JSON no pierde datos.
  - Todos los scripts pasan y el CI está en verde.
  - La app está desplegada en GitHub Pages en el repo existente `mis-finanzas`
    (`VITE_BASE=/mis-finanzas/`).
