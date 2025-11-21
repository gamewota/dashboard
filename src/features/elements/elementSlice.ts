import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';

type Element = {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

type ElementState = {
    data: Element[];
    loading: boolean;
    error: string | null;
}

const initialState: ElementState = {
    data: [],
    loading: false,
    error: null
}

export const fetchElements = createAsyncThunk('elements/fetchElements', async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/elements`, {
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

const elementSlice = createSlice({
    name: 'elements',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchElements.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
            )
            .addCase(fetchElements.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchElements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch elements';
            })
    }
})

export default elementSlice.reducer;