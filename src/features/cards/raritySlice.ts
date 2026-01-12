import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';

export type RarityType = {
    id: number;
    name: string;
    probability: number;
    base_multiplier: number;
    increment_multiplier: number;
}

type RarityState = {
    data: RarityType[];
    loading: boolean;
    error: string | null;
}

const initialState: RarityState = {
    data: [],
    loading: false,
    error: null
}

export const fetchRarities = createAsyncThunk('rarities/fetchRarities', async () => {
    const response = await axios.get(`${API_BASE_URL}/rarities`);
    return response.data.data;
})

const raritySlice = createSlice({
    name: 'rarities',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchRarities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRarities.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchRarities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch rarities';
            })
    }
})

export default raritySlice.reducer;