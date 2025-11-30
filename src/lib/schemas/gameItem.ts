import { z } from 'zod';

export const GameItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  tier: z.number(),
  asset_id: z.number().nullable().optional(),
  element_id: z.number().nullable().optional(),
  game_items_type_id: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const GameItemArraySchema = z.array(GameItemSchema);
export type GameItem = z.infer<typeof GameItemSchema>;
