import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


type shopTransactions = {
    id: number;
    quantity: number;
    total_price: number;
    currency: string;
    status: string;
    username: string;
    item_name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

type shopTransactionsState = {
    data: shopTransactions[];
    loading: boolean;
    error: string | null;
}

const initialState: shopTransactionsState = {
    data: [],
    loading: false,
    error: null
}

export const fetchShopTransactions = createAsyncThunk('shopTransactions/fetchShopTransactions', async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/shop/transactions`);
    return response.data.data;
})

const shopTransactionsSlice = createSlice({
    name: 'shopTransactions',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchShopTransactions.pending, (state) => {
                state.loading = true,
                state.error = null
            })
            .addCase(fetchShopTransactions.fulfilled, (state, action) => {
                state.loading = false,
                state.data = action.payload
            })
            .addCase(fetchShopTransactions.rejected, (state, action) => {
                state.loading = false,
                state.error = action.error.message || 'Failed to fetch shop Transactions';
            })
    }
})

export default shopTransactionsSlice.reducer;