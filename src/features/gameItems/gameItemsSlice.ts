import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';

type GameItemsType = {
    id: number;
    name: string;
    description: string;
    tier: number;
    asset_id: number;
    element_id: number;
    game_items_type_id: number;
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

export const fetchGameItems = createAsyncThunk('gameItems/fetchGameItems', async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/items`, {
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

const gameItemsSlice = createSlice({
    name: 'gameItems',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchGameItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
            )
            .addCase(fetchGameItems.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchGameItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch game items types';
            })
    }
})

export default gameItemsSlice.reducer;