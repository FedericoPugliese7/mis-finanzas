import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['income', 'expense']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const CurrencySchema = z.enum(['ARS', 'USD']);
export type Currency = z.infer<typeof CurrencySchema>;

export const DisplayCurrencySchema = z.enum(['ARS', 'USD', 'BOTH']);
export type DisplayCurrency = z.infer<typeof DisplayCurrencySchema>;

/* ---------------------------------------------------------------------------
 * Primitivos compartidos: una sola fuente de verdad entre los esquemas de
 * dominio/backup y los formularios (evita drift de invariantes).
 * ------------------------------------------------------------------------- */
export const categoryIdSchema = z.string().min(1, 'Elegí una categoría');
export const categoryNameSchema = z
  .string()
  .trim()
  .min(1, 'Ingresá un nombre')
  .max(40, 'Usá hasta 40 caracteres');
export const hexColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i, 'Elegí un color');
export const categoryIconSchema = z.string().min(1, 'Elegí un ícono');
export const noteSchema = z.string().max(140, 'Usá hasta 140 caracteres');
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (AAAA-MM-DD)');

export type DateISO = z.infer<typeof isoDateSchema>;

export const TransactionSchema = z.object({
  id: z.string().min(1, 'Id inválido'),
  type: TransactionTypeSchema,
  amountMinor: z
    .number()
    .int('El monto debe ser un entero en centavos')
    .positive('El monto debe ser mayor a cero'),
  currency: CurrencySchema,
  categoryId: categoryIdSchema,
  date: isoDateSchema,
  note: noteSchema.optional(),
  exchangeRate: z.number().positive('La cotización debe ser mayor a cero').optional(),
  createdAt: z.number().int(),
  updatedAt: z.number().int()
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const CategorySchema = z.object({
  id: z.string().min(1, 'Id inválido'),
  name: categoryNameSchema,
  type: TransactionTypeSchema,
  color: hexColorSchema,
  icon: categoryIconSchema,
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
  schemaVersion: z.literal(1, { invalid_type_error: 'Versión de backup no soportada' }),
  exportedAt: z.string().min(1, 'Fecha de exportación inválida'),
  transactions: z.array(TransactionSchema),
  categories: z.array(CategorySchema),
  settings: SettingsSchema
});
export type Backup = z.infer<typeof BackupSchema>;
