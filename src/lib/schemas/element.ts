import { z } from 'zod';

export const ElementSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ElementArraySchema = z.array(ElementSchema);

export type Element = z.infer<typeof ElementSchema>;
