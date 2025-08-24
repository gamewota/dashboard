import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';


type Role = {
    id: number;
    name: string;
    description: string;
}


type RoleState = {
    data: Role[];
    loading: boolean;
    error: string | null;
}

const initialState: RoleState = {
    data: [],
    loading: false,
    error: null
}

export const fetchRoles = createAsyncThunk('roles/fetchRoles', async (_, thunkAPI) => {
    try {
        // get token (for example from localStorage or Redux state)
        const token = localStorage.getItem('token'); 
        // if you store it in redux: thunkAPI.getState().auth.token

        const response = await axios.get(`${API_BASE_URL}/rbac/roles`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data.data;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
});

const roleSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch roles';
            })
    }
})


export default roleSlice.reducer;