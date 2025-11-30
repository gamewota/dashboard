import { z } from 'zod';

export const GameItemsTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GameItemsTypeArraySchema = z.array(GameItemsTypeSchema);

export type GameItemsType = z.infer<typeof GameItemsTypeSchema>;
