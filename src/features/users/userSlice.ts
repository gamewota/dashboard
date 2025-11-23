import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';

type UserRole = {
    role_id: number;
    role_name: string;
    role_description: string;
    granted_by: number;
    expires_at: string | null;
    granted_at: string;
};

type User = {
    user_id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    profile_created_at: string;
    profile_updated_at: string;
    profile_deleted_at: string | null;
    is_verified: boolean;
    unbanned_at: string | null;
    roles: UserRole[];
}

type BanUser = {
    userId: string;
    days: string;
}

type UserState = {
    data: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    data: [],
    loading: false,
    error: null,
};

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            headers: getAuthHeader()
        });

        return response.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return thunkAPI.rejectWithValue(error.response?.data ?? String(error));
        }
        return thunkAPI.rejectWithValue(String(error));
    }
})

export const banUser = createAsyncThunk('users/banUser', async (data: BanUser, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/user/ban`, data);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return rejectWithValue(error.response?.data?.message ?? 'Failed to ban user');
        }
        return rejectWithValue(String(error));
    }
})

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId: number, { rejectWithValue }) => {
      try {
        await axios.delete(`${API_BASE_URL}/users/${userId}`);
        return userId; // just return the ID so we can filter it out
                    } catch (error: unknown) {
                        if (axios.isAxiosError(error)) {
                            return rejectWithValue(error.response?.data?.message ?? 'Failed to delete user');
                        }
                        return rejectWithValue(String(error));
                    }
    }
  );
  


const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        updateUserRoles: (state, action) => {
    const { userId, roles } = action.payload;
    const user = state.data.find(u => u.user_id === userId);
    if (user) {
      user.roles = roles;
    }
  }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch users';
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.data = state.data.filter(
                (user) => user.user_id !== action.payload
                );
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
})

export const { updateUserRoles } = userSlice.actions;
export default userSlice.reducer;

