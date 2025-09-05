import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';


type Role = {
    id: number;
    name: string;
    description: string;
}

type AssignRole = {
    userId: number;
    roleId: number;
    grantedBy: number;
    expiresAt?: string | null;
};


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

export const assignRoles = createAsyncThunk(
    "roles/assignRoles",
    async (data: AssignRole, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem("token");
  
        // convert object → form-data string
        const formData = new URLSearchParams();
        formData.append("userId", data.userId.toString());
        formData.append("roleId", data.roleId.toString());
        formData.append("grantedBy", data.grantedBy.toString());
        formData.append("expiresAt", data.expiresAt ?? ""); // send empty string
  
        const response = await axios.post(
          `${API_BASE_URL}/rbac/user-roles`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
  
        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to assign role"
        );
      }
    }
  );

  export const deleteUserRoles = createAsyncThunk(
    "roles/deleteUserRoles",
    async (
      { roleId, userId }: { roleId: number; userId: number },
      { rejectWithValue }
    ) => {
      try {
        const token = localStorage.getItem("token");
  
        const response = await axios.delete(
          `${API_BASE_URL}/rbac/user-roles/${roleId}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        return response.data;
      } catch (error: any) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete user role"
        );
      }
    }
  );
  

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