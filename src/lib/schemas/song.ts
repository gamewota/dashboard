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

export const ImportedNoteSchema = z.object({
  type: z.enum(['tap', 'hold']),
  time: z.number(),
  lane: z.number().optional(),
  column: z.number().optional(),
  duration: z.number().optional(),
});

export const ImportedBeatmapSchema = z.object({
  notes: z.array(ImportedNoteSchema),
  offset: z.number().optional(),
});

export type Beatmap = z.infer<typeof BeatmapSchema>;
export type SongDetail = z.infer<typeof SongDetailSchema>;
export type SongDetailResponse = z.infer<typeof SongDetailResponseSchema>;
export type ImportedBeatmap = z.infer<typeof ImportedBeatmapSchema>;
