import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { SongDetailSchema, CreatedSongSchema, DifficultySchema, SavedBeatmapSchema, type SongDetail, type CreatedSong, type BeatmapUpload, type Difficulty } from '../../lib/schemas/song';
import { handleThunkError } from '../../helpers/handleThunkError';
import { validateOrReject } from '../../helpers/validateApi';
import { uploadAssetWithPresigned } from '../../helpers/uploadAsset';

// Asset type id for beatmap notes_data JSON uploads.
const BEATMAP_ASSET_TYPE_ID = 4;

export type CreateSongPayload = {
  song_title: string;
  song_asset_video_id: number;
  song_asset_audio_id: number;
  song_asset_artwork_id: number;
  element_id: number;
  reff_start?: number;
  reff_end?: number;
  reff_duration?: number;
};

type Song = {
    song_id: number;
    song_title: string;
    song_assets: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    beatmaps?: { difficulty_name: string }[];
}

type SongState = {
    data: Song[];
    loading: boolean;
    error: string | null;
    selectedSong: SongDetail | null;
    selectedSongLoading: boolean;
    selectedSongError: string | null;
    difficulties: Difficulty[];
}

const initialState: SongState = {
    data: [],
    loading: false,
    error: null,
    selectedSong: null,
    selectedSongLoading: false,
    selectedSongError: null,
    difficulties: [],
}

export const fetchSongs = createAsyncThunk('songs/fetchSongs', async () => {
    const response = await axios.get(`${API_BASE_URL}/songs`);
    return response.data.data;
})

export const fetchSongById = createAsyncThunk<
    SongDetail,
    number,
    { rejectValue: string }
>('songs/fetchSongById', async (songId, thunkAPI) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/songs/${songId}`,
            { headers: getAuthHeader() }
        );
        
        // Validate response with Zod
        const parsed = SongDetailSchema.safeParse(response.data.data);
        if (!parsed.success) {
            console.error('Song detail validation failed:', parsed.error);
            return thunkAPI.rejectWithValue('Invalid song data received from server');
        }
        
        return parsed.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch song details');
        }
        return thunkAPI.rejectWithValue('Failed to fetch song details');
    }
});

export const createSong = createAsyncThunk<
    CreatedSong,
    CreateSongPayload,
    { rejectValue: string }
>('songs/createSong', async (payload, thunkAPI) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/songs/add`,
            payload,
            { headers: getAuthHeader() }
        );
        
        // Validate response with Zod - use simpler schema for create response
        const parsed = CreatedSongSchema.safeParse(response.data.data);
        if (!parsed.success) {
            console.error('Create song validation failed:', parsed.error);
            return thunkAPI.rejectWithValue('Invalid song data received from server');
        }
        
        return parsed.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create song');
        }
        return thunkAPI.rejectWithValue('Failed to create song');
    }
});

// Fetch the difficulty options (name -> id) used to build beatmap payloads.
export const fetchDifficulties = createAsyncThunk<Difficulty[], void, { rejectValue: string }>(
    'songs/fetchDifficulties',
    async (_, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/difficulties`, { headers: getAuthHeader() });
            // Endpoint returns a bare array; tolerate an optional { data } envelope.
            const body = Array.isArray(response.data) ? response.data : response.data?.data;
            return validateOrReject(DifficultySchema.array(), body, thunkAPI) as Difficulty[];
        } catch (err) {
            return handleThunkError(err, thunkAPI);
        }
    }
);

// Add, update, or approve a beatmap, accepting a partial payload: send
// notes_data + counts to save a chart, or just is_approved to approve/reject.
// difficulty_id always travels in the body. New beatmaps are created via
// POST /beatmaps; existing ones (and approvals) are updated per-beatmap via
// PUT /beatmaps/{song_id}/{beatmap_id}. Pass `beatmapId` (from the song's
// beatmap list) to update; omit it to create. Saving a chart re-marks it
// unapproved (backend's concern).
export const saveBeatmap = createAsyncThunk<
    SongDetail,
    BeatmapUpload & { beatmapId?: number },
    { rejectValue: string }
>('songs/saveBeatmap', async ({ beatmapId, ...payload }, thunkAPI) => {
    try {
        // When saving a chart: notes_data holds the chart JSON (JSONB column),
        // and the same JSON is also uploaded as an asset (type 4) whose id is
        // carried on beatmap_assets_id.
        let body: BeatmapUpload = payload;
        if (payload.notes_data) {
            const blob = new Blob([JSON.stringify(payload.notes_data)], { type: 'application/json' });
            const filename = `beatmap_${payload.song_id}_${payload.difficulty_id}.json`;
            const asset = await uploadAssetWithPresigned(blob, filename, 'application/json', BEATMAP_ASSET_TYPE_ID);
            body = { ...payload, beatmap_assets_id: asset.id };
        }

        const response = beatmapId != null
            ? await axios.put(
                `${API_BASE_URL}/beatmaps/${payload.song_id}/${beatmapId}`,
                body,
                { headers: getAuthHeader() }
            )
            : await axios.post(
                `${API_BASE_URL}/beatmaps/add`,
                body,
                { headers: getAuthHeader() }
            );

        // The endpoint returns the saved beatmap record (not the whole song),
        // so validate that, then re-fetch the song detail to refresh the list.
        const saved = SavedBeatmapSchema.safeParse(response.data?.data ?? response.data);
        if (!saved.success) {
            console.error('Save beatmap validation failed:', saved.error);
            return thunkAPI.rejectWithValue('Invalid beatmap data received from server');
        }

        const songResponse = await axios.get(
            `${API_BASE_URL}/songs/${payload.song_id}`,
            { headers: getAuthHeader() }
        );
        const parsed = SongDetailSchema.safeParse(songResponse.data?.data ?? songResponse.data);
        if (!parsed.success) {
            return thunkAPI.rejectWithValue('Invalid song data received from server');
        }
        return parsed.data;
    } catch (err) {
        return handleThunkError(err, thunkAPI);
    }
});

export const deleteSong = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>('songs/deleteSong', async (songId, thunkAPI) => {
    try {
        await axios.delete(
            `${API_BASE_URL}/songs/${songId}`,
            { headers: getAuthHeader() }
        );
        
        return songId;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to delete song');
        }
        return thunkAPI.rejectWithValue('Failed to delete song');
    }
});

const songSlice = createSlice({
    name: 'songs',
    initialState,
    reducers: {
        clearSelectedSong: (state) => {
            state.selectedSong = null;
            state.selectedSongLoading = false;
            state.selectedSongError = null;
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchSongs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSongs.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchSongs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch songs';
            })
            .addCase(fetchSongById.pending, (state) => {
                state.selectedSongLoading = true;
                state.selectedSongError = null;
            })
            .addCase(fetchSongById.fulfilled, (state, action) => {
                state.selectedSongLoading = false;
                state.selectedSong = action.payload;
            })
            .addCase(fetchSongById.rejected, (state, action) => {
                state.selectedSongLoading = false;
                state.selectedSongError = action.payload ?? 'Failed to fetch song details';
            })
            .addCase(createSong.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSong.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift({
                    song_id: action.payload.id,
                    song_title: action.payload.song_title,
                    song_assets: action.payload.artwork_url || null,
                    created_at: action.payload.created_at || new Date().toISOString(),
                    updated_at: action.payload.updated_at || new Date().toISOString(),
                });
            })
            .addCase(createSong.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Failed to create song';
            })
            .addCase(saveBeatmap.pending, (state) => {
                state.selectedSongLoading = true;
                state.selectedSongError = null;
            })
            .addCase(saveBeatmap.fulfilled, (state, action) => {
                state.selectedSongLoading = false;
                state.selectedSong = action.payload;
            })
            .addCase(saveBeatmap.rejected, (state, action) => {
                state.selectedSongLoading = false;
                state.selectedSongError = action.payload ?? 'Failed to save beatmap';
            })
            .addCase(fetchDifficulties.fulfilled, (state, action) => {
                state.difficulties = action.payload;
            })
            .addCase(deleteSong.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSong.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter(song => song.song_id !== action.payload);
            })
            .addCase(deleteSong.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Failed to delete song';
            });
    }
})

export const { clearSelectedSong } = songSlice.actions;
export default songSlice.reducer;
