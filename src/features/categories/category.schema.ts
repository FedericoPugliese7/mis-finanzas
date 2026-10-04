import { z } from 'zod';
import {
  categoryNameSchema,
  categoryIconSchema,
  hexColorSchema,
  TransactionTypeSchema
} from '@/shared/lib/types';

export const categoryFormSchema = z.object({
  name: categoryNameSchema,
  type: TransactionTypeSchema,
  color: hexColorSchema,
  icon: categoryIconSchema
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
