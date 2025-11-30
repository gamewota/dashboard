import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { validateOrReject } from '../../helpers/validateApi';
import { AuthResponseSchema, type AuthResponse, type AuthUser } from '../../lib/schemas/auth';

// --- Types ---
interface AuthState {
  message: string | null;
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// --- Initial State ---
const initialState: AuthState = {
  message: null,
  token: localStorage.getItem('token'),
  user: null,
  loading: false,
  error: null,
};

// --- Thunk ---
export const login = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, thunkAPI) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/signin`, credentials);
    const payload = response.data?.data ?? response.data;

    const parsed = validateOrReject<AuthResponse>(AuthResponseSchema, payload, thunkAPI) as AuthResponse;

    // FE-only eligibility check
    const hasOtherRoles = parsed.user.roles.some((r) => r.role !== 'user');
    if (!hasOtherRoles) {
      return thunkAPI.rejectWithValue('User is not eligible to login');
    }

    return parsed;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
    }
    return thunkAPI.rejectWithValue(String(err ?? 'Login failed'));
  }
});


// --- Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.message = null;
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.message = action.payload.message;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Something went wrong';
      });
  },
});

// --- Exports ---
export const { logout } = authSlice.actions;
export default authSlice.reducer;
