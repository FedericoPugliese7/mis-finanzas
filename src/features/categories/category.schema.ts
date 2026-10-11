import { z } from 'zod';
import {
  categoryNameSchema,
  categoryIconSchema,
  categoryBudgetSchema,
  hexColorSchema,
  TransactionTypeSchema
} from '@/shared/lib/types';

export const categoryFormSchema = z.object({
  name: categoryNameSchema,
  type: TransactionTypeSchema,
  color: hexColorSchema,
  icon: categoryIconSchema,
  budgetMinor: categoryBudgetSchema
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
