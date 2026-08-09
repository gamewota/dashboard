import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { API_BASE_URL } from '../../helpers/constants';
import { handleThunkError } from '../../helpers/handleThunkError';
import { validateOrReject } from '../../helpers/validateApi';
import {
    GachaPackDetailSchema,
    PityRuleRowSchema,
    type GachaPackDetail,
    type GachaPackUpdateInput,
    type PityRuleCreateInput,
    type PityRuleRow,
} from '../../lib/schemas/gachaPack';
import type { RootState } from '../../store';

export type GachaPack = {
    id: number;
    name: string;
    price: number;
    currency_id?: number;
    currency_name?: string;
    item_id?: number;
    item_name?: string;
    card_count?: number;
    sort_order?: number;
    is_active?: boolean;
    active_start_at?: string | null;
    active_end_at?: string | null;
    featured_card_id?: number | null;
    pity_rules?: { triggerCount: number; guaranteedRarityId: number }[];
}

export type GachaPackPayload = {
    name: string;
    price: number;
    currencyId?: number;
    itemId?: number;
}

export type UpdateGachaPackArgs = {
    id: number;
    changes: GachaPackUpdateInput;
}

export type CreatePityRuleArgs = {
    gachaPackId: number;
    rule: PityRuleCreateInput;
}

type GachaPackState = {
    list: GachaPack[];
    detail: GachaPackDetail | null;
    pityRules: PityRuleRow[];
    pack: GachaPack | null;
    listLoading: boolean;
    packLoading: boolean;
    detailsLoading: boolean;
    updating: boolean;
    pityLoading: boolean;
    error: string | null;
}

const initialState: GachaPackState = {
    list: [],
    detail: null,
    pityRules: [],
    pack: null,
    listLoading: false,
    packLoading: false,
    detailsLoading: false,
    updating: false,
    pityLoading: false,
    error: null
}

export const fetchGachaPacks = createAsyncThunk<GachaPack[], void, { rejectValue: string }>(
    'gachaPacks/fetchGachaPacks',
    async (_, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/gacha/prices`, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
    })

export const fetchGachaPackById = createAsyncThunk<GachaPack, number, { rejectValue: string }>(
    'gachaPacks/fetchGachaPackById',
    async (id, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/gacha/prices/${id}`, { headers: getAuthHeader() });
            return response.data;
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
    })

/**
 * Pack detail including per-card weight + effective probability, pity rules and
 * listing config. Replaces the old `GET /cards/gacha-pack/:id` fetch, which did
 * not return weights or the featured card.
 */
export const fetchGachaPackDetail = createAsyncThunk<GachaPackDetail, number, { rejectValue: string }>(
    'gachaPacks/fetchGachaPackDetail',
    async (id, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/gacha/gacha-pack/${id}`, { headers: getAuthHeader() });
            return validateOrReject(GachaPackDetailSchema, response.data, thunkAPI) as GachaPackDetail;
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
    })

export const createGachaPack = createAsyncThunk<GachaPack, GachaPackPayload, { rejectValue: string }>(
    'gachaPacks/createGachaPack',
    async (payload, thunkAPI) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/gacha/create-gacha-pack`, payload, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });
            return response.data;
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
    })

/** Partial update of pack config: listing window, sort order, featured card, price, pity rules. */
export const updateGachaPack = createAsyncThunk<GachaPackDetail, UpdateGachaPackArgs, { rejectValue: string }>(
    'gachaPacks/updateGachaPack',
    async ({ id, changes }, thunkAPI) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/gacha/gacha-pack/${id}`, changes, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });
            return validateOrReject(GachaPackDetailSchema, response.data, thunkAPI) as GachaPackDetail;
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
    })

export const fetchPityRules = createAsyncThunk<PityRuleRow[], number, { rejectValue: string }>(
    'gachaPacks/fetchPityRules',
    async (gachaPackId, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/gacha/pity-rules/${gachaPackId}`, { headers: getAuthHeader() });
            return validateOrReject(PityRuleRowSchema.array(), response.data, thunkAPI) as PityRuleRow[];
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
    })

export const createPityRule = createAsyncThunk<PityRuleRow, CreatePityRuleArgs, { rejectValue: string }>(
    'gachaPacks/createPityRule',
    async ({ gachaPackId, rule }, thunkAPI) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/gacha/pity-rules/${gachaPackId}`, rule, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });
            return validateOrReject(PityRuleRowSchema, response.data, thunkAPI) as PityRuleRow;
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
    })

/**
 * The API exposes no per-rule DELETE, so a deletion is expressed as a PATCH that
 * replaces the pack's whole pity-rule set with the remaining rules.
 */
export const replacePityRules = createAsyncThunk<GachaPackDetail, { gachaPackId: number; rules: PityRuleCreateInput[] }, { rejectValue: string }>(
    'gachaPacks/replacePityRules',
    async ({ gachaPackId, rules }, thunkAPI) => {
        try {
            const response = await axios.patch(
                `${API_BASE_URL}/gacha/gacha-pack/${gachaPackId}`,
                { pityRules: rules },
                { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } },
            );
            return validateOrReject(GachaPackDetailSchema, response.data, thunkAPI) as GachaPackDetail;
        } catch (error) {
            return handleThunkError(error, thunkAPI);
        }
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
                state.error = action.payload ?? action.error.message ?? 'Failed to fetch gacha packs';
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
                state.error = action.payload ?? action.error.message ?? 'Failed to fetch gacha pack';
            })
            .addCase(fetchGachaPackDetail.pending, (state) => {
                state.detailsLoading = true;
                state.error = null;
            })
            .addCase(fetchGachaPackDetail.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.detail = action.payload;
            })
            .addCase(fetchGachaPackDetail.rejected, (state, action) => {
                state.detailsLoading = false;
                state.error = action.payload ?? action.error.message ?? 'Failed to fetch gacha pack details';
            })
            .addCase(updateGachaPack.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateGachaPack.fulfilled, (state, action) => {
                state.updating = false;
                state.detail = action.payload;
            })
            .addCase(updateGachaPack.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload ?? action.error.message ?? 'Failed to update gacha pack';
            })
            .addCase(fetchPityRules.pending, (state) => {
                state.pityLoading = true;
                state.error = null;
            })
            .addCase(fetchPityRules.fulfilled, (state, action) => {
                state.pityLoading = false;
                state.pityRules = action.payload;
            })
            .addCase(fetchPityRules.rejected, (state, action) => {
                state.pityLoading = false;
                state.error = action.payload ?? action.error.message ?? 'Failed to fetch pity rules';
            })
            .addCase(createPityRule.pending, (state) => {
                state.pityLoading = true;
                state.error = null;
            })
            .addCase(createPityRule.fulfilled, (state, action) => {
                state.pityLoading = false;
                state.pityRules = [...state.pityRules, action.payload];
            })
            .addCase(createPityRule.rejected, (state, action) => {
                state.pityLoading = false;
                state.error = action.payload ?? action.error.message ?? 'Failed to create pity rule';
            })
            .addCase(replacePityRules.pending, (state) => {
                state.pityLoading = true;
                state.error = null;
            })
            .addCase(replacePityRules.fulfilled, (state, action) => {
                state.pityLoading = false;
                state.detail = action.payload;
            })
            .addCase(replacePityRules.rejected, (state, action) => {
                state.pityLoading = false;
                state.error = action.payload ?? action.error.message ?? 'Failed to update pity rules';
            });
    }
})

export const selectGachaPacks = (state: RootState) => state.gachaPack.list;
export const selectGachaPack = (state: RootState) => state.gachaPack.pack;
export const selectGachaPackDetail = (state: RootState) => state.gachaPack.detail;
export const selectGachaPackCards = (state: RootState) => state.gachaPack.detail?.cards ?? [];
export const selectGachaPackPityRules = (state: RootState) => state.gachaPack.pityRules;
export const selectGachaPacksListLoading = (state: RootState) => state.gachaPack.listLoading;
export const selectGachaPackLoading = (state: RootState) => state.gachaPack.packLoading;
export const selectGachaPackDetailsLoading = (state: RootState) => state.gachaPack.detailsLoading;
export const selectGachaPackUpdating = (state: RootState) => state.gachaPack.updating;
export const selectGachaPackPityLoading = (state: RootState) => state.gachaPack.pityLoading;
export const selectGachaPackError = (state: RootState) => state.gachaPack.error;

export default gachaPackSlice.reducer;
