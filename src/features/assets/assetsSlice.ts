import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { AssetArraySchema, AssetSchema, type Asset } from '../../lib/schemas/asset';
import { validateOrReject } from '../../helpers/validateApi';

export type AssetItem = {
  id: number;
  asset_type_id: number;
  assets_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type AssetsState = {
  data: AssetItem[];
  loading: boolean;
  error: string | null;
};

const initialState: AssetsState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchAssets = createAsyncThunk<Asset[], void, { rejectValue: string }>(
  'assets/fetchAssets',
  async (_, thunkAPI) => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/assets`, { headers: getAuthHeader() });
      return validateOrReject(AssetArraySchema, resp.data, thunkAPI) as Asset[];
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const respData = err.response?.data;
        const message = typeof respData === 'string' ? respData : (respData && typeof respData === 'object' ? (respData.message ?? JSON.stringify(respData)) : String(err));
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue(String(err));
    }
  }
);

export const fetchAssetById = createAsyncThunk<Asset, number, { rejectValue: string }>(
  'assets/fetchAssetById',
  async (id, thunkAPI) => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/assets/${id}`, { headers: getAuthHeader() });
      return validateOrReject(AssetSchema, resp.data, thunkAPI) as Asset;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const respData = err.response?.data;
        const message = typeof respData === 'string' ? respData : (respData && typeof respData === 'object' ? (respData.message ?? JSON.stringify(respData)) : String(err));
        return thunkAPI.rejectWithValue(message);
      }
      return thunkAPI.rejectWithValue(String(err));
    }
  }
);

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string | undefined) ?? action.error.message ?? 'Failed to fetch assets';
      });
    builder
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        // merge or replace single asset into data array
        const idx = state.data.findIndex((a) => a.id === action.payload.id);
        if (idx >= 0) {
          state.data[idx] = action.payload;
        } else {
          state.data.push(action.payload);
        }
      });
  },
});

export default assetsSlice.reducer;
