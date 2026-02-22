import { z } from 'zod';

export const BeatmapSchema = z.object({
  difficulty_name: z.string(),
  beatmap_asset_key: z.string(),
  beatmap_asset_url: z.string(),
});

export const SongDetailSchema = z.object({
  song_id: z.number(),
  element_id: z.number(),
  song_title: z.string(),
  reff_start: z.number(),
  reff_end: z.number(),
  reff_duration: z.number(),
  artwork_url: z.string(),
  audio_url: z.string(),
  video_url: z.string(),
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
