import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { validateOrReject } from '../../helpers/validateApi';
import { handleThunkError } from '../../helpers/handleThunkError';
import { ProfileBannerListResponseSchema } from '../../lib/schemas/profileBanner';
import type { ProfileBanner, ProfileBannerListResponse, ProfileBannerPayload } from '../../lib/schemas/profileBanner';

interface ProfileBannerState {
  banners: ProfileBanner[];
  loading: boolean;
  error: string | null;
}

const initialState: ProfileBannerState = {
  banners: [],
  loading: false,
  error: null,
};

// Fetch all profile banners. The endpoint wraps the list in a
// { statusCode, message, banners } envelope, so validate that and unwrap.
export const fetchProfileBanners = createAsyncThunk<ProfileBanner[], void, { rejectValue: string }>(
  'profileBanners/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile-banners`, {
        headers: getAuthHeader(),
      });
      const parsed = validateOrReject(
        ProfileBannerListResponseSchema,
        response.data,
        thunkAPI,
      ) as ProfileBannerListResponse;
      return parsed.banners;
    } catch (error: unknown) {
      return handleThunkError(error, thunkAPI);
    }
  }
);

// Create a profile banner. asset_id is obtained beforehand via the presigned
// upload flow. The list is refreshed by dispatching fetchProfileBanners after.
export const createProfileBanner = createAsyncThunk<void, ProfileBannerPayload, { rejectValue: string }>(
  'profileBanners/create',
  async (payload, thunkAPI) => {
    try {
      await axios.post(`${API_BASE_URL}/profile-banners`, payload, {
        headers: getAuthHeader(),
      });
    } catch (error: unknown) {
      return handleThunkError(error, thunkAPI);
    }
  }
);

const profileBannerSlice = createSlice({
  name: 'profileBanners',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchProfileBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(createProfileBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProfileBanner.fulfilled, (state) => {
        state.loading = false;
        // List is refreshed via a subsequent fetchProfileBanners().
      })
      .addCase(createProfileBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { clearError } = profileBannerSlice.actions;
export default profileBannerSlice.reducer;
