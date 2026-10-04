import Dexie, { type Table } from 'dexie';
import type { Category, Settings, Transaction } from '@/shared/lib/types';

export const DB_NAME = 'mis-finanzas';
export const SETTINGS_ID = 'general';

/** Single settings row (`Settings` + its primary key). */
export type SettingsRecord = Settings & { id: string };

export const defaultSettings: Settings = {
  theme: 'system',
  displayCurrency: 'ARS',
  referenceRate: 1000,
  rateSource: 'manual'
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
    color: '#6366f1',
    icon: 'house',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-expensas',
    name: 'Expensas',
    type: 'expense',
    color: '#8b5cf6',
    icon: 'building-2',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-supermercado',
    name: 'Supermercado',
    type: 'expense',
    color: '#f59e0b',
    icon: 'shopping-cart',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-transporte',
    name: 'Transporte',
    type: 'expense',
    color: '#0ea5e9',
    icon: 'bus',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-servicios',
    name: 'Servicios',
    type: 'expense',
    color: '#14b8a6',
    icon: 'lightbulb',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-impuestos',
    name: 'Impuestos',
    type: 'expense',
    color: '#64748b',
    icon: 'landmark',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-salud',
    name: 'Salud',
    type: 'expense',
    color: '#f43f5e',
    icon: 'heart-pulse',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-ocio',
    name: 'Ocio',
    type: 'expense',
    color: '#ec4899',
    icon: 'ticket',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-suscripciones',
    name: 'Suscripciones',
    type: 'expense',
    color: '#a855f7',
    icon: 'refresh-cw',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-educacion',
    name: 'Educación',
    type: 'expense',
    color: '#3b82f6',
    icon: 'graduation-cap',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-ahorro',
    name: 'Ahorro/Inversión',
    type: 'expense',
    color: '#22c55e',
    icon: 'piggy-bank',
    isDefault: true,
    archived: false
  },
  {
    id: 'expense-otros',
    name: 'Otros',
    type: 'expense',
    color: '#94a3b8',
    icon: 'circle-help',
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
    color: '#94a3b8',
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
  settings!: Table<SettingsRecord, string>;

  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      transactions: 'id, date, categoryId, [type+date], createdAt',
      categories: 'id, type, name',
      settings: 'id'
    });

    // Runs only the first time the database is created.
    this.on('populate', (trans) => {
      trans.table<Category, string>('categories').bulkPut(defaultCategories);
      trans.table<SettingsRecord, string>('settings').put({
        id: SETTINGS_ID,
        ...defaultSettings
      });
    });
  }
}

export const db = new AppDatabase();
