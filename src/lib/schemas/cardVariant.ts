import { z } from 'zod';

export const CardVariantSchema = z.object({
  id: z.number(),
  variant_name: z.string(),
  variant_value: z.string(),
});

export const CardVariantArraySchema = z.array(CardVariantSchema);

export type CardVariant = z.infer<typeof CardVariantSchema>;
