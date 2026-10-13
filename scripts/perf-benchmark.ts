import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defaultCategories } from '../src/shared/db/database.ts';
import { generateDemoTransactions } from '../src/shared/lib/demo-data.ts';
import {
  lastSixMonths,
  totalsByCategory,
  totalsByMonth,
  totalsForDisplay
} from '../src/shared/lib/aggregations.ts';
import { monthOf, todayISO } from '../src/shared/lib/dates.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REFERENCE_RATE = 1500;
const ITERATIONS = 1000;

function bench<T>(name: string, fn: () => T): { name: string; ms: number; result: T } {
  const start = performance.now();
  let result: T;
  for (let i = 0; i < ITERATIONS; i += 1) {
    result = fn();
  }
  const end = performance.now();
  return { name, ms: end - start, result: result! };
}

function run(): string {
  const transactions = generateDemoTransactions(defaultCategories, {
    months: 14,
    seed: 42,
    today: new Date()
  });

  const currentMonth = monthOf(todayISO());

  const results = [
    bench('generateDemoTransactions (14 months)', () =>
      generateDemoTransactions(defaultCategories, {
        months: 14,
        seed: 42,
        today: new Date()
      })
    ),
    bench('totalsByMonth (current, ARS)', () =>
      totalsByMonth(transactions, currentMonth, 'ARS', REFERENCE_RATE)
    ),
    bench('totalsByCategory (expenses, current, ARS)', () =>
      totalsByCategory(
        transactions,
        currentMonth,
        defaultCategories,
        'ARS',
        REFERENCE_RATE,
        'expense'
      )
    ),
    bench('lastSixMonths (ARS)', () =>
      lastSixMonths(transactions, currentMonth, 'ARS', REFERENCE_RATE)
    ),
    bench('totalsForDisplay (BOTH)', () =>
      totalsForDisplay(transactions, currentMonth, 'BOTH', REFERENCE_RATE)
    )
  ];

  const rows = results.map((r) => {
    const perCall = (r.ms / ITERATIONS).toFixed(4);
    return `| ${r.name} | ${r.ms.toFixed(2)} ms | ${perCall} ms |`;
  });

  const txCount = transactions.length;

  return `# Performance baseline

Benchmark ejecutado el ${new Date().toISOString()} con **${txCount}** movimientos generados
por \`generateDemoTransactions(defaultCategories, { months: 14 })\`.

Cada función se ejecutó **${ITERATIONS}** veces. El entorno es Node.js ${process.version}.

## Resultados

| Función | Total ${ITERATIONS} llamadas | Por llamada |
| --- | --- | --- |
${rows.join('\n')}

## Notas

- Las funciones de agregación recorren todas las transacciones una vez por llamada.
- \`generateDemoTransactions\` es O(n) respecto a la cantidad de meses/movimientos y se
  ejecuta solo al cargar datos de ejemplo.
- El objetivo de producto es mantener cada render del dashboard por debajo de 16 ms en
  JavaScript; el benchmark mide la capa pura de agregación, sin React ni pintado del DOM.
- Para medir Lighthouse real con 500 movimientos en el navegador: abrir la app, ir a
  Ajustes → Borrar datos → Cargar datos de ejemplo, y correr Lighthouse mobile.

## Próximos pasos

- [ ] Medir Lighthouse mobile con 500 movimientos reales en el build deployado.
- [ ] Si \`totalsByCategory\` o \`lastSixMonths\` superan 5 ms por llamada, considerar
      índices por mes en Dexie o memoización en el hook de dashboard.
`;
}

const markdown = run();
writeFileSync(path.resolve(__dirname, '../docs/PERF.md'), markdown, 'utf8');
console.log(markdown);
console.log('\n✅ Resultados guardados en docs/PERF.md');
