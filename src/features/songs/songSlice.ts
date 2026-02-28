import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { SongDetailSchema, CreatedSongSchema, type SongDetail, type CreatedSong } from '../../lib/schemas/song';

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
}

type SongState = {
    data: Song[];
    loading: boolean;
    error: string | null;
    selectedSong: SongDetail | null;
    selectedSongLoading: boolean;
    selectedSongError: string | null;
}

const initialState: SongState = {
    data: [],
    loading: false,
    error: null,
    selectedSong: null,
    selectedSongLoading: false,
    selectedSongError: null,
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
