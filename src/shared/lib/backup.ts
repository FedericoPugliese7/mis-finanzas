import {
  BackupSchema,
  type Backup,
  type Category,
  type RecurringTemplate,
  type Settings,
  type Transaction
} from './types';

export const BACKUP_SCHEMA_VERSION = 2;

/** A file that could not be understood as a valid backup (message is user-facing). */
export class BackupParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupParseError';
  }
}

/** Builds the exportable payload from the current data. Pure. */
export function createBackup(
  transactions: readonly Transaction[],
  categories: readonly Category[],
  recurringTemplates: readonly RecurringTemplate[],
  settings: Settings,
  exportedAt: Date = new Date()
): Backup {
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: exportedAt.toISOString(),
    transactions: [...transactions],
    categories: [...categories],
    recurringTemplates: [...recurringTemplates],
    settings
  };
}

/**
 * Parses raw file content into a `Backup`, validating with zod.
 * Never trusts `JSON.parse` output; the error message is shown to the user.
 */
export function parseBackup(raw: string): Backup {
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new BackupParseError('El archivo no es un JSON válido.');
  }

  const result = BackupSchema.safeParse(payload);
  if (!result.success) {
    const issue = result.error.issues[0];
    if (issue === undefined) {
      throw new BackupParseError('El archivo no es un backup válido.');
    }
    const path = issue.path.length > 0 ? issue.path.join('.') : 'archivo';
    throw new BackupParseError(
      `El backup no es válido (campo «${path}»: ${issue.message}).`
    );
  }
  return result.data;
}

export type ImportMode = 'merge' | 'replace';

export interface ImportCounts {
  transactions: number;
  transactionsSkipped: number;
  categories: number;
  categoriesSkipped: number;
  recurringTemplates: number;
  recurringTemplatesSkipped: number;
}

export interface ImportPlan {
  mode: ImportMode;
  /** Records to write (put). In `merge` mode only the new ones. */
  transactions: Transaction[];
  categories: Category[];
  recurringTemplates: RecurringTemplate[];
  /** Settings to apply; `null` keeps the current ones (merge mode). */
  settings: Settings | null;
  counts: ImportCounts;
}

export interface CurrentData {
  transactions: readonly Transaction[];
  categories: readonly Category[];
  recurringTemplates: readonly RecurringTemplate[];
}

/**
 * Pure import strategy:
 * - `merge`: keeps everything local, adds only records whose id is new.
 * - `replace`: wipes local data and applies the backup as-is (including settings).
 */
export function buildImportPlan(
  backup: Backup,
  current: CurrentData,
  mode: ImportMode
): ImportPlan {
  if (mode === 'replace') {
    return {
      mode,
      transactions: [...backup.transactions],
      categories: [...backup.categories],
      recurringTemplates: [...backup.recurringTemplates],
      settings: backup.settings,
      counts: {
        transactions: backup.transactions.length,
        transactionsSkipped: 0,
        categories: backup.categories.length,
        categoriesSkipped: 0,
        recurringTemplates: backup.recurringTemplates.length,
        recurringTemplatesSkipped: 0
      }
    };
  }

  const knownTransactions = new Set(current.transactions.map((tx) => tx.id));
  const knownCategories = new Set(current.categories.map((category) => category.id));
  const knownTemplates = new Set(
    current.recurringTemplates.map((template) => template.id)
  );

  const transactions: Transaction[] = [];
  let transactionsSkipped = 0;
  for (const tx of backup.transactions) {
    if (knownTransactions.has(tx.id)) {
      transactionsSkipped += 1;
    } else {
      transactions.push(tx);
    }
  }

  const categories: Category[] = [];
  let categoriesSkipped = 0;
  for (const category of backup.categories) {
    if (knownCategories.has(category.id)) {
      categoriesSkipped += 1;
    } else {
      categories.push(category);
    }
  }

  const recurringTemplates: RecurringTemplate[] = [];
  let recurringTemplatesSkipped = 0;
  for (const template of backup.recurringTemplates) {
    if (knownTemplates.has(template.id)) {
      recurringTemplatesSkipped += 1;
    } else {
      recurringTemplates.push(template);
    }
  }

  return {
    mode,
    transactions,
    categories,
    recurringTemplates,
    settings: null,
    counts: {
      transactions: transactions.length,
      transactionsSkipped,
      categories: categories.length,
      categoriesSkipped,
      recurringTemplates: recurringTemplates.length,
      recurringTemplatesSkipped
    }
  };
}

/** Download file name: `mis-finanzas-backup-2026-10-04.json`. */
export function backupFileName(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `mis-finanzas-backup-${year}-${month}-${day}.json`;
}
