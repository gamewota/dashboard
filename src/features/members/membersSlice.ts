import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';

export type MemberType = {
    id: number;
    member_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}


type MemberState = {
    data: MemberType[];
    loading: boolean;
    error: string | null;
}

const initialState: MemberState = {
    data: [],
    loading: false,
    error: null
}

export const fetchMembers = createAsyncThunk('members/fetchMembers', async () => {
    const response = await axios.get(`${API_BASE_URL}/members`);
    return response.data;
})

const membersSlice = createSlice({
    name: 'members',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchMembers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch members';
            })
    }
})

export default membersSlice.reducer;