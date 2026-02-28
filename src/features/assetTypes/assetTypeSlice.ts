import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { AssetTypeArraySchema, type AssetType } from '../../lib/schemas/assetType';

type AssetTypeState = {
  data: AssetType[];
  loading: boolean;
  error: string | null;
};

const initialState: AssetTypeState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchAssetTypes = createAsyncThunk<AssetType[], void, { rejectValue: string }>(
  'assetTypes/fetchAssetTypes',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/asset-types`, {
        headers: getAuthHeader(),
      });
      
      // Validate response with Zod
      const parsed = AssetTypeArraySchema.safeParse(response.data);
      if (!parsed.success) {
        return thunkAPI.rejectWithValue('Invalid asset types data received from server');
      }
      
      return parsed.data.asset_types;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch asset types');
      }
      return thunkAPI.rejectWithValue('Failed to fetch asset types');
    }
  }
);

const assetTypeSlice = createSlice({
  name: 'assetTypes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAssetTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch asset types';
      });
  },
});

export default assetTypeSlice.reducer;
