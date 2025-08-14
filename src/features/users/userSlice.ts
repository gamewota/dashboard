import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';

type User = {
    user_id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    access_token: string;
    profile_created_at: string;
    profile_updated_at: string;
    profile_deleted_at: string | null;
    is_verified: boolean;
    unbanned_at: string | null;
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

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
    const response = await axios.get(`${API_BASE_URL}/users`);
    console.log('data', response.data.data)
    return response.data.data;
})

export const banUser = createAsyncThunk('users/banUser', async (data: BanUser, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/user/ban`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to ban user');
    }
})

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId: number, { rejectWithValue }) => {
      try {
        await axios.delete(`${API_BASE_URL}/users/${userId}`);
        return userId; // just return the ID so we can filter it out
      } catch (error: any) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to delete user'
        );
      }
    }
  );
  


const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
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

export default userSlice.reducer;

