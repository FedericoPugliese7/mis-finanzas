import { z } from 'zod';
import { CurrencySchema, TransactionTypeSchema } from '@/shared/lib/types';

export const transactionFormSchema = z.object({
  type: TransactionTypeSchema,
  amountMinor: z
    .number({ invalid_type_error: 'Ingresá un monto' })
    .int('Usá como máximo 2 decimales')
    .positive('El monto debe ser mayor a cero')
    .nullable()
    // Explicit `boolean` return: TS 5.5+ would otherwise infer a type
    // predicate (`value is number`) and zod would drop `null` from the output.
    .refine((value): boolean => value !== null, 'Ingresá un monto'),
  currency: CurrencySchema,
  categoryId: z.string().min(1, 'Elegí una categoría'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  note: z.string().max(140, 'Usá hasta 140 caracteres').optional(),
  exchangeRate: z
    .number({ invalid_type_error: 'Cotización inválida' })
    .positive('La cotización debe ser mayor a cero')
    .nullable()
    .optional()
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
