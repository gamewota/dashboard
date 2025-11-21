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

export const fetchGameItemsTypes = createAsyncThunk('gameItemsTypes/fetchGameItemsTypes', async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/items/types`, {
            headers: getAuthHeader()
        });

        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return thunkAPI.rejectWithValue(error.response?.data ?? String(error));
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
                state.error = action.error.message || 'Failed to fetch game items types';
            })
    }
})

export default gameItemsTypeSlice.reducer;