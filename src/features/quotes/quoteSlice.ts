import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';

type Quote = {
    id: number;
    text: string;
}

type QuoteState = {
    data: Quote[];
    loading: boolean;
    error: string | null;
}

const initialState: QuoteState = {
    data: [],
    loading: false,
    error: null
}

export const fetchQuotes = createAsyncThunk('quotes/fetchQuotes', async () => {
    const response = await axios.get(`${API_BASE_URL}/quotes`);
    return response.data.data;
})

export const addQuote = createAsyncThunk('quotes/addQuote', async (newQuote: Omit<Quote, 'id'>, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/quote/add`, newQuote);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add quote');
    }
})

 const quoteSlice = createSlice({
    name: 'quotes',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchQuotes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuotes.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchQuotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch quotes';
            })
    }
 })

 export default quoteSlice.reducer;