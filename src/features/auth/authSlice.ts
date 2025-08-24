import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';

// --- Types ---
interface Roles {
  role: string;
  permissions: string[];
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: Roles[];
}

interface AuthState {
  message: string | null;
  token: string | null;
  user: User | null;
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
  { message: string; token: string; user: User },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/signin`, credentials);

    const { user } = response.data;

    // ✅ FE-only eligibility check
    const hasOtherRoles = user.roles.some((r: Roles) => r.role !== 'user');
    if (!hasOtherRoles) {
      return rejectWithValue('User is not eligible to login');
    }

    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
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
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ message: string; token: string; user: User }>) => {
          state.message = action.payload.message;
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.loading = false;
          state.error = null;
          localStorage.setItem('token', action.payload.token);
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Something went wrong';
      });
  },
});

// --- Exports ---
export const { logout } = authSlice.actions;
export default authSlice.reducer;
