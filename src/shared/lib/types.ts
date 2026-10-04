import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['income', 'expense']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const CurrencySchema = z.enum(['ARS', 'USD']);
export type Currency = z.infer<typeof CurrencySchema>;

export const DisplayCurrencySchema = z.enum(['ARS', 'USD', 'BOTH']);
export type DisplayCurrency = z.infer<typeof DisplayCurrencySchema>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  type: TransactionTypeSchema,
  amountMinor: z.number().int(),
  currency: CurrencySchema,
  categoryId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  note: z.string().optional(),
  exchangeRate: z.number().positive().optional(),
  createdAt: z.number().int(),
  updatedAt: z.number().int()
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: TransactionTypeSchema,
  color: z.string(),
  icon: z.string(),
  isDefault: z.boolean(),
  archived: z.boolean()
});
export type Category = z.infer<typeof CategorySchema>;

export const ThemeSchema = z.enum(['light', 'dark', 'system']);
export type Theme = z.infer<typeof ThemeSchema>;

export const RateSourceSchema = z.enum(['manual', 'dolarapi']);
export type RateSource = z.infer<typeof RateSourceSchema>;

export const SettingsSchema = z.object({
  theme: ThemeSchema,
  displayCurrency: DisplayCurrencySchema,
  referenceRate: z.number().positive(),
  rateSource: RateSourceSchema
});
export type Settings = z.infer<typeof SettingsSchema>;

export const BackupSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  transactions: z.array(TransactionSchema),
  categories: z.array(CategorySchema),
  settings: SettingsSchema
});
export type Backup = z.infer<typeof BackupSchema>;
