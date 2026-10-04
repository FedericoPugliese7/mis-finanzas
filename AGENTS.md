# AGENTS.md — Guía para agentes de IA en `mis-finanzas`

Este repositorio es una PWA local-first para el control de ingresos y gastos personales en pesos argentinos (ARS) y dólares estadounidenses (USD).

## Stack tecnológico

- **Runtime & Build:** Node 24+, Vite 6+, `@vitejs/plugin-react`, `@tailwindcss/vite`
- **Frontend:** React 19, TypeScript (modo strict, prohibido `any`, `noUncheckedIndexedAccess: true`), React Router 7 (`HashRouter`)
- **Estilos:** Tailwind CSS v4 con variables CSS en `@theme` / `:root`, `@fontsource-variable/inter`
- **Componentes:** Radix UI primitives accesibles, `lucide-react`
- **Persistencia local:** Dexie 4+ (IndexedDB) con `dexie-react-hooks` (`useLiveQuery`). Cero backend, cero telemetría.
- **Estado de UI:** Zustand (solo para UI transitoria y preferencias como tema/moneda).
- **Formularios & Validación:** `react-hook-form` + `@hookform/resolvers` + `zod`
- **Gráficos & Fechas:** `recharts` (carga diferida `React.lazy`), `date-fns` (locale `es`)
- **PWA:** `vite-plugin-pwa` (service worker, manifest, precache offline)
- **Calidad:** Vitest (jsdom, React Testing Library), ESLint 9 (flat config), Prettier

## Convenciones de código e idioma

- **Idioma del código:** Nombres de variables, funciones, tipos, archivos y commits en **inglés**.
- **Idioma de la UI:** Español rioplatense (`es-AR`) para textos visibles al usuario.
- **Manejo de dinero:** SIEMPRE en enteros (centavos / unidades menores). Parsear con coma decimal ("1.234,56" → `123456`) y formatear con `Intl.NumberFormat('es-AR')`. Prohibido operar con floats en cálculos acumulados.
- **Fechas:** Formato de almacenamiento `YYYY-MM-DD` (string plano sin dependencias de zona horaria).
- **Flujo arquitectónico:** `UI (React) → Hooks / Casos de uso → Repositorios (Dexie)`. La UI nunca interactúa con la base de datos directamente. Las funciones de cálculo de dinero y agregación deben ser **puras**, sin dependencias de React.

## Estructura del proyecto

```
src/
  app/          # Router (HashRouter), providers, layout shell (sidebar desktop / tab bar mobile)
  features/     # transactions/, categories/, dashboard/, settings/, backup/
  shared/
    db/         # Dexie DB, tablas, índices y repositorios
    lib/        # Dinero, conversión, fechas, agregaciones, csv (funciones puras)
    ui/         # Componentes base accesibles (button, card, dialog, toast, etc.)
    stores/     # Stores Zustand de UI y ajustes
    hooks/      # Hooks utilitarios (useTheme, useIsDesktop, etc.)
```

## Comandos estándar

```bash
npm run dev          # Iniciar servidor de desarrollo local
npm run build        # Compilar para producción (tsc -b + vite build)
npm run preview      # Previsualizar build de producción
npm run typecheck    # Chequeo estricto de tipos con TypeScript
npm run lint         # Linter ESLint
npm run lint:fix     # Corregir errores de ESLint automáticamente
npm run test         # Correr suite de tests con Vitest
npm run test:watch   # Tests en modo interactivo
npm run format       # Chequeo de formato con Prettier
npm run format:fix   # Formatear archivos con Prettier
```

## Reglas de trabajo

1. Al cerrar cada fase de trabajo, ejecutar: `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build`.
2. Seguir Conventional Commits (ej: `feat(core): ...`, `fix(ui): ...`, `chore: ...`).
3. No agregar dependencias sin justificación documentada en `README.md`.
4. Todas las rutas pesadas (especialmente Recharts) deben cargarse con `React.lazy`.
