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
    }
})

export default gameItemsTypeSlice.reducer;