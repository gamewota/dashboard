import { z } from 'zod';

export const ShopItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  price: z.number(),
  currency: z.string(),
  description: z.string(),
  stock: z.number(),
  isVisible: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});

export const ShopItemArraySchema = z.array(ShopItemSchema);

export type ShopItem = z.infer<typeof ShopItemSchema>;
