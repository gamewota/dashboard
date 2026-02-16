import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { API_BASE_URL } from '../../helpers/constants';
import type { RootState } from '../../store';


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

export type GachaPackPayload = {
    name: string;
    price: number;
    currencyId?: number;
    itemId?: number;
}

type GachaPackState = {
    list: GachaPack[];
    details: GachaPackDetail[];
    pack: GachaPack | null;
    listLoading: boolean;
    packLoading: boolean;
    detailsLoading: boolean;
    error: string | null;
}

const initialState: GachaPackState = {
    list: [],
    details: [],
    pack: null,
    listLoading: false,
    packLoading: false,
    detailsLoading: false,
    error: null
}

export const fetchGachaPacks = createAsyncThunk<GachaPack[], void>('gachaPacks/fetchGachaPacks', async () => {
    const response = await axios.get(`${API_BASE_URL}/gacha/prices`);
    return response.data;
})

export const fetchGachaPackById = createAsyncThunk<GachaPack, number>('gachaPacks/fetchGachaPackById', async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/gacha/prices/${id}`);
    return response.data;
})

export const fetchGachaPacksDetail = createAsyncThunk<GachaPackDetail[], number>('gachaPacks/fetchGachaPacksDetail', async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/cards/gacha-pack/${id}`);
    return response.data;
})

export const createGachaPack = createAsyncThunk<GachaPack, GachaPackPayload>('gachaPacks/createGachaPack', async (payload: GachaPackPayload) => {
    const response = await axios.post(`${API_BASE_URL}/gacha/create-gacha-pack`, payload, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });
    return response.data;
})

const gachaPackSlice = createSlice({
    name: 'gachaPacks',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchGachaPacks.pending, (state) => {
                state.listLoading = true;
                state.error = null;
            })
            .addCase(fetchGachaPacks.fulfilled, (state, action) => {
                state.listLoading = false;
                state.list = action.payload;
            })
            .addCase(fetchGachaPacks.rejected, (state, action) => {
                state.listLoading = false;
                state.error = action.error.message || 'Failed to fetch gacha packs';
            })
            .addCase(fetchGachaPackById.pending, (state) => {
                state.packLoading = true;
                state.error = null;
            })
            .addCase(fetchGachaPackById.fulfilled, (state, action) => {
                state.packLoading = false;
                state.pack = action.payload;
            })
            .addCase(fetchGachaPackById.rejected, (state, action) => {
                state.packLoading = false;
                state.error = action.error.message || 'Failed to fetch gacha pack';
            })
            .addCase(fetchGachaPacksDetail.pending, (state) => {
                state.detailsLoading = true;
                state.error = null;
            })
            .addCase(fetchGachaPacksDetail.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.details = action.payload;
            })
            .addCase(fetchGachaPacksDetail.rejected, (state, action) => {
                state.detailsLoading = false;
                state.error = action.error.message || 'Failed to fetch gacha pack details';
            });
    }
})

export const selectGachaPacks = (state: RootState) => state.gachaPack.list;
export const selectGachaPack = (state: RootState) => state.gachaPack.pack;
export const selectGachaPackDetails = (state: RootState) => state.gachaPack.details;
export const selectGachaPacksListLoading = (state: RootState) => state.gachaPack.listLoading;
export const selectGachaPackLoading = (state: RootState) => state.gachaPack.packLoading;
export const selectGachaPackDetailsLoading = (state: RootState) => state.gachaPack.detailsLoading;
export const selectGachaPackError = (state: RootState) => state.gachaPack.error;

export default gachaPackSlice.reducer;