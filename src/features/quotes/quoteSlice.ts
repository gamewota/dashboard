import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/quotes`);
    return response.data.data;
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