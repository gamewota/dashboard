import { z } from 'zod';

export const AssetSchema = z.object({
  id: z.number(),
  asset_type_id: z.number(),
  assets_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});

export const AssetArraySchema = z.array(AssetSchema);
export type Asset = z.infer<typeof AssetSchema>;
