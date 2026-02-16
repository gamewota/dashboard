import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { type AxiosResponse } from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import type { RootState } from '../../store';

export type MemberType = {
    id: number;
    jkt48_member_id: number | null;
    member_name: string;
    name: string | null;
    stage_name: string | null;
    profile_url: string | null;
    birth_date: string | null;
    blood_type: string | null;
    zodiac: string | null;
    height: string | null;
    current_photo_url: string | null;
    current_photo_filename: string | null;
    photo_last_updated_at: string | null;
    last_scraped_at: string | null;
    scrape_error: string | null;
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

export const fetchMembers = createAsyncThunk<MemberType[], void, { rejectValue: string }>('members/fetchMembers', async (_, thunkAPI) => {
    try {
        const response: AxiosResponse<MemberType[]> = await axios.get(`${API_BASE_URL}/members`);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const data = error.response?.data;
            let message: string;
            if (typeof data === 'string') {
                message = data;
            } else if (data && typeof data === 'object' && 'message' in data) {
                message = String((data as { message: unknown }).message);
            } else if (data !== undefined) {
                message = JSON.stringify(data);
            } else {
                message = String(error);
            }
            return thunkAPI.rejectWithValue(message);
        }
        return thunkAPI.rejectWithValue(String(error));
    }
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
                state.error = action.payload ?? action.error.message ?? 'Failed to fetch members';
            })
    }
})

export const selectMembers = (state: RootState) => state.members.data
export const selectMembersLoading = (state: RootState) => state.members.loading
export const selectMembersError = (state: RootState) => state.members.error

export default membersSlice.reducer;