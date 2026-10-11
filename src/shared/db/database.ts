import Dexie, { type Table } from 'dexie';
import type { Category, RecurringTemplate, Settings, Transaction } from '@/shared/lib/types';

export const DB_NAME = 'mis-finanzas';
export const SETTINGS_ID = 'general';

/** Single settings row (`Settings` + its primary key). */
export type SettingsRecord = Settings & { id: string };

export const defaultSettings: Settings = {
  theme: 'system',
  displayCurrency: 'ARS',
  referenceRate: 1000,
  rateSource: 'dolarapi'
};

/**
 * Default categories from SPEC → 4.3. Ids are stable strings (not uuids) so
 * seeding is idempotent and imports can be deduplicated by id.
 */
export const defaultCategories: readonly Category[] = [
  {
    id: 'expense-alquiler',
    name: 'Alquiler',
    type: 'expense',
    color: '#a34f1b',
    icon: 'house',
    budgetMinor: 38_000_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-expensas',
    name: 'Expensas',
    type: 'expense',
    color: '#0e6258',
    icon: 'building-2',
    budgetMinor: 5_200_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-supermercado',
    name: 'Supermercado',
    type: 'expense',
    color: '#f59e0b',
    icon: 'shopping-cart',
    budgetMinor: 15_000_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-transporte',
    name: 'Transporte',
    type: 'expense',
    color: '#3e6b85',
    icon: 'bus',
    budgetMinor: 2_000_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-servicios',
    name: 'Servicios',
    type: 'expense',
    color: '#14b8a6',
    icon: 'lightbulb',
    budgetMinor: 2_500_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-impuestos',
    name: 'Impuestos',
    type: 'expense',
    color: '#6b665e',
    icon: 'landmark',
    budgetMinor: 5_000_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-salud',
    name: 'Salud',
    type: 'expense',
    color: '#f43f5e',
    icon: 'heart-pulse',
    budgetMinor: 1_500_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-ocio',
    name: 'Ocio',
    type: 'expense',
    color: '#ec4899',
    icon: 'ticket',
    budgetMinor: 4_000_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-suscripciones',
    name: 'Suscripciones',
    type: 'expense',
    color: '#6b7a3a',
    icon: 'refresh-cw',
    budgetMinor: 300_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-educacion',
    name: 'Educación',
    type: 'expense',
    color: '#33587f',
    icon: 'graduation-cap',
    budgetMinor: 2_000_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-ahorro',
    name: 'Ahorro/Inversión',
    type: 'expense',
    color: '#22c55e',
    icon: 'piggy-bank',
    budgetMinor: 5_000_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-otros',
    name: 'Otros',
    type: 'expense',
    color: '#9b958a',
    icon: 'circle-help',
    budgetMinor: 1_000_000,
    isDefault: true,
    archived: false
  },
  {
    id: 'income-sueldo',
    name: 'Sueldo',
    type: 'income',
    color: '#10b981',
    icon: 'briefcase',
    isDefault: true,
    archived: false
  },
  {
    id: 'income-freelance',
    name: 'Freelance',
    type: 'income',
    color: '#06b6d4',
    icon: 'laptop',
    isDefault: true,
    archived: false
  },
  {
    id: 'income-otros',
    name: 'Otros',
    type: 'income',
    color: '#9b958a',
    icon: 'circle-help',
    isDefault: true,
    archived: false
  }
];

/**
 * Dexie schema.
 *
 * Note: IndexedDB cannot index booleans, so `archived` lives in the record
 * (filtered in memory — categories are few) and is not part of the indexes.
 */
export class AppDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  recurringTemplates!: Table<RecurringTemplate, string>;
  settings!: Table<SettingsRecord, string>;

  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      transactions: 'id, date, categoryId, [type+date], createdAt',
      categories: 'id, type, name',
      settings: 'id'
    });

    this.version(2).stores({
      transactions: 'id, date, categoryId, [type+date], createdAt',
      categories: 'id, type, name',
      settings: 'id'
    }).upgrade(async (trans) => {
      // Patch existing default categories with the new monthly budgets.
      const categoriesTable = trans.table<Category, string>('categories');
      const existing = await categoriesTable.toArray();
      const defaultsById = new Map(defaultCategories.map((category) => [category.id, category]));
      for (const category of existing) {
        const defaults = defaultsById.get(category.id);
        if (defaults !== undefined && category.budgetMinor == null) {
          await categoriesTable.update(category.id, { budgetMinor: defaults.budgetMinor });
        }
      }
    });

    this.version(3).stores({
      transactions: 'id, date, categoryId, [type+date], createdAt',
      categories: 'id, type, name',
      recurringTemplates: 'id, categoryId',
      settings: 'id'
    });

    // Runs only the first time the database is created.
    this.on('populate', (trans) => {
      trans.table<Category, string>('categories').bulkPut([...defaultCategories]);
      trans.table<SettingsRecord, string>('settings').put({
        id: SETTINGS_ID,
        ...defaultSettings
      });
    });
  }
}

export const db = new AppDatabase();
