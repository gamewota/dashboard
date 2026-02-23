import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { SongDetailSchema, type SongDetail } from '../../lib/schemas/song';

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
            });
    }
})

export const { clearSelectedSong } = songSlice.actions;
export default songSlice.reducer;
