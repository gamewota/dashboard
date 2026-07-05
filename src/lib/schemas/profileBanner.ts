import { z } from 'zod';

// Shape of a single profile banner row (joined with its asset for image_url).
export const ProfileBannerSchema = z.object({
  id: z.number(),
  name: z.string(),
  asset_id: z.number(),
  image_url: z.string(),
  is_default: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProfileBanner = z.infer<typeof ProfileBannerSchema>;

// Envelope returned by GET /profile-banners.
export const ProfileBannerListResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  banners: z.array(ProfileBannerSchema),
});

export type ProfileBannerListResponse = z.infer<typeof ProfileBannerListResponseSchema>;

// Payload sent to POST /profile-banners. asset_id comes from the presigned
// upload flow.
export const ProfileBannerPayloadSchema = z.object({
  name: z.string().min(1),
  asset_id: z.number().int().positive(),
  is_default: z.boolean(),
});

export type ProfileBannerPayload = z.infer<typeof ProfileBannerPayloadSchema>;
