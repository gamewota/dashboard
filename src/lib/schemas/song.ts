import { z } from 'zod';

export const BeatmapSchema = z.object({
  id: z.number().optional(),
  difficulty_name: z.string(),
  beatmap_asset_key: z.string(),
  beatmap_asset_url: z.string().url(),
});

export const SongDetailSchema = z.object({
  song_id: z.number(),
  element_id: z.number(),
  song_title: z.string(),
  reff_start: z.number().nonnegative(),
  reff_end: z.number().nonnegative(),
  reff_duration: z.number().nonnegative(),
  audio_duration: z.number().nonnegative().optional(),
  artwork_url: z.string().url(),
  audio_url: z.string().url(),
  video_url: z.string().url(),
  artwork_asset_key: z.string(),
  audio_asset_key: z.string(),
  video_asset_key: z.string(),
  beatmaps: z.array(BeatmapSchema),
});

export const SongDetailResponseSchema = z.object({
  message: z.string(),
  data: SongDetailSchema,
});

export type Beatmap = z.infer<typeof BeatmapSchema>;
export type SongDetail = z.infer<typeof SongDetailSchema>;
export type SongDetailResponse = z.infer<typeof SongDetailResponseSchema>;
