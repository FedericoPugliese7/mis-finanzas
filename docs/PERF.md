# Performance baseline

Benchmark ejecutado el 2026-10-11T18:06:23.102Z con **510** movimientos generados
por `generateDemoTransactions(defaultCategories, { months: 14 })`.

Cada función se ejecutó **1000** veces. El entorno es Node.js v24.19.0.

## Resultados

| Función                                   | Total 1000 llamadas | Por llamada |
| ----------------------------------------- | ------------------- | ----------- |
| generateDemoTransactions (14 months)      | 404.85 ms           | 0.4048 ms   |
| totalsByMonth (current, ARS)              | 20.29 ms            | 0.0203 ms   |
| totalsByCategory (expenses, current, ARS) | 25.51 ms            | 0.0255 ms   |
| lastSixMonths (ARS)                       | 49.49 ms            | 0.0495 ms   |
| totalsForDisplay (BOTH)                   | 33.46 ms            | 0.0335 ms   |

## Notas

- Las funciones de agregación recorren todas las transacciones una vez por llamada.
- `generateDemoTransactions` es O(n) respecto a la cantidad de meses/movimientos y se
  ejecuta solo al cargar datos de ejemplo.
- El objetivo de producto es mantener cada render del dashboard por debajo de 16 ms en
  JavaScript; el benchmark mide la capa pura de agregación, sin React ni pintado del DOM.
- Para medir Lighthouse real con 500 movimientos en el navegador: abrir la app, ir a
  Ajustes → Borrar datos → Cargar datos de ejemplo, y correr Lighthouse mobile.

## Próximos pasos

- [ ] Medir Lighthouse mobile con 500 movimientos reales en el build deployado.
- [ ] Si `totalsByCategory` o `lastSixMonths` superan 5 ms por llamada, considerar
      índices por mes en Dexie o memoización en el hook de dashboard.
