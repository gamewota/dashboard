import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';

export type CurrencyType = {
  id: number;
  name: string;
  code?: string;
}

type CurrencyState = {
  data: CurrencyType[];
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyState = {
  data: [],
  loading: false,
  error: null,
}

export const fetchCurrencies = createAsyncThunk('currencies/fetchCurrencies', async () => {
  const response = await axios.get(`${API_BASE_URL}/currency`);
  // some APIs wrap result in data.data, fall back to data
  return response.data?.data ?? response.data;
});

const currencySlice = createSlice({
  name: 'currencies',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCurrencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch currencies';
      })
  }
});

export default currencySlice.reducer;
