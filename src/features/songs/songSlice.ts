import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

type Song = {
    id: number;
    song_title: string;
    song_assets: string;
    element: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

type SongState = {
    data: Song[];
    loading: boolean;
    error: string | null;
}

const initialState: SongState = {
    data: [],
    loading: false,
    error: null
}

export const fetchSongs = createAsyncThunk('songs/fetchSongs', async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/songs`);
    return response.data.data;
})

const songSlice = createSlice({
    name: 'songs',
    initialState,
    reducers: {},
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
    }
})

export default songSlice.reducer;