import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { handleThunkError } from '../../helpers/handleThunkError';

export type NewsTypeItem = {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

type NewsTypeState = {
    data: NewsTypeItem[];
    loading: boolean;
    error: string | null;
}

const initialState: NewsTypeState = {
    data: [],
    loading: false,
    error: null
}

export const fetchNewsTypes = createAsyncThunk<NewsTypeItem[], void, { rejectValue: string }>(
    'newsTypes/fetchNewsTypes',
    async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/news/types`, {
            headers: getAuthHeader()
        });

        return response.data;
    }
    catch (error: unknown) {
        return handleThunkError(error, thunkAPI);
    }
})

export const createNewsType = createAsyncThunk<NewsTypeItem, { name: string; description?: string }, { rejectValue: string }>(
    'newsTypes/createNewsType',
    async (payload, thunkAPI) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/news/types`, {
                name: payload.name,
                description: payload.description,
            }, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });

            return response.data;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
)

export const updateNewsType = createAsyncThunk<NewsTypeItem, { id: number; name: string; description?: string }, { rejectValue: string }>(
    'newsTypes/updateNewsType',
    async (payload, thunkAPI) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/news/types/${payload.id}`, {
                name: payload.name,
                description: payload.description,
            }, { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } });

            return response.data;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
)


export const deleteNewsType = createAsyncThunk<number, number, { rejectValue: string }>(
    'newsTypes/deleteNewsType',
    async (id, thunkAPI) => {
        try {
            await axios.delete(`${API_BASE_URL}/news/types/${id}`, {
                headers: getAuthHeader()
            });
            return id;
        } catch (error: unknown) {
            return handleThunkError(error, thunkAPI);
        }
    }
);

export const newsTypeSlice = createSlice({
    name: 'newsTypes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNewsTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNewsTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchNewsTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch news types';
            })
            .addCase(createNewsType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewsType.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
            })
            .addCase(createNewsType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create news type';
            });
    }
});

export default newsTypeSlice.reducer;