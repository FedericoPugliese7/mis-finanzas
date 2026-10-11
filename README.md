# Mis Finanzas

PWA local-first para registrar ingresos y gastos personales en pesos argentinos (ARS) y
 dólares estadounidenses (USD). Sin cuentas, sin backend y sin telemetría: los datos viven
  en IndexedDB del dispositivo.

**URL pública**: `https://federicopugliese7.github.io/mis-finanzas/`

## Características

- Dashboard mensual con totales en ARS, USD o ambas monedas.
- Gráfico de dona por categorías (gastos) con drill-down a movimientos filtrados.
- Gráfico de barras comparativo de ingresos vs. gastos de los últimos 6 meses.
- Alta, edición y borrado de movimientos con deshacer.
- Categorías personalizables con opción de archivar.
- Cotización del dólar oficial (DolarApi, TTL de 1 hora) o manual.
- Backup JSON (merge/replace), exportación CSV y borrado total de datos.
- Modo claro/oscuro con persistencia y transición ripple.
- Instalable como PWA en Android, iOS y escritorio.

## Stack

- **Build**: Node 24+, Vite 6, TypeScript strict.
- **Frontend**: React 19, React Router 7 (`HashRouter`), Tailwind CSS v4.
- **Componentes**: Radix UI primitives, `lucide-react`.
- **Animación**: `motion` (`LazyMotion` + `m`), tokens centralizados en
  `src/shared/motion.ts`.
- **Persistencia**: Dexie (IndexedDB) con `useLiveQuery`; cero backend.
- **Formularios**: `react-hook-form` + `zod`.
- **PWA**: `vite-plugin-pwa` con service worker y precache.

## Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción (typecheck + vite build)
npm run preview      # Previsualizar build local
npm run typecheck    # Chequeo estricto de tipos
npm run lint         # ESLint
npm run test         # Tests con Vitest
npm run format       # Chequeo de formato con Prettier
npm run icons        # Regenerar íconos PWA desde public/favicon.svg
```

## Arquitectura

```
UI (React) → Hooks / Casos de uso → Repositorios (Dexie)
```

- La UI nunca interactúa directamente con IndexedDB.
- Lógica de dinero, conversión, agregación, fechas y CSV es pura y está testeada.
- El dinero se opera **siempre en enteros** (centavos / unidades menores) y se formatea con
  `Intl.NumberFormat('es-AR')`.
- Las fechas se almacenan como string `YYYY-MM-DD`, sin dependencias de zona horaria.

## Decisiones destacadas

- **Local-first**: los datos nunca salen del dispositivo. La única request externa opcional es
  la cotización del dólar.
- **HashRouter**: GitHub Pages no soporta SPA fallback nativo; `HashRouter` resuelve rutas
  sin configuración del servidor.
- **Gráficos a medida (SVG/CSS)**: evitan bundles pesados y permiten animar directamente con
  `motion` sin librerías externas.
- **`vaul` para sheets móviles**: justificado porque da gestos de arrastre nativos en
  bottom-sheet y drawers, sin conflictos con el Dialog de Radix. Es la única dependencia de
  UI añadida fuera de Radix.
- **Identidad visual "lima eléctrico"**: acento lima puro `#91FF16` en dark premium; en light
  se usa `#4a7a00` para mantener contraste AA sobre fondo claro.
- **Glass**: superficies translúcidas con `backdrop-filter` en header, tab bar, cards del
  dashboard, drawer y toasts; degradan a opaco con `prefers-reduced-transparency`.

## Instalación como PWA

1. Abrir la URL pública en Chrome/Safari/Edge.
2. Android/Chrome: menú → **Agregar a pantalla de inicio**.
3. iOS/Safari: compartir → **Agregar a Inicio**.
4. Edge/Chrome en escritorio: ícono de instalación en la barra de direcciones.

La app se ejecuta en modo `standalone`, funciona offline gracias al service worker y recibe
actualizaciones automáticas cuando hay un nuevo build.

## Roadmap

- [x] MVP: dashboard, movimientos, categorías, ajustes, backup/export, PWA.
- [x] Pulido de animaciones y rediseño visual (lima eléctrico + dark premium).
- [ ] Verificación de performance con ~500 movimientos (Fase 8).
- [ ] Presupuestos por categoría (opcional).
- [ ] Movimientos recurrentes (opcional).
- [ ] Cotizaciones blue / MEP (opcional).

## Licencia

MIT — ver [LICENSE](./LICENSE).
