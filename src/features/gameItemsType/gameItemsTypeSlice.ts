import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';

type GameItemsType = {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

type GameItemsTypeState = {
    data: GameItemsType[];
    loading: boolean;
    error: string | null;
}

const initialState: GameItemsTypeState = {
    data: [],
    loading: false,
    error: null
}

export const fetchGameItemsTypes = createAsyncThunk<GameItemsType[], void, { rejectValue: string }>(
    'gameItemsTypes/fetchGameItemsTypes',
    async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/items/types`, {
            headers: getAuthHeader()
        });

        return response.data;
    } catch (error: unknown) {
        // Ensure we always return a string payload when rejecting so the rejectValue type is consistent
        if (axios.isAxiosError(error)) {
            const respData = error.response?.data;
            const payload = typeof respData === 'string'
                ? respData
                : (respData && typeof respData === 'object')
                    ? (respData.message ?? JSON.stringify(respData))
                    : String(error);
            return thunkAPI.rejectWithValue(payload);
        }
    return thunkAPI.rejectWithValue(String(error));
    }
})

export const createGameItemsType = createAsyncThunk<GameItemsType, { name: string; description?: string }, { rejectValue: string }>(
    'gameItemsTypes/createGameItemsType',
    async (payload, thunkAPI) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/items/types`, {
                name: payload.name,
                description: payload.description,
            }, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });

            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const respData = error.response?.data;
                const message = typeof respData === 'string' ? respData : (respData && typeof respData === 'object' ? (respData.message ?? JSON.stringify(respData)) : String(error));
                return thunkAPI.rejectWithValue(message);
            }
            return thunkAPI.rejectWithValue(String(error));
        }
    }
);

export const updateGameItemsType = createAsyncThunk<GameItemsType, { id: number; name: string; description?: string }, { rejectValue: string }>(
    'gameItemsTypes/updateGameItemsType',
    async (payload, thunkAPI) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/items/types/${payload.id}`, {
                name: payload.name,
                description: payload.description,
            }, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });

            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const respData = error.response?.data;
                const message = typeof respData === 'string' ? respData : (respData && typeof respData === 'object' ? (respData.message ?? JSON.stringify(respData)) : String(error));
                return thunkAPI.rejectWithValue(message);
            }
            return thunkAPI.rejectWithValue(String(error));
        }
    }
);

export const deleteGameItemsType = createAsyncThunk<{ id: number }, number, { rejectValue: string }>(
    'gameItemsTypes/deleteGameItemsType',
    async (id, thunkAPI) => {
        try {
            await axios.delete(`${API_BASE_URL}/items/types/${id}`, { headers: getAuthHeader() });
            return { id };
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const respData = error.response?.data;
                const message = typeof respData === 'string' ? respData : (respData && typeof respData === 'object' ? (respData.message ?? JSON.stringify(respData)) : String(error));
                return thunkAPI.rejectWithValue(message);
            }
            return thunkAPI.rejectWithValue(String(error));
        }
    }
);

const gameItemsTypeSlice = createSlice({
    name: 'gameItemsTypes',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchGameItemsTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
            )
            .addCase(fetchGameItemsTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchGameItemsTypes.rejected, (state, action) => {
                state.loading = false;
                // Prefer server-provided message via rejectWithValue (action.payload), fall back to action.error.message
                state.error = (action.payload as string | undefined) ?? action.error.message ?? 'Unknown error';
            })
            .addCase(createGameItemsType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGameItemsType.fulfilled, (state) => {
                state.loading = false;
                // UI will refetch
            })
            .addCase(createGameItemsType.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string | undefined) ?? action.error.message ?? 'Failed to create game item type';
            })
            .addCase(updateGameItemsType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateGameItemsType.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateGameItemsType.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string | undefined) ?? action.error.message ?? 'Failed to update game item type';
            })
            .addCase(deleteGameItemsType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteGameItemsType.fulfilled, (state, action) => {
                state.loading = false;
                // remove deleted id locally if present
                state.data = state.data.filter((t) => t.id !== action.payload.id);
            })
            .addCase(deleteGameItemsType.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string | undefined) ?? action.error.message ?? 'Failed to delete game item type';
            })
    }
})

export default gameItemsTypeSlice.reducer;