import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';

export type Card = {
    id: number;
    name: string;
    url: string;
    element_name: string;
    variant_name: string;
    rarity_name: string;
}

type CardState = {
    data: Card[];
    loading: boolean;
    error: string | null;
}

const initialState: CardState = {
    data: [],
    loading: false,
    error: null
}

export const fetchCards = createAsyncThunk('cards/fetchCards', async () => {
    const response = await axios.get(`${API_BASE_URL}/cards`);
    return response.data;
})

const cardSlice = createSlice({
    name: 'cards',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchCards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCards.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchCards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch cards';
            })
    }
})

export default cardSlice.reducer;