import { z } from 'zod';
import { TransactionTypeSchema } from '@/shared/lib/types';

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Ingresá un nombre').max(40, 'Usá hasta 40 caracteres'),
  type: TransactionTypeSchema,
  color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Elegí un color'),
  icon: z.string().min(1, 'Elegí un ícono')
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
