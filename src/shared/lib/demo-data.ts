import type { Category, DateISO, Transaction } from './types';

export interface DemoOptions {
  /** Number of full calendar months behind today to cover (default 12 -> ~500 transactions). */
  months?: number;
  /** Seed for PRNG reproducibility (default 42). */
  seed?: number;
  /** Anchor date for "today" (defaults to current system date). */
  today?: Date;
}

/** Simple 32-bit PRNG for deterministic demo data across test runs. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDate(year: number, monthZero: number, day: number): DateISO {
  return `${year}-${pad(monthZero + 1)}-${pad(day)}`;
}

function daysInMonth(year: number, monthZero: number): number {
  return new Date(year, monthZero + 1, 0).getDate();
}

/**
 * Generates ~450–520 realistic Argentine-peso and USD transactions across
 * the specified range of months. Tries to match provided categories (by default
 * IDs like `expense-supermercado` or `income-sueldo`), falling back to any active
 * category of the appropriate type.
 */
export function generateDemoTransactions(
  categories: readonly Category[],
  options: DemoOptions = {}
): Transaction[] {
  const monthsCount = options.months ?? 12;
  const seed = options.seed ?? 42;
  const today = options.today ?? new Date();

  const rng = mulberry32(seed);

  const activeExpenses = categories.filter((c) => c.type === 'expense' && !c.archived);
  const activeIncomes = categories.filter((c) => c.type === 'income' && !c.archived);

  if (activeExpenses.length === 0 || activeIncomes.length === 0) {
    return [];
  }

  const byId = new Map(categories.map((c) => [c.id, c]));

  const pickCategory = (type: 'income' | 'expense', preferredId?: string): Category => {
    if (preferredId) {
      const found = byId.get(preferredId);
      if (found !== undefined && found.type === type && !found.archived) {
        return found;
      }
    }
    const pool = type === 'income' ? activeIncomes : activeExpenses;
    const index = Math.floor(rng() * pool.length);
    const chosen = pool[index];
    if (chosen !== undefined) return chosen;
    const fallback = pool[0];
    if (fallback !== undefined) return fallback;
    throw new Error('No categories available');
  };

  const randInt = (min: number, max: number): number => {
    return Math.floor(rng() * (max - min + 1)) + min;
  };

  const results: Transaction[] = [];
  let counter = 1;

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  for (let offset = monthsCount - 1; offset >= 0; offset -= 1) {
    const targetDate = new Date(currentYear, currentMonth - offset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const maxDaysInMonth = daysInMonth(year, month);
    const isCurrentMonth = year === currentYear && month === currentMonth;
    const maxDay = isCurrentMonth ? Math.min(currentDay, maxDaysInMonth) : maxDaysInMonth;

    if (maxDay < 1) continue;

    const push = (
      type: 'income' | 'expense',
      preferredId: string,
      day: number,
      amountMinor: number,
      note?: string,
      currency: 'ARS' | 'USD' = 'ARS',
      exchangeRate?: number
    ) => {
      const clampedDay = Math.min(Math.max(1, day), maxDay);
      const date = formatDate(year, month, clampedDay);
      const category = pickCategory(type, preferredId);
      const nowTs = new Date(`${date}T12:00:00.000Z`).getTime() + counter;

      results.push({
        id: `demo-${String(counter).padStart(5, '0')}`,
        type,
        amountMinor,
        currency,
        categoryId: category.id,
        date,
        note,
        exchangeRate,
        createdAt: nowTs,
        updatedAt: nowTs
      });
      counter += 1;
    };

    // Sueldo (day 1-5) $350.000 - $550.000 (minor cents: 35.000.000 - 55.000.000)
    push(
      'income',
      'income-sueldo',
      randInt(1, Math.min(5, maxDay)),
      randInt(35000000, 55000000),
      'Sueldo mensual'
    );

    // Freelance / Extras (30% chance)
    if (rng() < 0.35) {
      push(
        'income',
        'income-freelance',
        randInt(10, Math.min(22, maxDay)),
        randInt(4000000, 18000000),
        'Proyecto independiente'
      );
    }

    // Fixed monthly expenses
    push('expense', 'expense-alquiler', 5, 38000000, 'Alquiler departamento');
    push('expense', 'expense-expensas', 10, 5200000, 'Expensas');
    push('expense', 'expense-servicios', 12, randInt(800000, 1800000), 'Luz y gas');
    push(
      'expense',
      'expense-servicios',
      15,
      randInt(1200000, 2200000),
      'Internet y telefonía'
    );

    // Subscriptions
    push('expense', 'expense-suscripciones', 3, randInt(30000, 80000), 'Spotify');
    push('expense', 'expense-suscripciones', 8, randInt(80000, 200000), 'Netflix');
    push(
      'expense',
      'expense-suscripciones',
      18,
      1500,
      'Servidor VPS',
      'USD',
      randInt(1380, 1520)
    );

    // Ahorro
    push(
      'expense',
      'expense-ahorro',
      20,
      randInt(2000000, 6000000),
      'Fondo de emergencia'
    );

    // Supermercado (~5 visits)
    for (let s = 1; s <= 5; s += 1) {
      const day = Math.floor((maxDay / 5) * s) - randInt(0, 2);
      push(
        'expense',
        'expense-supermercado',
        day,
        randInt(1200000, 5800000),
        'Compras del mes'
      );
    }

    // Transporte (~12 trips)
    for (let t = 1; t <= 12; t += 1) {
      const day = Math.floor((maxDay / 12) * t);
      const isGasoline = rng() < 0.2;
      push(
        'expense',
        'expense-transporte',
        day,
        isGasoline ? randInt(2500000, 4500000) : randInt(30000, 120000),
        isGasoline ? 'Carga de combustible' : 'Subte / Colectivo'
      );
    }

    // Ocio / Salidas (~6 visits)
    for (let o = 1; o <= 6; o += 1) {
      const day = Math.floor((maxDay / 6) * o);
      push(
        'expense',
        'expense-ocio',
        day,
        randInt(150000, 1200000),
        'Restaurante / Cine'
      );
    }

    // Otros (~3 entries)
    for (let ot = 1; ot <= 3; ot += 1) {
      const day = Math.floor((maxDay / 3) * ot);
      push('expense', 'expense-otros', day, randInt(50000, 400000), 'Gasto vario');
    }

    // Alternating bi-monthly expenses
    if (offset % 2 === 0) {
      push(
        'expense',
        'expense-salud',
        14,
        randInt(800000, 3500000),
        'Farmacia / Consulta'
      );
    }
    if (offset % 3 === 0) {
      push(
        'expense',
        'expense-educacion',
        16,
        randInt(1500000, 4000000),
        'Cursos y libros'
      );
    }
    if (offset % 4 === 0) {
      push(
        'expense',
        'expense-impuestos',
        22,
        randInt(3000000, 8000000),
        'Patente / Inmobiliario'
      );
    }
  }

  return results;
}
