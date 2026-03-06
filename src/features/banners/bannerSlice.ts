import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { validateOrReject } from '../../helpers/validateApi';
import { handleThunkError } from '../../helpers/handleThunkError';
import { BannerSchema, BannerBaseSchema, BannerDetailSchema } from '../../lib/schemas/banner';
import type { Banner, BannerDetail, BannerPayload } from '../../lib/schemas/banner';

interface BannerState {
  banners: Banner[];
  activeBanners: Banner[];
  currentBanner: BannerDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: BannerState = {
  banners: [],
  activeBanners: [],
  currentBanner: null,
  loading: false,
  error: null,
};

// Fetch all banners
export const fetchBanners = createAsyncThunk<Banner[], void, { rejectValue: string }>(
  'banners/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banners`, {
        headers: getAuthHeader()
      });
      return validateOrReject(BannerSchema.array(), response.data, thunkAPI) as Banner[];
    } catch (error: unknown) {
      return handleThunkError(error, thunkAPI);
    }
  }
);

// Fetch active banners
export const fetchActiveBanners = createAsyncThunk<Banner[], void, { rejectValue: string }>(
  'banners/fetchActive',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banners/active`, {
        headers: getAuthHeader()
      });
      return validateOrReject(BannerSchema.array(), response.data, thunkAPI) as Banner[];
    } catch (error: unknown) {
      return handleThunkError(error, thunkAPI);
    }
  }
);

// Fetch banner details
export const fetchBannerById = createAsyncThunk<BannerDetail, number, { rejectValue: string }>(
  'banners/fetchById',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banners/${id}`, {
        headers: getAuthHeader()
      });
      return validateOrReject(BannerDetailSchema, response.data, thunkAPI) as BannerDetail;
    } catch (error: unknown) {
      return handleThunkError(error, thunkAPI);
    }
  }
);

// Create banner
export const createBanner = createAsyncThunk<Banner, BannerPayload, { rejectValue: string }>(
  'banners/create',
  async (payload, thunkAPI) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/banners`, payload, {
        headers: getAuthHeader()
      });
      // Use BannerBaseSchema for create response as it may not include banner_type_name
      return validateOrReject(BannerBaseSchema, response.data, thunkAPI) as Banner;
    } catch (error: unknown) {
      return handleThunkError(error, thunkAPI);
    }
  }
);

// Update banner
export const updateBanner = createAsyncThunk<
  Banner,
  { id: number; payload: BannerPayload },
  { rejectValue: string }
>(
  'banners/update',
  async ({ id, payload }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/banners/${id}`, payload, {
        headers: getAuthHeader()
      });
      // Use BannerBaseSchema for update response as it may not include banner_type_name
      return validateOrReject(BannerBaseSchema, response.data, thunkAPI) as Banner;
    } catch (error: unknown) {
      return handleThunkError(error, thunkAPI);
    }
  }
);

// Delete banner
export const deleteBanner = createAsyncThunk<number, number, { rejectValue: string }>(
  'banners/delete',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_BASE_URL}/banners/${id}`, {
        headers: getAuthHeader()
      });
      return id;
    } catch (error: unknown) {
      return handleThunkError(error, thunkAPI);
    }
  }
);

const bannerSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {
    clearCurrentBanner: (state) => {
      state.currentBanner = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all banners
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
      // Fetch active banners
      .addCase(fetchActiveBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBanners = action.payload;
      })
      .addCase(fetchActiveBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
      // Fetch banner by ID
      .addCase(fetchBannerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBannerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBanner = action.payload;
      })
      .addCase(fetchBannerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
      // Create banner
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBanner.fulfilled, (state) => {
        state.loading = false;
        // Don't update state array - let subsequent fetchBanners() handle it
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
      // Update banner
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state) => {
        state.loading = false;
        // Don't update state array - let subsequent fetchBanners() handle it
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
      // Delete banner
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = state.banners.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { clearCurrentBanner, clearError } = bannerSlice.actions;
export default bannerSlice.reducer;
