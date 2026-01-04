import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';


export type GachaPack = {
    id: number;
    name: string;
    price: number;
    currency_id?: number;
    currency_name?: string;
    item_id?: number;
    item_name?: string;
}

type GachaPackState = {
    data: GachaPack[];
    loading: boolean;
    error: string | null;
}

const initialState: GachaPackState = {
    data: [],
    loading: false,
    error: null
}

export const fetchGachaPacks = createAsyncThunk('gachaPacks/fetchGachaPacks', async () => {
    const response = await axios.get(`${API_BASE_URL}/gacha/prices`);
    return response.data;
})

const gachaPackSlice = createSlice({
    name: 'gachaPacks',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchGachaPacks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGachaPacks.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchGachaPacks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch gacha packs';
            })
    }
})

export default gachaPackSlice.reducer;