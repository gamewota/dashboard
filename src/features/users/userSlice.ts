import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

type User = {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    is_verified: boolean;
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
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`);
    console.log(import.meta.env)
    console.log('response', response)
    return response.data.data;
})


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
    }
})

export default userSlice.reducer;

