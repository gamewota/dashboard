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

export const updateElement = createAsyncThunk(
    'elements/updateElement',
    async (payload: { id: number; name: string; description?: string }, thunkAPI) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/elements/${payload.id}`, {
                name: payload.name,
                description: payload.description,
            }, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });

            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return thunkAPI.rejectWithValue(error.response?.data ?? String(error));
            }
            return thunkAPI.rejectWithValue(String(error));
        }
    }
);

export const deleteElement = createAsyncThunk(
    'elements/deleteElement',
    async (id: number, thunkAPI) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/elements/${id}`, { headers: getAuthHeader() });
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return thunkAPI.rejectWithValue(error.response?.data ?? String(error));
            }
            return thunkAPI.rejectWithValue(String(error));
        }
    }
);

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
            .addCase(updateElement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateElement.fulfilled, (state) => {
                state.loading = false;
                // ideally API returns updated element or message; we'll refetch on UI side
            })
            .addCase(updateElement.rejected, (state, action) => {
                state.loading = false;
                const payload = action.payload as { message?: string } | string | undefined;
                state.error = (typeof payload === 'object' && payload?.message) || (typeof payload === 'string' ? payload : action.error.message) || 'Failed to update element';
            })
            .addCase(deleteElement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteElement.fulfilled, (state) => {
                state.loading = false;
                // refetch happens on UI
            })
            .addCase(deleteElement.rejected, (state, action) => {
                state.loading = false;
                const payload = action.payload as { message?: string } | string | undefined;
                state.error = (typeof payload === 'object' && payload?.message) || (typeof payload === 'string' ? payload : action.error.message) || 'Failed to delete element';
            })
    }
})

export default elementSlice.reducer;