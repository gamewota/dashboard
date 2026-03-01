import { z } from 'zod';

export const BeatmapSchema = z.object({
  id: z.number().optional(),
  difficulty_name: z.string(),
  beatmap_asset_key: z.string(),
  beatmap_asset_url: z.string().url(),
});

export const SongDetailSchema = z.object({
  song_id: z.number(),
  element_id: z.number().nullable().optional(),
  song_title: z.string(),
  reff_start: z.number().nonnegative().nullable().optional(),
  reff_end: z.number().nonnegative().nullable().optional(),
  reff_duration: z.number().nonnegative().nullable().optional(),
  audio_duration: z.number().nonnegative().optional(),
  artwork_url: z.string().url(),
  audio_url: z.string().url(),
  video_url: z.string().url().optional(),
  artwork_asset_key: z.string(),
  audio_asset_key: z.string(),
  video_asset_key: z.string(),
  beatmaps: z.array(BeatmapSchema),
});

export const SongDetailResponseSchema = z.object({
  message: z.string(),
  data: SongDetailSchema,
});

// Schema for create song response (simpler, only returns basic fields)
// Note: API returns 'id' instead of 'song_id' for create response
export const CreatedSongSchema = z.object({
  id: z.number(),
  song_title: z.string(),
  element_id: z.number().nullable().optional(),
  reff_start: z.number().nullable().optional(),
  reff_end: z.number().nullable().optional(),
  reff_duration: z.number().nullable().optional(),
  song_asset_video_id: z.number().optional(),
  song_asset_audio_id: z.number().optional(),
  song_asset_artwork_id: z.number().optional(),
  artwork_url: z.string().optional(),
  audio_url: z.string().optional(),
  video_url: z.string().optional(),
  artwork_asset_key: z.string().optional(),
  audio_asset_key: z.string().optional(),
  video_asset_key: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().nullable().optional(),
});

export const ImportedNoteSchema = z.object({
  type: z.enum(['tap', 'hold']),
  time: z.number().nonnegative(),
  lane: z.number().optional(),
  column: z.number().optional(),
  duration: z.number().nonnegative().optional(),
});

export const ImportedBeatmapSchema = z.object({
  notes: z.array(ImportedNoteSchema),
  offset: z.number().optional(),
});

export type Beatmap = z.infer<typeof BeatmapSchema>;
export type SongDetail = z.infer<typeof SongDetailSchema>;
export type SongDetailResponse = z.infer<typeof SongDetailResponseSchema>;
export type CreatedSong = z.infer<typeof CreatedSongSchema>;
export type ImportedBeatmap = z.infer<typeof ImportedBeatmapSchema>;
