import { z } from 'zod';

export const AssetTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional(),
});

export const AssetTypeArraySchema = z.object({
  asset_types: z.array(AssetTypeSchema),
});

export type AssetType = z.infer<typeof AssetTypeSchema>;
