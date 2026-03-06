import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { handleThunkError } from '../../helpers/handleThunkError';
import { BannerTypeSchema, type BannerType } from '../../lib/schemas/bannerType';
import { validateOrReject } from '../../helpers/validateApi';

export type BannerTypeItem = BannerType;

type BannerTypeState = {
    data: BannerTypeItem[];
    loading: boolean;
    error: string | null;
}

const initialState: BannerTypeState = {
    data: [],
    loading: false,
    error: null
}

export const fetchBannerTypes = createAsyncThunk<BannerType[], void, { rejectValue: string }>(
    'bannerTypes/fetchBannerTypes',
    async (_, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/banner-types`, {
                headers: getAuthHeader()
            });

            return validateOrReject(BannerTypeSchema.array(), response.data, thunkAPI) as BannerType[];
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

export const fetchBannerTypeById = createAsyncThunk<BannerType, number, { rejectValue: string }>(
    'bannerTypes/fetchBannerTypeById',
    async (id, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/banner-types/${id}`, {
                headers: getAuthHeader()
            });

            return validateOrReject(BannerTypeSchema, response.data, thunkAPI) as BannerType;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

export const createBannerType = createAsyncThunk<BannerType, { name: string }, { rejectValue: string }>(
    'bannerTypes/createBannerType',
    async (payload, thunkAPI) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/banner-types`, {
                name: payload.name,
            }, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });

            return validateOrReject(BannerTypeSchema, response.data, thunkAPI) as BannerType;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

export const updateBannerType = createAsyncThunk<BannerType, { id: number; name: string }, { rejectValue: string }>(
    'bannerTypes/updateBannerType',
    async (payload, thunkAPI) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/banner-types/${payload.id}`, {
                name: payload.name,
            }, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });

            return validateOrReject(BannerTypeSchema, response.data, thunkAPI) as BannerType;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

export const deleteBannerType = createAsyncThunk<number, number, { rejectValue: string }>(
    'bannerTypes/deleteBannerType',
    async (id, thunkAPI) => {
        try {
            await axios.delete(`${API_BASE_URL}/banner-types/${id}`, {
                headers: getAuthHeader()
            });
            return id;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

export const bannerTypeSlice = createSlice({
    name: 'bannerTypes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBannerTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBannerTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchBannerTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? 'Failed to fetch banner types';
            })
            .addCase(fetchBannerTypeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBannerTypeById.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.data.findIndex((t) => t.id === action.payload.id);
                if (idx >= 0) state.data[idx] = action.payload;
                else state.data.push(action.payload);
            })
            .addCase(fetchBannerTypeById.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? 'Failed to fetch banner type';
            })
            .addCase(createBannerType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBannerType.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
            })
            .addCase(createBannerType.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? 'Failed to create banner type';
            })
            .addCase(updateBannerType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBannerType.fulfilled, (state, action) => {
                state.loading = false;
                const idx = state.data.findIndex((t) => t.id === action.payload.id);
                if (idx >= 0) state.data[idx] = action.payload;
                else state.data.push(action.payload);
            })
            .addCase(updateBannerType.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? 'Failed to update banner type';
            })
            .addCase(deleteBannerType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBannerType.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter((t) => t.id !== action.payload);
            })
            .addCase(deleteBannerType.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? 'Failed to delete banner type';
            });
    }
});

export default bannerTypeSlice.reducer;
