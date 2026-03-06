import { z } from 'zod';

export const BannerTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});

export type BannerType = z.infer<typeof BannerTypeSchema>;

export const CreateBannerTypeSchema = z.object({
  name: z.string(),
});

export type CreateBannerType = z.infer<typeof CreateBannerTypeSchema>;

export const UpdateBannerTypeSchema = z.object({
  name: z.string(),
});

export type UpdateBannerType = z.infer<typeof UpdateBannerTypeSchema>;
