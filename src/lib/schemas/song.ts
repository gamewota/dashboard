import { z } from 'zod';

export const SchemaChartNoteSchema = z.object({
  uuid: z.string(),
  songPos: z.number(),
  beat: z.number(),
  label: z.string(),
  lane: z.number().int().nonnegative(),
});

export const SchemaChartLinkSchema = z.object({
  uuid: z.string(),
  startNote: SchemaChartNoteSchema,
  endNote: SchemaChartNoteSchema,
});

export const SchemaChartSchema = z.object({
  uuid: z.string(),
  laneCount: z.number().int().positive(),
  notes: z.array(SchemaChartNoteSchema),
  links: z.array(SchemaChartLinkSchema),
});

// The chart structure stored as JSONB in notes_data. This is the same
// shape the editor exports/imports (bpm, offset, charts).
export const NotesDataSchema = z.object({
  song_id: z.number().int().nonnegative(),
  difficulty: z.string(),
  bpm: z.number().positive(),
  offset: z.number(),
  charts: z.array(SchemaChartSchema).min(1),
});

export const BeatmapSchema = z.object({
  // The API returns the primary key as `beatmap_id`; also accept `id` as a
  // fallback. Normalized to `id` below so callers use a single field.
  id: z.number().optional(),
  beatmap_id: z.number().optional(),
  difficulty_name: z.string(),
  beatmap_asset_key: z.string(),
  // null while the asset hasn't been generated yet (e.g. just-saved draft).
  beatmap_asset_url: z.string().url().nullable().optional(),
  // The chart JSON (JSONB column). Editor loads from this directly.
  notes_data: NotesDataSchema.nullable().optional(),
  // Per-beatmap approval state.
  is_approved: z.boolean().optional(),
}).transform(({ beatmap_id, id, ...rest }) => ({
  ...rest,
  id: id ?? beatmap_id,
}));

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

export const ImportedBeatmapSchema = z.object({
  bpm: z.number().positive(),
  offset: z.number(),
  charts: z.array(SchemaChartSchema).min(1),
});

// A difficulty option from GET /difficulties (name -> id resolution).
export const DifficultySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

// Payload sent to the backend when adding/updating/approving a beatmap.
// Only the fields that need changing are sent (partial). For approval,
// send just { song_id, difficulty_id, is_approved }.
export const BeatmapUploadSchema = z.object({
  song_id: z.number().int().nonnegative(),
  difficulty_id: z.number().int().positive(),
  notes_data: NotesDataSchema.optional(),
  // Id of the uploaded notes_data JSON asset (asset type 4).
  beatmap_assets_id: z.number().int().positive().optional(),
  note_count: z.number().int().nonnegative().optional(),
  hold_count: z.number().int().nonnegative().optional(),
  max_combo: z.number().int().nonnegative().optional(),
  is_approved: z.boolean().optional(),
});

// Response returned by POST/PUT /beatmaps — the saved beatmap record.
// notes_data is loosely typed (passthrough) since we only need the metadata here.
export const SavedBeatmapSchema = z.object({
  id: z.number().int().positive(),
  song_id: z.number().int().nonnegative(),
  difficulty_id: z.number().int().positive(),
  difficulty: z.string().optional(),
  beatmap_asset_url: z.string().nullable().optional(),
  note_count: z.number().int().nonnegative().optional(),
  hold_count: z.number().int().nonnegative().optional(),
  max_combo: z.number().int().nonnegative().optional(),
  is_approved: z.boolean().optional(),
}).passthrough();

export type SavedBeatmap = z.infer<typeof SavedBeatmapSchema>;

export type Beatmap = z.infer<typeof BeatmapSchema>;
export type SongDetail = z.infer<typeof SongDetailSchema>;
export type SongDetailResponse = z.infer<typeof SongDetailResponseSchema>;
export type CreatedSong = z.infer<typeof CreatedSongSchema>;
export type ImportedBeatmap = z.infer<typeof ImportedBeatmapSchema>;
export type BeatmapUpload = z.infer<typeof BeatmapUploadSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
export type NotesData = z.infer<typeof NotesDataSchema>;
export type SchemaChartNote = z.infer<typeof SchemaChartNoteSchema>;
export type SchemaChartLink = z.infer<typeof SchemaChartLinkSchema>;
export type SchemaChart = z.infer<typeof SchemaChartSchema>;
