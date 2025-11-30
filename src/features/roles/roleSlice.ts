import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../helpers/constants';
import { getAuthHeader } from '../../helpers/getAuthHeader';
import { RoleArraySchema, type Role } from '../../lib/schemas/role';
import { validateOrReject } from '../../helpers/validateApi';

type AssignRole = {
    userId: number;
    roleId: number;
    grantedBy: number;
    expiresAt?: string | null;
};

type AssignPermissionToRole = {
  roleId: number;
  permissionId: number;
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

export const fetchRoles = createAsyncThunk<Role[], void, { rejectValue: string }>(
  'roles/fetchRoles',
  async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rbac/role-permissions`, {
      headers: getAuthHeader()
    });

    const raw = response.data?.data ?? response.data;

    if (!Array.isArray(raw)) {
      return thunkAPI.rejectWithValue('Invalid role-permissions response');
    }

    // Defensive filter: accept items that look like { role: { id, name, description }, permission: { id, name, description } }
    const rolePermissions = raw.filter((it) => {
      if (!it || typeof it !== 'object') return false;
      const obj = it as Record<string, unknown>;
      const role = obj['role'] as Record<string, unknown> | undefined;
      const permission = obj['permission'] as Record<string, unknown> | undefined;
      return (
        !!role && typeof role['id'] === 'number' && typeof role['name'] === 'string' &&
        !!permission && typeof permission['id'] === 'number' && typeof permission['name'] === 'string'
      );
    }) as Array<{ role: Role; permission: { id: number; name: string; description: string } }>;

    if (rolePermissions.length === 0) {
      return thunkAPI.rejectWithValue('No role-permission entries returned');
    }

    // Group roles and attach permissions
    const roleMap: Record<number, Role> = {};

    rolePermissions.forEach((item) => {
      const { role, permission } = item;

      if (!roleMap[role.id]) {
        roleMap[role.id] = {
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: [],
        };
      }

      roleMap[role.id].permissions.push({
        id: permission.id,
        name: permission.name,
        description: permission.description,
      });
    });

    // Convert to array and validate shape
    const roles = Object.values(roleMap);
    const parsed = validateOrReject(RoleArraySchema, roles, thunkAPI);
    if (!parsed || !Array.isArray(parsed)) {
      const msg = typeof parsed === 'string' ? parsed : 'Invalid roles shape';
      return thunkAPI.rejectWithValue(msg);
    }

    return parsed as Role[];
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(err.response?.data ?? String(err));
    }
    return thunkAPI.rejectWithValue(String(err));
  }
});


export const assignRoles = createAsyncThunk(
    "roles/assignRoles",
    async (data: AssignRole, { rejectWithValue }) => {
      try {
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
              ...getAuthHeader(),
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );  
        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          return rejectWithValue(error.response?.data?.message ?? "Failed to assign role");
        }
        return rejectWithValue(String(error));
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
        const response = await axios.delete(
          `${API_BASE_URL}/rbac/user-roles/${roleId}/${userId}`,
          {
            headers: getAuthHeader(),
          }
        );  
        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          return rejectWithValue(error.response?.data?.message ?? "Failed to delete user role");
        }
        return rejectWithValue(String(error));
      }
    }
  );

  export const assignPermissionToRole = createAsyncThunk(
    "roles/assignPermissionToRole",
    async (data: AssignPermissionToRole, { rejectWithValue}) => {
      try {
  const formData = new URLSearchParams();
        formData.append("roleId", data.roleId.toString());
        formData.append("permissionId", data.permissionId.toString());

        const response = await axios.post(
          `${API_BASE_URL}/rbac/role-permissions`,
          formData,
          {
            headers: {
              ...getAuthHeader(),
              "Content-Type": "application/x-www-form-urlencoded",
            }
          }
        )
        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          return rejectWithValue(error.response?.data?.message ?? "Failed to assign permission to role");
        }
        return rejectWithValue(String(error));
      }
    }
  )

  export const removePermissionFromRole = createAsyncThunk(
    "roles/removePermissionFromRole",
    async (data: AssignPermissionToRole, { rejectWithValue}) => {
      try {
  const formData = new URLSearchParams();
        formData.append("roleId", data.roleId.toString());
        formData.append("permissionId", data.permissionId.toString());

        const response = await axios.delete(
          `${API_BASE_URL}/rbac/role-permissions`, 
          {
            headers: {
              ...getAuthHeader(),
              "Content-Type": "application/x-www-form-urlencoded",
            },
            data: formData
          }
        )

        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          return rejectWithValue(error.response?.data?.message ?? "Failed to remove permission from role");
        }
        return rejectWithValue(String(error));
      }
    }
  )
  
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