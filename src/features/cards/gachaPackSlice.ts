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

export type GachaPackDetail = {
    id: number;
    name: string;
    url: string;
    cards_variant_id: number;
    rarity_id: number;
    element_id: number;
    member_id: number;
    element_name: string;
    member_name: string;
    variant_name: string;
    rarity_name: string;
}

type GachaPackState = {
    list: GachaPack[];
    details: GachaPackDetail[];
    loading: boolean;
    error: string | null;
}

const initialState: GachaPackState = {
    list: [],
    details: [],
    loading: false,
    error: null
}

export const fetchGachaPacks = createAsyncThunk('gachaPacks/fetchGachaPacks', async () => {
    const response = await axios.get(`${API_BASE_URL}/gacha/prices`);
    return response.data;
})

export const fetchGachaPackById = createAsyncThunk('gachaPacks/fetchGachaPackById', async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/gacha/prices/${id}`);
    return response.data;
})

export const fetchGachaPacksDetail = createAsyncThunk('gachaPacks/fetchGachaPacksDetail', async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/cards/gacha-pack/${id}`);
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
                state.list = action.payload;
            })
            .addCase(fetchGachaPacks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch gacha packs';
            })
            .addCase(fetchGachaPackById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGachaPackById.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchGachaPackById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch gacha pack';
            })
            .addCase(fetchGachaPacksDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGachaPacksDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.details = action.payload;
            })
            .addCase(fetchGachaPacksDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch gacha pack details';
            });
    }
})

export default gachaPackSlice.reducer;