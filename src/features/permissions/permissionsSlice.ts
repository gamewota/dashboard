// src/features/permissions/permissionsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../helpers/constants";
import { getAuthHeader } from "../../helpers/getAuthHeader";
import { PermissionArraySchema, PermissionSchema, type Permission } from "../../lib/schemas/permission";
import { validateOrReject } from "../../helpers/validateApi";

type PermissionState = {
  data: Permission[];
  loading: boolean;
  error: string | null;
};

const initialState: PermissionState = {
  data: [],
  loading: false,
  error: null,
};



// ===== Thunks =====
export const fetchPermissions = createAsyncThunk<
  Permission[],
  void,
  { rejectValue: string }
>("permissions/fetchPermissions", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/rbac/permissions`, {
      headers: getAuthHeader(),
    });
    const payload = res.data?.data ?? res.data;
    return validateOrReject(PermissionArraySchema, payload, thunkAPI) as Permission[];
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err.response?.data?.message ?? "Failed to fetch permissions");
    }
    return thunkAPI.rejectWithValue(String(err));
  }
});

export const createPermission = createAsyncThunk<
  Permission,
  { name: string; description: string },
  { rejectValue: string }
>("permissions/createPermission", async (payload, thunkAPI) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/rbac/permissions`, payload, {
      headers: getAuthHeader(),
    });
    return validateOrReject(PermissionSchema, res.data?.data ?? res.data, thunkAPI) as Permission;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err.response?.data?.message ?? "Failed to create permission");
    }
    return thunkAPI.rejectWithValue(String(err));
  }
});

export const updatePermission = createAsyncThunk<
  Permission,
  { id: number; name: string; description: string },
  { rejectValue: string }
>("permissions/updatePermission", async ({ id, ...payload }, thunkAPI) => {
  try {
    const res = await axios.put(
      `${API_BASE_URL}/rbac/permissions/${id}`,
      payload,
      { headers: getAuthHeader() }
    );
    return validateOrReject(PermissionSchema, res.data?.data ?? res.data, thunkAPI) as Permission;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err.response?.data?.message ?? "Failed to update permission");
    }
    return thunkAPI.rejectWithValue(String(err));
  }
});

export const deletePermission = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("permissions/deletePermission", async (id, thunkAPI) => {
  try {
    await axios.delete(`${API_BASE_URL}/rbac/permissions/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err.response?.data?.message ?? "Failed to delete permission");
    }
    return thunkAPI.rejectWithValue(String(err));
  }
});

// ===== Slice =====
const permissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching permissions";
      })
      // create
      .addCase(createPermission.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      // update
      .addCase(updatePermission.fulfilled, (state, action) => {
        const idx = state.data.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.data[idx] = action.payload;
      })
      // delete
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.data = state.data.filter((p) => p.id !== action.payload);
      });
  },
});

export default permissionSlice.reducer;
