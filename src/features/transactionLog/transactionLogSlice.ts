import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';


type transactions = {
    logId: number;
    transactionId: number;
    MDRRate: number;
    totalAmount: number;
    fromStatus: number;
    toStatus: string;
    remarks: string;
    createdAt: string;
}

type shopTransactionsState = {
    data: transactions[];
    loading: boolean;
    error: string | null;
}

const initialState: shopTransactionsState = {
    data: [],
    loading: false,
    error: null
}

export const fetchTransactionsLog = createAsyncThunk('transactions/fetchTransactionsLog', async () => {
    const response = await axios.get(`${API_BASE_URL}/user/transaction/log`);
    return response.data.data;
})

const transactionsSlice = createSlice({
    name: 'transactionsLog',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchTransactionsLog.pending, (state) => {
                state.loading = true,
                state.error = null
            })
            .addCase(fetchTransactionsLog.fulfilled, (state, action) => {
                state.loading = false,
                state.data = action.payload
            })
            .addCase(fetchTransactionsLog.rejected, (state, action) => {
                state.loading = false,
                state.error = action.error.message || 'Failed to fetch shop Transactions';
            })
    }
})

export default transactionsSlice.reducer;