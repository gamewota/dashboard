import { z } from 'zod';

export const NewsTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const NewsTypeArraySchema = z.array(NewsTypeSchema);
export type NewsType = z.infer<typeof NewsTypeSchema>;
