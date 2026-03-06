import { z } from 'zod';

// Base banner schema (for create/update responses that may not include banner_type_name)
export const BannerBaseSchema = z.object({
  id: z.number(),
  name: z.string(),
  banner_type_id: z.number(),
  asset_id: z.number(),
  gacha_pack_id: z.number().nullable(),
  event_id: z.number().nullable(),
  action_url: z.string().nullable(),
  start_at: z.string(),
  end_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});

// Banner schema for list responses (includes banner_type_name)
export const BannerSchema = BannerBaseSchema.extend({
  banner_type_name: z.string(),
});

export type Banner = z.infer<typeof BannerSchema>;

// Song details for event-based banners
const SongDetailsSchema = z.object({
  id: z.number(),
  song_title: z.string(),
  song_asset_video_url: z.string(),
  song_asset_audio_url: z.string(),
  song_asset_artwork_url: z.string(),
  reff_start: z.number(),
  reff_end: z.number(),
  reff_duration: z.number(),
});

const EventDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  songs: z.array(SongDetailsSchema),
});

// Card details for gacha pack banners
const CardDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  rarity_id: z.number(),
  element_id: z.number(),
  member_id: z.number(),
  effective_probability: z.number(),
});

const GachaPackDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  currency_id: z.number().nullable(),
  item_id: z.number(),
  cards: z.array(CardDetailsSchema),
});

// Banner detail schema with type-specific details
export const BannerDetailSchema = BannerSchema.extend({
  event_details: EventDetailsSchema.optional(),
  gacha_pack_details: GachaPackDetailsSchema.optional(),
});

export type BannerDetail = z.infer<typeof BannerDetailSchema>;

// Create/Update payload schema
export const BannerPayloadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  banner_type_id: z.number().min(1, 'Banner type is required'),
  asset_id: z.number().min(1, 'Asset is required'),
  start_at: z.string().min(1, 'Start date is required'),
  end_at: z.string().min(1, 'End date is required'),
  gacha_pack_id: z.number().optional(),
  event_id: z.number().optional(),
  action_url: z.string().optional(),
});

export type BannerPayload = z.infer<typeof BannerPayloadSchema>;
